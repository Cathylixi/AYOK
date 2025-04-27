import React, { useEffect, useRef, useState } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import { FaceEmotionDetector } from '../models/faceEmotionModel';
import { EmotionLabel } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EmotionDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmotionText = styled.div<{ $emotion: EmotionLabel }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => {
    switch (props.$emotion) {
      case 'happy': return '#4caf50';
      case 'sad': return '#2196f3';
      case 'angry': return '#f44336';
      case 'fear': return '#9c27b0';
      case 'disgust': return '#795548';
      case 'surprise': return '#ff9800';
      case 'stressed': return '#ff5722';
      case 'anxious': return '#673ab7';
      case 'confused': return '#607d8b';
      case 'bored': return '#9e9e9e';
      case 'focused': return '#009688';
      default: return '#9e9e9e';
    }
  }};
`;

const ConfidenceBar = styled.div<{ $confidence: number }>`
  width: 200px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${props => props.$confidence * 100}%;
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #1976d2;
  }

  &:disabled {
    background: #bdbdbd;
    cursor: not-allowed;
  }
`;

const EmotionButton = styled(Button)<{ $isSelected?: boolean; $hasRecords?: boolean }>`
  flex: 1;
  margin: 0 4px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: ${props => props.$isSelected ? '#4CAF50' : '#f5f5f5'};
  color: ${props => props.$isSelected ? 'white' : '#333'};
  border: 1px solid ${props => props.$isSelected ? '#4CAF50' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background-color: ${props => props.$isSelected ? '#45a049' : '#e0e0e0'};
  }

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props => props.$hasRecords ? '#4CAF50' : 'transparent'};
  }
`;

export const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<FaceEmotionDetector | null>(null);
  const detectionActiveRef = useRef(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionLabel>('neutral');
  const [confidence, setConfidence] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionLabel>('neutral');
  const [emotionRecords, setEmotionRecords] = useState<Record<EmotionLabel, EmotionLabel[]>>({
    neutral: [],
    happy: [],
    sad: [],
    angry: [],
    fear: [],
    disgust: [],
    surprise: [],
    stressed: [],
    anxious: [],
    confused: [],
    bored: [],
    focused: []
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeDetector = async () => {
      console.log('Initializing detector...');
      try {
        const detector = new FaceEmotionDetector();
        console.log('Detector instance created');
        await detector.initialize();
        if (mounted) {
          detectorRef.current = detector;
          setIsInitialized(true);
          console.log('Detector initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize detector:', error);
        alert('无法初始化情绪检测器，请刷新页面重试。错误信息: ' + error.message);
      }
    };

    initializeDetector();

    return () => {
      console.log('Cleaning up detector...');
      mounted = false;
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, []);

  const startDetection = async () => {
    console.log('Starting detection...');
    if (!videoRef.current) {
      console.error('Video ref is not initialized');
      return;
    }

    if (!detectorRef.current) {
      console.error('Detector ref is not initialized');
      return;
    }

    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      console.log('Camera access granted, stream:', stream);
      
      if (!videoRef.current) {
        console.error('Video ref is null after getting stream');
        return;
      }

      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current!.play().then(() => {
            console.log('Video started playing');
            resolve(null);
          });
        };
      });

      detectionActiveRef.current = true;
      setIsDetecting(true);
      console.log('Detection started');

      const detectLoop = async () => {
        if (!detectionActiveRef.current || !videoRef.current || !detectorRef.current) {
          console.log('Stopping detection loop:', {
            detectionActive: detectionActiveRef.current,
            hasVideoRef: !!videoRef.current,
            hasDetectorRef: !!detectorRef.current
          });
          return;
        }

        try {
          console.log('Detecting emotion...');
          const result = await detectorRef.current.detectEmotion(videoRef.current);
          console.log('Detection result:', result);
          
          if (result.confidence > 0) {
            setCurrentEmotion(result.emotion);
            setConfidence(result.confidence);
          } else {
            console.log('Low confidence result, keeping previous emotion');
          }
        } catch (error) {
          console.error('Error in detection loop:', error);
        }

        requestAnimationFrame(detectLoop);
      };

      detectLoop();

      return () => {
        console.log('Cleaning up detection...');
        detectionActiveRef.current = false;
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsDetecting(false);
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('无法访问摄像头，请确保已授予摄像头权限。错误信息: ' + error.message);
    }
  };

  const stopDetection = () => {
    console.log('Stopping detection...');
    detectionActiveRef.current = false;
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
  };

  const handleEmotionClick = (emotion: EmotionLabel) => {
    setSelectedEmotion(emotion);
  };

  return (
    <StyleSheetManager shouldForwardProp={(prop) => !prop.startsWith('$')}>
      <Container>
        <VideoContainer>
          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
        </VideoContainer>

        <EmotionDisplay>
          <EmotionText $emotion={currentEmotion}>
            {currentEmotion}
          </EmotionText>
          <ConfidenceBar $confidence={confidence} />
          <div>Confidence: {(confidence * 100).toFixed(1)}%</div>
        </EmotionDisplay>

        <Controls>
          <Button
            onClick={startDetection}
            disabled={!isInitialized || isDetecting}
          >
            Start Detection
          </Button>
          <Button
            onClick={stopDetection}
            disabled={!isDetecting}
          >
            Stop Detection
          </Button>
        </Controls>

        <div>
          {Object.keys(emotionRecords).map((emotion) => (
            <EmotionButton
              key={emotion}
              onClick={() => handleEmotionClick(emotion as EmotionLabel)}
              $isSelected={selectedEmotion === emotion as EmotionLabel}
              $hasRecords={emotionRecords[emotion as EmotionLabel]?.length > 0}
            >
              {emotion}
            </EmotionButton>
          ))}
        </div>
      </Container>
    </StyleSheetManager>
  );
}; 