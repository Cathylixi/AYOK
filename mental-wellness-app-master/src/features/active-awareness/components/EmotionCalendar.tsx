import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EmotionHistoryService } from '../services/emotionHistoryService';
import { EmotionLabel, EmotionRecord } from '../types';
import { ALL_EMOTIONS } from '../constants';

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 5px 10px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 5px;
`;

const CalendarDay = styled.div<{ isSelected?: boolean; hasRecords?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.isSelected ? '#e3f2fd' : props.hasRecords ? '#f5f5f5' : 'white'};
  border: 1px solid ${props => props.isSelected ? '#2196f3' : '#e0e0e0'};
  
  &:hover {
    background: ${props => props.isSelected ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const DayNumber = styled.span`
  font-size: 0.9rem;
  margin-bottom: 2px;
`;

const EmotionIcon = styled.div<{ emotion: EmotionLabel }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
    switch (props.emotion) {
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

const emotionIcons: Record<EmotionLabel, string> = {
  happy: '😊',
  sad: '��',
  angry: '😠',
  fear: '😨',
  disgust: '🤢',
  surprise: '😮',
  neutral: '😐',
  stressed: '😫',
  anxious: '😰',
  confused: '😕',
  bored: '😑',
  focused: '🧐'
};

interface Props {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const EmotionCalendar: React.FC<Props> = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recordsByDate, setRecordsByDate] = useState<Record<string, EmotionRecord[]>>({});
  const emotionHistoryService = new EmotionHistoryService();

  useEffect(() => {
    const fetchRecords = async () => {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const records = emotionHistoryService.getRecordsByDateRange(startDate, endDate);
      
      const recordsMap = records.reduce((acc, record) => {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      }, {} as Record<string, EmotionRecord[]>);
      
      setRecordsByDate(recordsMap);
    };

    fetchRecords();
  }, [currentDate]);

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    const startingDay = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getDominantEmotion = (records: EmotionRecord[]): EmotionLabel => {
    if (!records || records.length === 0) return 'neutral';
    
    const emotionCounts = ALL_EMOTIONS.reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {} as Record<EmotionLabel, number>);
    
    records.forEach(record => {
      emotionCounts[record.emotion]++;
    });
    
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as EmotionLabel;
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Container>
      <CalendarHeader>
        <NavigationButton onClick={handlePrevMonth}>←</NavigationButton>
        <MonthTitle>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </MonthTitle>
        <NavigationButton onClick={handleNextMonth}>→</NavigationButton>
      </CalendarHeader>
      
      <CalendarGrid>
        {weekdays.map(day => (
          <WeekdayHeader key={day}>{day}</WeekdayHeader>
        ))}
        
        {days.map((date, index) => {
          const dateString = date?.toISOString().split('T')[0] || '';
          const records = recordsByDate[dateString] || [];
          const dominantEmotion = getDominantEmotion(records);
          const isSelected = Boolean(selectedDate && date && 
            date.toDateString() === selectedDate.toDateString());
          
          return (
            <CalendarDay
              key={index}
              isSelected={isSelected}
              hasRecords={records.length > 0}
              onClick={() => handleDateClick(date)}
            >
              <DayNumber>{date?.getDate()}</DayNumber>
              {records.length > 0 && (
                <EmotionIcon emotion={dominantEmotion}>
                  {emotionIcons[dominantEmotion]}
                </EmotionIcon>
              )}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    </Container>
  );
}; 