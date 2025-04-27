import { EmotionLabel, EmotionRecord as TypesEmotionRecord } from '../types';

interface BehavioralData {
  activity: string; // 当前活动（如：工作、休息、运动等）
  location: string; // 位置信息
  posture: string; // 姿势（如：坐、站、躺等）
  facialExpression: string; // 面部表情描述
  interaction: string; // 社交互动情况
}

interface PhysiologicalData {
  heartRate: number; // 心率
  breathingRate: number; // 呼吸频率
  skinTemperature: number; // 皮肤温度
  movementIntensity: number; // 运动强度（0-1）
}

interface EmotionRecord extends TypesEmotionRecord {
  landmarks: number[][];
  behavioralData: BehavioralData;
  physiologicalData: PhysiologicalData;
}

interface EmotionSummary {
  dominantEmotion: EmotionLabel;
  emotionCounts: Record<EmotionLabel, number>;
  averageConfidence: number;
  duration: number;
  behavioralPatterns: {
    [emotion: string]: {
      commonActivities: string[];
      commonLocations: string[];
      commonPostures: string[];
      averageHeartRate: number;
      averageBreathingRate: number;
    };
  };
  improvementSuggestions: string[];
}

const ALL_EMOTIONS: EmotionLabel[] = [
  'happy', 'neutral', 'sad', 'angry', 'fear',
  'surprise', 'disgust', 'stressed', 'anxious',
  'confused', 'bored', 'focused'
];

export class EmotionHistoryService {
  private records: EmotionRecord[] = [];
  private readonly maxRecords = 1000; // 最多保存1000条记录
  private readonly summaryInterval = 30 * 60 * 1000; // 30分钟生成一次总结

  addRecord(
    emotion: EmotionLabel,
    confidence: number,
    landmarks: number[][],
    behavioralData: BehavioralData,
    physiologicalData: PhysiologicalData,
    userNotes?: string
  ) {
    const record: EmotionRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      emotion,
      confidence,
      landmarks,
      behavioralData,
      physiologicalData,
      context: userNotes
    };

    this.records.push(record);

