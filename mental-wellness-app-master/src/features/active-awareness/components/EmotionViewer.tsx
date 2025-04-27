import React from 'react';
import { useEmotionRecognition } from '../hooks/useEmotionRecognition';
import { EmotionLabel } from '../types';
import styled from 'styled-components';
import { EmotionHistory } from './EmotionHistory';

// 情绪图标映射
const emotionIcons: Record<EmotionLabel, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  angry: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  stressed: '😫',
  anxious: '😰',
  confused: '😕',
  bored: '😑',
  focused: '🤔'
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px;
`;

const EmotionIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmotionText = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ConfidenceText = styled.div`
  font-size: 16px;
  color: #666;
`;

const StatusText = styled.div`
  font-size: 14px;
  color: #888;
  margin-top: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #357abd;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const EmotionViewer: React.FC = () => {
  const { 
    emotion, 
    confidence, 
    isProcessing, 
    error,
    videoRef,
    startEmotionRecognition,
    stopEmotionRecognition,
    historyService
  } = useEmotionRecognition();

  if (error) {
    return (
      <Container>
        <StatusText>Error: {error.message}</StatusText>
      </Container>
    );
  }

  return (
    <>
      <Container>
        {!emotion ? (
          <StatusText>{isProcessing ? 'Processing...' : 'No emotion detected'}</StatusText>
        ) : (
          <>
            <EmotionIcon>{emotionIcons[emotion]}</EmotionIcon>
            <EmotionText>{emotion}</EmotionText>
            <ConfidenceText>Confidence: {(confidence * 100).toFixed(1)}%</ConfidenceText>
            {isProcessing && <StatusText>Processing...</StatusText>}
          </>
        )}

        <Controls>
          <Button 
            onClick={startEmotionRecognition}
            disabled={isProcessing}
          >
            Start Recognition
          </Button>
          <Button 
            onClick={stopEmotionRecognition}
            disabled={!isProcessing}
          >
            Stop Recognition
          </Button>
        </Controls>

        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
        />
      </Container>

      <EmotionHistory historyService={historyService} />
    </>
  );
}; 