import React from 'react';
import { EmotionDetector } from '../../active-awareness/components/EmotionDetector';
import { EmotionCalendar } from '../../active-awareness/components/EmotionCalendar';

const MoodTrackerPage: React.FC = () => {
  return (
    <div className="page-content">
      <h1>Mood Tracker</h1>
      <EmotionDetector />
      <div style={{ marginTop: '40px' }}>
        <h2>Emotion History</h2>
        <EmotionCalendar onDateSelect={(date) => console.log('Selected date:', date)} />
      </div>
    </div>
  );
};

export default MoodTrackerPage; 