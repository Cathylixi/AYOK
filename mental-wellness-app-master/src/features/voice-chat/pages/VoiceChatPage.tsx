import React from 'react';
import { VoiceChatbot } from '../components/VoiceChatbot';

const VoiceChatPage: React.FC = () => {
  return (
    <div className="page-content">
      <h1>Voice Chat Assistant</h1>
      <p>Talk to our AI assistant about your mental wellness</p>
      <VoiceChatbot />
    </div>
  );
};

export default VoiceChatPage; 