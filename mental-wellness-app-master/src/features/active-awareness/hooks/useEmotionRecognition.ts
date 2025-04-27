import { useRef, useState, useCallback } from 'react';
import { EmotionLabel } from '../types';
import { FaceEmotionDetector } from '../models/faceEmotionModel';
import { EmotionHistoryService } from '../services/emotionHistoryService';

interface EmotionState {
  emotion: EmotionLabel | null;
  confidence: number;
  isProcessing: boolean;
  error: Error | null;
}

interface BehavioralData {
  activity: string;
  location: string;
  posture: string;
  facialExpression: string;
  interaction: string;
}

interface PhysiologicalData {
  heartRate: number;
  breathingRate: number;
  skinTemperature: number;
  movementIntensity: number;
}

export const useEmotionRecognition = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [emotionState, setEmotionState] = useState<EmotionState>({
    emotion: null,
    confidence: 0,
    isProcessing: false,
    error: null
  });

  const faceDetector = new FaceEmotionDetector();
  const historyService = new EmotionHistoryService();

  // 模拟获取行为数据
  const getBehavioralData = (): BehavioralData => {
    // 这里可以集成实际的传感器数据或用户输入
    return {
      activity: '工作', // 可以从活动检测或用户输入获取
      location: '办公室', // 可以从GPS或用户输入获取
      posture: '坐', // 可以从姿势检测获取
      facialExpression: '专注', // 从面部表情检测获取
      interaction: '独自工作' // 从社交互动检测获取
    };
  };

  // 模拟获取生理数据
  const getPhysiologicalData = (): PhysiologicalData => {
    // 这里可以集成实际的传感器数据
    return {
      heartRate: 75 + Math.random() * 10, // 模拟心率数据
      breathingRate: 16 + Math.random() * 4, // 模拟呼吸频率
      skinTemperature: 36.5 + Math.random() * 0.5, // 模拟皮肤温度
      movementIntensity: Math.random() // 模拟运动强度
    };
  };

  const startEmotionRecognition = useCallback(async () => {
    try {
      setEmotionState(prev => ({ ...prev, isProcessing: true, error: null }));

      await faceDetector.initialize();

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      const detectEmotion = async () => {
        if (!emotionState.isProcessing) return;

        try {
          const result = await faceDetector.detectEmotion(video);
          const behavioralData = getBehavioralData();
          const physiologicalData = getPhysiologicalData();

          setEmotionState({
            emotion: result.emotion,
            confidence: result.confidence,
            isProcessing: true,
            error: null
          });

          // 记录情绪历史，包括行为数据和生理数据
          historyService.addRecord(
            result.emotion,
            result.confidence,
            result.landmarks,
            behavioralData,
            physiologicalData
          );
        } catch (error) {
          setEmotionState(prev => ({
            ...prev,
            error: error instanceof Error ? error : new Error('Failed to detect emotion')
          }));
        }

        requestAnimationFrame(detectEmotion);
      };

      detectEmotion();
    } catch (error) {
      setEmotionState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error : new Error('Failed to start emotion recognition')
      }));
    }
  }, []);

  const stopEmotionRecognition = useCallback(() => {
    setEmotionState(prev => ({ ...prev, isProcessing: false }));
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    faceDetector.dispose();
  }, []);

  const addUserNote = useCallback((note: string) => {
    if (emotionState.emotion) {
      const behavioralData = getBehavioralData();
      const physiologicalData = getPhysiologicalData();
      
      historyService.addRecord(
        emotionState.emotion,
        emotionState.confidence,
        [], // 这里可以存储当前的面部特征点
        behavioralData,
        physiologicalData,
        note
      );
    }
  }, [emotionState.emotion, emotionState.confidence]);

  return {
    ...emotionState,
    videoRef,
    startEmotionRecognition,
    stopEmotionRecognition,
    historyService,
    addUserNote
  };
}; 