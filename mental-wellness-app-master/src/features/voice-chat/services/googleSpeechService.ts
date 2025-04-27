import axios from 'axios';

export class GoogleSpeechService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CLOUD_SPEECH_TO_TEXT_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Google Cloud API key not configured');
    }
  }

  async convertSpeechToText(audioBlob: Blob): Promise<string> {
    try {
      // 准备音频数据
      const audioData = await this.convertBlobToBase64(audioBlob);
      
      // 调用 Google Cloud Speech-to-Text API
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'zh-CN', // 使用中文
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: audioData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // 处理响应
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].alternatives[0].transcript;
      } else {
        throw new Error('No transcription results found');
      }
    } catch (error) {
      console.error('Error in speech to text conversion:', error);
      throw error;
    }
  }

  private async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // 移除 data URL 前缀
        const base64 = base64data.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
} 