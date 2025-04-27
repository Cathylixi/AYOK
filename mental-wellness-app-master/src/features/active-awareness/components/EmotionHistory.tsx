import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EmotionLabel } from '../types';
import { EmotionHistoryService } from '../services/emotionHistoryService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const HistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
`;

const EmotionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const EmotionText = styled.span`
  font-size: 16px;
  color: #333;
`;

const TimeText = styled.span`
  font-size: 14px;
  color: #666;
`;

const DataRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`;

const DataItem = styled.div`
  font-size: 14px;
  color: #666;
  background: rgba(0, 0, 0, 0.03);
  padding: 4px 8px;
  border-radius: 4px;
`;

const DiaryEntry = styled.div`
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  white-space: pre-line;
  font-size: 14px;
  line-height: 1.6;
`;

const Suggestions = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8px;
`;

const SuggestionTitle = styled.h3`
  font-size: 16px;
  color: #4a90e2;
  margin-bottom: 10px;
`;

const SuggestionList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li`
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #4a90e2;
  }
`;

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

interface EmotionHistoryProps {
  historyService: EmotionHistoryService;
}

export const EmotionHistory: React.FC<EmotionHistoryProps> = ({ historyService }) => {
  const [recentRecords, setRecentRecords] = useState(historyService.getRecentRecords());
  const [diaryEntry, setDiaryEntry] = useState(historyService.generateDiaryEntry());
  const [summary, setSummary] = useState(historyService.getSummary());

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentRecords(historyService.getRecentRecords());
      setDiaryEntry(historyService.generateDiaryEntry());
      setSummary(historyService.getSummary());
    }, 5000);

    return () => clearInterval(interval);
  }, [historyService]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Container>
      <Title>情绪历史记录</Title>
      
      <HistoryList>
        {recentRecords.map((record, index) => (
          <HistoryItem key={index}>
            <EmotionRow>
              <EmotionText>
                {emotionIcons[record.emotion]} {record.emotion}
              </EmotionText>
              <TimeText>{formatTime(record.timestamp)}</TimeText>
            </EmotionRow>
            
            <DataRow>
              <DataItem>活动: {record.behavioralData.activity}</DataItem>
              <DataItem>位置: {record.behavioralData.location}</DataItem>
              <DataItem>姿势: {record.behavioralData.posture}</DataItem>
              <DataItem>心率: {record.physiologicalData.heartRate} bpm</DataItem>
              <DataItem>呼吸: {record.physiologicalData.breathingRate} 次/分钟</DataItem>
            </DataRow>

            {record.userNotes && (
              <DataRow>
                <DataItem>笔记: {record.userNotes}</DataItem>
              </DataRow>
            )}
          </HistoryItem>
        ))}
      </HistoryList>

      <Title>情绪日记</Title>
      <DiaryEntry>{diaryEntry}</DiaryEntry>

      {summary.improvementSuggestions.length > 0 && (
        <Suggestions>
          <SuggestionTitle>改善建议</SuggestionTitle>
          <SuggestionList>
            {summary.improvementSuggestions.map((suggestion, index) => (
              <SuggestionItem key={index}>{suggestion}</SuggestionItem>
            ))}
          </SuggestionList>
        </Suggestions>
      )}
    </Container>
  );
}; 