    // 如果记录数量超过最大值，删除最旧的记录
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }

    // 检查是否需要生成总结
    this.checkAndGenerateSummary();
  }

  private checkAndGenerateSummary() {
    const now = Date.now();
    const lastRecord = this.records[this.records.length - 1];
    
    if (now - lastRecord.timestamp.getTime() >= this.summaryInterval) {
      this.generateSummary();
    }
  }

  private generateSummary(): EmotionSummary {
    const recentRecords = this.records.filter(
      record => Date.now() - record.timestamp.getTime() <= this.summaryInterval
    );

    if (recentRecords.length === 0) {
      const emptyEmotionCounts = ALL_EMOTIONS.reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {} as Record<EmotionLabel, number>);

      return {
        dominantEmotion: 'neutral',
        emotionCounts: emptyEmotionCounts,
        averageConfidence: 0,
        duration: 0,
        behavioralPatterns: {},
        improvementSuggestions: []
      };
    }

    // 计算每种情绪的出现次数
    const emotionCounts = ALL_EMOTIONS.reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {} as Record<EmotionLabel, number>);

    let totalConfidence = 0;
    const behavioralPatterns: EmotionSummary['behavioralPatterns'] = {};

    recentRecords.forEach(record => {
      emotionCounts[record.emotion]++;
      totalConfidence += record.confidence;

      // 分析行为模式
      if (!behavioralPatterns[record.emotion]) {
        behavioralPatterns[record.emotion] = {
          commonActivities: [],
          commonLocations: [],
          commonPostures: [],
          averageHeartRate: 0,
          averageBreathingRate: 0
        };
      }

      const pattern = behavioralPatterns[record.emotion];
      pattern.commonActivities.push(record.behavioralData.activity);
      pattern.commonLocations.push(record.behavioralData.location);
      pattern.commonPostures.push(record.behavioralData.posture);
      pattern.averageHeartRate += record.physiologicalData.heartRate;
      pattern.averageBreathingRate += record.physiologicalData.breathingRate;
    });

    // 计算平均值并找出最常见的模式
    Object.keys(behavioralPatterns).forEach(emotion => {
      const pattern = behavioralPatterns[emotion];
      const count = emotionCounts[emotion as EmotionLabel];
      
      pattern.averageHeartRate /= count;
      pattern.averageBreathingRate /= count;
      
      pattern.commonActivities = this.getMostCommon(pattern.commonActivities);
      pattern.commonLocations = this.getMostCommon(pattern.commonLocations);
      pattern.commonPostures = this.getMostCommon(pattern.commonPostures);
    });

    // 找出主导情绪
    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as EmotionLabel;

    const improvementSuggestions = this.generateImprovementSuggestions(
      dominantEmotion,
      behavioralPatterns[dominantEmotion]
    );

    return {
      dominantEmotion,
      emotionCounts,
      averageConfidence: totalConfidence / recentRecords.length,
      duration: (Date.now() - recentRecords[0].timestamp.getTime()) / (60 * 1000),
      behavioralPatterns,
      improvementSuggestions
    };
  }

  private getMostCommon(items: string[]): string[] {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item);
  }

  private generateImprovementSuggestions(
    emotion: EmotionLabel,
    pattern: EmotionSummary['behavioralPatterns'][string]
  ): string[] {
    const suggestions: string[] = [];

    // 基于情绪和行为模式生成建议
    if (emotion === 'stressed' || emotion === 'anxious') {
      if (pattern.commonActivities.includes('工作')) {
        suggestions.push('建议在工作时定期进行短暂休息，可以尝试深呼吸练习');
      }
      if (pattern.averageHeartRate > 90) {
        suggestions.push('您的心率较高，建议进行一些放松活动，如冥想或轻度运动');
      }
    } else if (emotion === 'sad') {
      if (pattern.commonLocations.includes('卧室')) {
        suggestions.push('长时间待在卧室可能会加重情绪低落，建议到户外活动');
      }
      if (!pattern.commonActivities.includes('运动')) {
        suggestions.push('适度的运动可以帮助改善情绪，建议每天进行30分钟的运动');
      }
    }

    return suggestions;
  }

  getRecentRecords(limit: number = 10): EmotionRecord[] {
    return this.records.slice(-limit).reverse();
  }

  getSummary(): EmotionSummary {
    return this.generateSummary();
  }

  generateDiaryEntry(): string {
    const summary = this.generateSummary();
    const { 
      dominantEmotion, 
      emotionCounts, 
      averageConfidence, 
      duration,
      behavioralPatterns,
      improvementSuggestions
    } = summary;

    const emotions = Object.entries(emotionCounts)
      .filter(([_, count]) => count > 0)
      .map(([emotion, count]) => `${emotion}: ${count}次`)
      .join(', ');

    const patterns = Object.entries(behavioralPatterns)
      .filter(([_, pattern]) => pattern.commonActivities.length > 0)
      .map(([emotion, pattern]) => `
${emotion}时的常见行为：
- 活动：${pattern.commonActivities.join(', ')}
- 位置：${pattern.commonLocations.join(', ')}
- 姿势：${pattern.commonPostures.join(', ')}
- 平均心率：${pattern.averageHeartRate.toFixed(1)} bpm
- 平均呼吸频率：${pattern.averageBreathingRate.toFixed(1)} 次/分钟
      `)
      .join('\n');

    return `情绪记录总结：
主导情绪：${dominantEmotion}
情绪分布：${emotions}
平均置信度：${(averageConfidence * 100).toFixed(1)}%
持续时间：${duration.toFixed(1)}分钟

行为模式分析：
${patterns}

改善建议：
${improvementSuggestions.map(suggestion => `- ${suggestion}`).join('\n')}

情绪变化趋势：
${this.getEmotionTrend()}`;
  }

  private getEmotionTrend(): string {
    const recentRecords = this.getRecentRecords(20);
    if (recentRecords.length < 2) return '数据不足，无法分析趋势';

    const trend = recentRecords.map(record => 
      `${record.emotion} (${record.behavioralData.activity})`
    ).join(' -> ');
    
    return `最近的情绪变化：${trend}`;
  }

  clearHistory() {
    this.records = [];
  }

  getRecordsByDate(date: Date): EmotionRecord[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.records.filter(record => {
      const recordDate = record.timestamp;
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });
  }

  getRecordsByDateRange(startDate: Date, endDate: Date): EmotionRecord[] {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.records.filter(record => {
      const recordDate = record.timestamp;
      return recordDate >= start && recordDate <= end;
    });
  }

  getEmotionSummaryByDate(date: Date): EmotionSummary {
    const records = this.getRecordsByDate(date);
    return this.generateSummaryFromRecords(records);
  }

  private generateSummaryFromRecords(records: EmotionRecord[]): EmotionSummary {
    if (records.length === 0) {
      const emptyEmotionCounts = ALL_EMOTIONS.reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {} as Record<EmotionLabel, number>);

      return {
        dominantEmotion: 'neutral',
        emotionCounts: emptyEmotionCounts,
        averageConfidence: 0,
        duration: 0,
        behavioralPatterns: {},
        improvementSuggestions: []
      };
    }

    // 计算每种情绪的出现次数
    const emotionCounts = ALL_EMOTIONS.reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {} as Record<EmotionLabel, number>);

    let totalConfidence = 0;
    const behavioralPatterns: EmotionSummary['behavioralPatterns'] = {};

    records.forEach(record => {
      emotionCounts[record.emotion]++;
      totalConfidence += record.confidence;

      // 分析行为模式
      if (!behavioralPatterns[record.emotion]) {
        behavioralPatterns[record.emotion] = {
          commonActivities: [],
          commonLocations: [],
          commonPostures: [],
          averageHeartRate: 0,
          averageBreathingRate: 0
        };
      }

      const pattern = behavioralPatterns[record.emotion];
      pattern.commonActivities.push(record.behavioralData.activity);
      pattern.commonLocations.push(record.behavioralData.location);
      pattern.commonPostures.push(record.behavioralData.posture);
      pattern.averageHeartRate += record.physiologicalData.heartRate;
      pattern.averageBreathingRate += record.physiologicalData.breathingRate;
    });

    // 计算平均值并找出最常见的模式
    Object.keys(behavioralPatterns).forEach(emotion => {
      const pattern = behavioralPatterns[emotion];
      const count = emotionCounts[emotion as EmotionLabel];
      
      pattern.averageHeartRate /= count;
      pattern.averageBreathingRate /= count;
      
      pattern.commonActivities = this.getMostCommon(pattern.commonActivities);
      pattern.commonLocations = this.getMostCommon(pattern.commonLocations);
      pattern.commonPostures = this.getMostCommon(pattern.commonPostures);
    });

    // 找出主导情绪
    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as EmotionLabel;

    const improvementSuggestions = this.generateImprovementSuggestions(
      dominantEmotion,
      behavioralPatterns[dominantEmotion]
    );

    return {
      dominantEmotion,
      emotionCounts,
      averageConfidence: totalConfidence / records.length,
      duration: (records[records.length - 1].timestamp.getTime() - records[0].timestamp.getTime()) / (60 * 1000),
      behavioralPatterns,
      improvementSuggestions
    };
  }
} 