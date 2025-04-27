import * as tf from '@tensorflow/tfjs';
import { FaceDetection } from '@mediapipe/face_detection';
import { EmotionLabel } from '../types';

// 预训练模型配置
const FACE_DETECTION_MODEL_URL = 'https://tfhub.dev/tensorflow/tfjs-model/face_landmarks_detection/1';
// 使用本地托管的模型
const EMOTION_MODEL_URL = '/models/emotion_model/model.json';

interface FaceDetectionResult {
  detections: Array<{
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
    };
    landmarks: Array<{
      x: number;
      y: number;
      z: number;
    }>;
  }>;
}

export class FaceEmotionDetector {
  private faceDetector: FaceDetection | null = null;
  private emotionModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      console.log('Detector already initialized');
      return;
    }

    try {
      console.log('Initializing face detector...');
      
      // 设置全局 Module 对象，只包含必要的配置
      (window as any).Module = {
        locateFile: (file: string) => {
          console.log('Loading face detection file:', file);
          // 记录当前环境信息
          console.log('Environment info:', {
            isSimd: file.includes('_simd_'),
            fileType: file.split('.').pop(),
            currentPath: window.location.pathname
          });
          
          // 使用本地托管的文件
          const fileName = file.replace('_simd_', '_');
          const localPath = `/models/face_detection/${fileName}`;
          console.log('Using local file path:', localPath);
          
          // 记录文件加载状态
          fetch(localPath)
            .then(response => {
              console.log(`File ${fileName} status:`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
              });
            })
            .catch(error => {
              console.error(`Error checking file ${fileName}:`, error);
            });
            
          return localPath;
        }
      };

      // 创建新的 FaceDetection 实例
      console.log('Creating face detector instance...');
      this.faceDetector = new FaceDetection();
      console.log('Face detector instance created:', {
        hasDetector: !!this.faceDetector,
        detectorType: typeof this.faceDetector
      });

      // 设置选项
      console.log('Setting face detector options...');
      await this.faceDetector.setOptions({
        minDetectionConfidence: 0.5,
        model: 'short',
      });
      console.log('Face detector options set');

      // 等待模型加载完成
      console.log('Waiting for face detector initialization...');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const globalModule = (window as any).Module;
          console.error('Face detector initialization timeout - Detailed state:', {
            timestamp: new Date().toISOString(),
            initialized: this.isInitialized,
            hasDetector: !!this.faceDetector,
            detectorState: this.faceDetector ? 'active' : 'null',
            moduleState: globalModule ? 'exists' : 'not exists',
            moduleArguments: globalModule?.arguments ? 'exists' : 'not exists',
            loadedFiles: globalModule?.loadedFiles || [],
            windowLocation: window.location.href,
            userAgent: navigator.userAgent
          });
          reject(new Error('Face detector initialization timeout'));
        }, 30000);

        this.faceDetector!.onResults = (results) => {
          console.log('Face detector results callback triggered:', results);
          clearTimeout(timeout);
          console.log('Face detector ready');
          resolve();
        };

        // 使用一个空的 canvas 作为初始测试
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = 'black';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        console.log('Sending test image to face detector...');
        try {
          this.faceDetector!.send({ image: canvas });
        } catch (error) {
          console.error('Error sending test image:', error);
          clearTimeout(timeout);
          reject(error);
        }
      });

      console.log('Loading emotion model...');
      try {
        this.emotionModel = await tf.loadLayersModel(EMOTION_MODEL_URL);
        console.log('Emotion model loaded successfully');
      } catch (error) {
        console.error('Failed to load emotion model:', error);
        console.log('Using facial features for emotion detection');
      }

      this.isInitialized = true;
      console.log('Face emotion detector initialized successfully');
    } catch (error) {
      console.error('Error initializing face emotion detector:', error);
      // 清理资源
      if (this.faceDetector) {
        this.faceDetector = null;
      }
      if (this.emotionModel) {
        this.emotionModel.dispose();
        this.emotionModel = null;
      }
      this.isInitialized = false;
      throw error;
    }
  }

  async detectEmotion(videoElement: HTMLVideoElement): Promise<{
    emotion: EmotionLabel;
    confidence: number;
    landmarks: number[][];
  }> {
    if (!this.isInitialized || !this.faceDetector) {
      throw new Error('Face emotion detector not initialized');
    }

    try {
      console.log('Detecting face...');
      // 确保视频元素有正确的尺寸
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.warn('Video element has zero dimensions');
        return {
          emotion: 'neutral',
          confidence: 0,
          landmarks: []
        };
      }

      console.log('Video dimensions:', videoElement.videoWidth, videoElement.videoHeight);

      // 检测面部
      const results = await new Promise<FaceDetectionResult>((resolve, reject) => {
        let timeout = setTimeout(() => {
          console.error('Face detection timeout - Detector state:', {
            initialized: this.isInitialized,
            hasDetector: !!this.faceDetector,
            videoReady: videoElement.readyState === 4,
            videoPlaying: !videoElement.paused,
            detectorState: this.faceDetector ? 'active' : 'null'
          });
          reject(new Error('Face detection timeout'));
        }, 10000);

        this.faceDetector!.onResults = (results: any) => {
          console.log('Face detection results received:', results);
          clearTimeout(timeout);
          if (!results || !results.detections) {
            console.warn('No detections in results');
            resolve({ detections: [] });
            return;
          }
          resolve(results);
        };

        try {
          console.log('Sending image to face detector...');
          const imageData = {
            image: videoElement
          };
          console.log('Sending image data:', imageData);
          this.faceDetector!.send(imageData);
        } catch (error) {
          clearTimeout(timeout);
          console.error('Error sending image to face detector:', error);
          reject(error);
        }
      });

      console.log('Face detection results:', results);

      if (!results.detections || results.detections.length === 0) {
        console.log('No face detected');
        return {
          emotion: 'neutral',
          confidence: 0,
          landmarks: []
        };
      }

      console.log('Face detected, processing...');
      const face = results.detections[0];
      const landmarks = face.landmarks.map(landmark => [
        landmark.x,
        landmark.y,
        landmark.z
      ]);

      // 如果没有情绪模型，使用面部特征进行基本情绪判断
      if (!this.emotionModel) {
        const mouthOpenness = this.calculateMouthOpenness(landmarks);
        const eyebrowRaise = this.calculateEyebrowRaise(landmarks);
        
        console.log('Basic emotion detection:', { mouthOpenness, eyebrowRaise });
        
        if (mouthOpenness > 0.3) {
          return {
            emotion: 'surprise',
            confidence: 0.7,
            landmarks
          };
        } else if (eyebrowRaise > 0.2) {
          return {
            emotion: 'fear',
            confidence: 0.6,
            landmarks
          };
        } else {
          return {
            emotion: 'neutral',
            confidence: 0.5,
            landmarks
          };
        }
      }

      const { xCenter, yCenter, width, height } = face.boundingBox;
      console.log('Face bounding box:', { xCenter, yCenter, width, height });

      const imageTensor = tf.browser.fromPixels(videoElement)
        .slice([yCenter, xCenter], [height, width])
        .resizeBilinear([48, 48]);
      console.log('Image tensor shape:', imageTensor.shape);

      // 预处理图像
      const processedTensor = this.preprocessImage(imageTensor as tf.Tensor3D);
      console.log('Processed tensor shape:', processedTensor.shape);

      // 进行情绪预测
      console.log('Predicting emotion...');
      const predictions = await this.emotionModel.predict(processedTensor) as tf.Tensor;
      console.log('Raw predictions:', predictions.dataSync());
      
      const emotionIndex = predictions.argMax(1).dataSync()[0];
      const confidence = predictions.max().dataSync()[0];
      console.log('Emotion index:', emotionIndex, 'Confidence:', confidence);

      // 清理 tensors
      imageTensor.dispose();
      processedTensor.dispose();
      predictions.dispose();

      // 映射情绪标签
      const emotions: EmotionLabel[] = [
        'happy', 'neutral', 'sad', 'angry', 'fear',
        'surprise', 'disgust', 'stressed', 'anxious',
        'confused', 'bored', 'focused'
      ];

      console.log('Emotion detection complete:', { 
        emotion: emotions[emotionIndex], 
        confidence,
        landmarks: landmarks.length 
      });
      
      return {
        emotion: emotions[emotionIndex],
        confidence,
        landmarks
      };
    } catch (error) {
      console.error('Error detecting emotion:', error);
      return {
        emotion: 'neutral',
        confidence: 0,
        landmarks: []
      };
    }
  }

  private calculateMouthOpenness(landmarks: number[][]): number {
    const mouthTop = landmarks[13];
    const mouthBottom = landmarks[14];
    const mouthHeight = Math.abs(mouthTop[1] - mouthBottom[1]);
    return mouthHeight / 100;
  }

  private calculateEyebrowRaise(landmarks: number[][]): number {
    const leftEyebrow = landmarks[17];
    const rightEyebrow = landmarks[26];
    const eyeLevel = (landmarks[36][1] + landmarks[45][1]) / 2;
    const eyebrowRaise = (leftEyebrow[1] + rightEyebrow[1]) / 2 - eyeLevel;
    return eyebrowRaise / 100;
  }

  private preprocessImage(imageTensor: tf.Tensor3D): tf.Tensor4D {
    console.log('Preprocessing image...');
    // 转换为灰度图
    const grayscale = imageTensor.mean(2).expandDims(2);
    console.log('Grayscale shape:', grayscale.shape);
    
    // 归一化
    const normalized = grayscale.div(255.0);
    console.log('Normalized shape:', normalized.shape);
    
    // 添加批次维度
    const batched = normalized.expandDims(0) as tf.Tensor4D;
    console.log('Final shape:', batched.shape);
    
    return batched;
  }

  dispose() {
    if (this.emotionModel) {
      this.emotionModel.dispose();
    }
    this.isInitialized = false;
  }
} 