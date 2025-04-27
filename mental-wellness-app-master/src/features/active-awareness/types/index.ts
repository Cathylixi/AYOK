export interface AwarenessState {
  isActive: boolean;
  status: 'idle' | 'loading' | 'error';
  data?: {
    timestamp: number;
    metrics: {
      attention: number;
      engagement: number;
      stress: number;
    };
  };
}

export interface AwarenessConfig {
  sampleRate: number;
  sensitivity: number;
  duration: number;
}

// 情绪类型定义
export type EmotionLabel = 
  | 'happy' | 'neutral' | 'sad' | 'angry' | 'fear'
  | 'surprise' | 'disgust' | 'stressed' | 'anxious'
  | 'confused' | 'bored' | 'focused';

export interface EmotionState {
  currentEmotion: EmotionLabel;
  confidence: number;
  isProcessing: boolean;
  error: string | null;
  intensity: number;  // 情绪强度 (0-1)
}

export interface EmotionRecord {
  id: string;
  timestamp: Date;
  emotion: EmotionLabel;
  confidence: number;
  context?: string;
  notes?: string;
}

// 多模态输入数据类型
export interface MultimodalInput {
  video: {
    frame: ImageData;
    landmarks: number[][];
    emotion: EmotionLabel;
    confidence: number;
  };
  audio: {
    text: string;
    sentiment: EmotionLabel;
    confidence: number;
    pitch: number;
    intensity: number;
  };
  physiological: {
    heartRate: number;
    heartRateVariability: number;
    skinConductance: number;
  };
  timestamp: number;
}

// 多模态情绪状态
export interface MultimodalEmotionState {
  videoEmotion: EmotionLabel;
  audioEmotion: EmotionLabel;
  physiologicalState: {
    stressLevel: number;
    arousal: number;
  };
  combinedEmotion: EmotionLabel;
  confidence: number;
  isProcessing: boolean;
  error: string | null;
  intensity: number;
}

// 传感器配置
export interface SensorConfig {
  video: {
    enabled: boolean;
    resolution: 'low' | 'medium' | 'high';
    frameRate: number;
  };
  audio: {
    enabled: boolean;
    sampleRate: number;
    language: string;
  };
  physiological: {
    enabled: boolean;
    heartRate: boolean;
    heartRateVariability: boolean;
    skinConductance: boolean;
  };
}

// 数据验证结果
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reasons: string[];
  suggestions: string[];
} 