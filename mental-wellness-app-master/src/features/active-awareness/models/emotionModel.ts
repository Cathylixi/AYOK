import * as tf from '@tensorflow/tfjs';
import { EmotionLabel } from '../types';

// 情绪类别映射
export const EMOTION_LABELS: EmotionLabel[] = [
  'happy',    // 快乐
  'neutral',  // 中性
  'sad',      // 悲伤
  'angry',    // 愤怒
  'fear',     // 恐惧
  'surprise', // 惊讶
  'disgust',  // 厌恶
  'stressed', // 压力
  'anxious',  // 焦虑
  'confused', // 困惑
  'bored',    // 无聊
  'focused'   // 专注
];

// 预训练模型配置
const PRETRAINED_MODEL_URL = 'https://tfhub.dev/tensorflow/tfjs-model/face_landmarks_detection/1';
const FINE_TUNE_LAYERS = 2; // 需要微调的层数

// 创建一个基于预训练模型的情绪识别模型
export const createEmotionModel = async () => {
  // 加载预训练模型
  const baseModel = await tf.loadGraphModel(PRETRAINED_MODEL_URL);
  
  // 创建新的分类层
  const model = tf.sequential();
  
  // 添加输入层
  model.add(tf.layers.inputLayer({ inputShape: [48, 48, 3] }));
  
  // 使用预训练模型进行特征提取
  const features = baseModel.predict(tf.zeros([1, 48, 48, 3])) as tf.Tensor;
  const featureShape = features.shape.slice(1);
  
  // 添加特征提取层
  model.add(tf.layers.reshape({ targetShape: featureShape }));
  
  // 添加新的分类层
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.25 }));
  model.add(tf.layers.dense({ units: EMOTION_LABELS.length, activation: 'softmax' }));

  // 编译模型
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
};

// 在线学习配置
interface OnlineLearningConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
}

// 在线学习数据存储
interface TrainingSample {
  image: tf.Tensor;
  label: EmotionLabel;
  timestamp: number;
}

class OnlineLearningManager {
  private samples: TrainingSample[] = [];
  private maxSamples: number = 1000;

  constructor(private model: tf.LayersModel) {}

  // 添加新的训练样本
  addSample(image: tf.Tensor, label: EmotionLabel) {
    this.samples.push({
      image,
      label,
      timestamp: Date.now(),
    });

    // 保持样本数量在限制范围内
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  // 执行在线学习
  async fineTune(config: OnlineLearningConfig) {
    if (this.samples.length < config.batchSize) return;

    // 准备训练数据
    const xs = tf.stack(this.samples.map(s => s.image));
    const ys = tf.oneHot(
      this.samples.map(s => EMOTION_LABELS.indexOf(s.label)),
      EMOTION_LABELS.length
    );

    // 微调模型
    await this.model.fit(xs, ys, {
      batchSize: config.batchSize,
      epochs: config.epochs,
      shuffle: true,
      validationSplit: 0.2,
    });

    // 清理内存
    xs.dispose();
    ys.dispose();
  }
}

// 初始化模型权重
export const initializeModelWeights = async () => {
  const model = await createEmotionModel();
  const onlineLearningManager = new OnlineLearningManager(model);
  
  // 保存模型
  await model.save('file://src/features/active-awareness/models/emotion_model');
  
  return { model, onlineLearningManager };
};

// 加载预训练权重（如果有的话）
export const loadEmotionModel = async () => {
  try {
    const model = await tf.loadLayersModel(
      'file://src/features/active-awareness/models/emotion_model/model.json'
    );
    const onlineLearningManager = new OnlineLearningManager(model);
    return { model, onlineLearningManager };
  } catch (error) {
    console.log('No pre-trained model found, creating new model...');
    return initializeModelWeights();
  }
}; 