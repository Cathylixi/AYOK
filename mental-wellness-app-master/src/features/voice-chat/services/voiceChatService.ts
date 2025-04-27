import axios from 'axios';

interface ChatResponse {
  text: string;
  audioUrl?: string;
}

export class VoiceChatService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async convertSpeechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post(`${this.baseUrl}/stt`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.text;
    } catch (error) {
      console.error('Error converting speech to text:', error);
      throw error;
    }
  }

  async getChatResponse(text: string): Promise<ChatResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, {
        text,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw error;
    }
  }

  async convertTextToSpeech(text: string): Promise<Blob> {
    try {
      const response = await axios.post(`${this.baseUrl}/tts`, {
        text,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }
} 