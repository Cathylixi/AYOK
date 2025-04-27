class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    
    // 计算音高和强度
    const pitch = this.calculatePitch(channel);
    const intensity = this.calculateIntensity(channel);

    // 发送处理结果
    this.port.postMessage({
      pitch,
      intensity
    });

    return true;
  }

  calculatePitch(channel) {
    // 使用自相关方法计算音高
    const correlation = new Float32Array(this.bufferSize);
    let maxCorrelation = -1;
    let pitch = 0;

    for (let lag = 0; lag < this.bufferSize; lag++) {
      let sum = 0;
      for (let i = 0; i < this.bufferSize - lag; i++) {
        sum += channel[i] * channel[i + lag];
      }
      correlation[lag] = sum;

      if (sum > maxCorrelation) {
        maxCorrelation = sum;
        pitch = lag;
      }
    }

    // 将延迟转换为频率（Hz）
    return sampleRate / pitch;
  }

  calculateIntensity(channel) {
    // 计算信号强度（RMS）
    let sum = 0;
    for (let i = 0; i < channel.length; i++) {
      sum += channel[i] * channel[i];
    }
    return Math.sqrt(sum / channel.length);
  }
}

registerProcessor('audio-processor', AudioProcessor); 