import { MultimodalInput, EmotionLabel, ValidationResult } from '../types';

// 情绪一致性映射
const EMOTION_CONSISTENCY_MAP: Record<EmotionLabel, {
  physiological: {
    heartRate: { min: number; max: number };
    heartRateVariability: { min: number; max: number };
  };
  audio: {
    pitch: { min: number; max: number };
    intensity: { min: number; max: number };
  };
}> = {
  happy: {
    physiological: {
      heartRate: { min: 70, max: 100 },
      heartRateVariability: { min: 30, max: 100 }
    },
    audio: {
      pitch: { min: 200, max: 400 },
      intensity: { min: 0.6, max: 1.0 }
    }
  },
  neutral: {
    physiological: {
      heartRate: { min: 60, max: 80 },
      heartRateVariability: { min: 20, max: 60 }
    },
    audio: {
      pitch: { min: 100, max: 200 },
      intensity: { min: 0.3, max: 0.6 }
    }
  },
  sad: {
    physiological: {
      heartRate: { min: 50, max: 70 },
      heartRateVariability: { min: 10, max: 40 }
    },
    audio: {
      pitch: { min: 80, max: 150 },
      intensity: { min: 0.1, max: 0.4 }
    }
  },
  angry: {
    physiological: {
      heartRate: { min: 80, max: 120 },
      heartRateVariability: { min: 10, max: 30 }
    },
    audio: {
      pitch: { min: 150, max: 300 },
      intensity: { min: 0.7, max: 1.0 }
    }
  },
  fear: {
    physiological: {
      heartRate: { min: 90, max: 130 },
      heartRateVariability: { min: 5, max: 25 }
    },
    audio: {
      pitch: { min: 250, max: 450 },
      intensity: { min: 0.5, max: 0.9 }
    }
  },
  surprise: {
    physiological: {
      heartRate: { min: 75, max: 110 },
      heartRateVariability: { min: 15, max: 45 }
    },
    audio: {
      pitch: { min: 300, max: 500 },
      intensity: { min: 0.6, max: 1.0 }
    }
  },
  disgust: {
    physiological: {
      heartRate: { min: 65, max: 95 },
      heartRateVariability: { min: 15, max: 35 }
    },
    audio: {
      pitch: { min: 100, max: 250 },
      intensity: { min: 0.4, max: 0.8 }
    }
  },
  stressed: {
    physiological: {
      heartRate: { min: 85, max: 115 },
      heartRateVariability: { min: 5, max: 25 }
    },
    audio: {
      pitch: { min: 150, max: 300 },
      intensity: { min: 0.5, max: 0.9 }
    }
  },
  anxious: {
    physiological: {
      heartRate: { min: 90, max: 130 },
      heartRateVariability: { min: 5, max: 25 }
    },
    audio: {
      pitch: { min: 200, max: 350 },
      intensity: { min: 0.4, max: 0.8 }
    }
  },
  confused: {
    physiological: {
      heartRate: { min: 70, max: 100 },
      heartRateVariability: { min: 20, max: 50 }
    },
    audio: {
      pitch: { min: 120, max: 250 },
      intensity: { min: 0.3, max: 0.7 }
    }
  },
  bored: {
    physiological: {
      heartRate: { min: 55, max: 75 },
      heartRateVariability: { min: 15, max: 35 }
    },
    audio: {
      pitch: { min: 80, max: 150 },
      intensity: { min: 0.2, max: 0.5 }
    }
  },
  focused: {
    physiological: {
      heartRate: { min: 65, max: 85 },
      heartRateVariability: { min: 25, max: 55 }
    },
    audio: {
      pitch: { min: 100, max: 200 },
      intensity: { min: 0.3, max: 0.6 }
    }
  }
};

// 验证多模态数据的一致性
export const validateEmotionConsistency = (input: MultimodalInput): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    confidence: 1,
    reasons: [],
    suggestions: []
  };

  // 获取主要情绪（基于最高置信度）
  const primaryEmotion = getPrimaryEmotion(input);
  const consistencyMap = EMOTION_CONSISTENCY_MAP[primaryEmotion];

  // 验证生理数据
  if (input.physiological) {
    const { heartRate, heartRateVariability } = input.physiological;
    const { min: hrMin, max: hrMax } = consistencyMap.physiological.heartRate;
    const { min: hrvMin, max: hrvMax } = consistencyMap.physiological.heartRateVariability;

    if (heartRate < hrMin || heartRate > hrMax) {
      result.isValid = false;
      result.reasons.push(`心率(${heartRate})与${primaryEmotion}情绪不匹配`);
      result.suggestions.push('请检查生理传感器是否正常工作');
    }

    if (heartRateVariability < hrvMin || heartRateVariability > hrvMax) {
      result.isValid = false;
      result.reasons.push(`心率变异性(${heartRateVariability})与${primaryEmotion}情绪不匹配`);
    }
  }

  // 验证音频数据
  if (input.audio) {
    const { pitch, intensity } = input.audio;
    const { min: pitchMin, max: pitchMax } = consistencyMap.audio.pitch;
    const { min: intensityMin, max: intensityMax } = consistencyMap.audio.intensity;

    if (pitch < pitchMin || pitch > pitchMax) {
      result.isValid = false;
      result.reasons.push(`音高(${pitch}Hz)与${primaryEmotion}情绪不匹配`);
      result.suggestions.push('请确保环境安静，说话清晰');
    }

    if (intensity < intensityMin || intensity > intensityMax) {
      result.isValid = false;
      result.reasons.push(`声音强度(${intensity})与${primaryEmotion}情绪不匹配`);
    }
  }

  // 验证视频数据
  if (input.video.emotion !== primaryEmotion) {
    result.isValid = false;
    result.reasons.push(`面部表情(${input.video.emotion})与其他模态数据不一致`);
    result.suggestions.push('请确保面部清晰可见，光线充足');
  }

  // 计算总体置信度
  if (!result.isValid) {
    result.confidence = calculateOverallConfidence(input);
  }

  return result;
};

// 获取主要情绪（基于最高置信度）
const getPrimaryEmotion = (input: MultimodalInput): EmotionLabel => {
  const confidences = {
    video: input.video.confidence,
    audio: input.audio.confidence,
    // 生理数据的置信度可以根据传感器质量计算
    physiological: 0.8
  };

  // 找出置信度最高的模态
  const maxConfidence = Math.max(...Object.values(confidences));
  const primarySource = Object.entries(confidences).find(([_, conf]) => conf === maxConfidence)?.[0];

  // 返回对应模态的情绪
  switch (primarySource) {
    case 'video':
      return input.video.emotion;
    case 'audio':
      return input.audio.sentiment;
    default:
      // 如果生理数据置信度最高，根据生理指标判断情绪
      return mapPhysiologicalToEmotion(input.physiological);
  }
};

// 根据生理指标映射到情绪
const mapPhysiologicalToEmotion = (physiological: MultimodalInput['physiological']): EmotionLabel => {
  const { heartRate, heartRateVariability } = physiological;

  if (heartRate > 100) return 'angry';
  if (heartRate < 60) return 'sad';
  if (heartRateVariability > 50) return 'happy';
  return 'neutral';
};

// 计算总体置信度
const calculateOverallConfidence = (input: MultimodalInput): number => {
  const weights = {
    video: 0.4,
    audio: 0.3,
    physiological: 0.3
  };

  return (
    input.video.confidence * weights.video +
    input.audio.confidence * weights.audio +
    // 生理数据的置信度可以根据传感器质量计算
    0.8 * weights.physiological
  );
}; 