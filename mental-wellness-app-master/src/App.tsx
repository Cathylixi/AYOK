import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './features/home/pages/HomePage';
import ResourcesPage from './features/resources/pages/ResourcesPage';
import MoodTrackerPage from './features/mood-tracker/pages/MoodTrackerPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import VoiceChatPage from './features/voice-chat/pages/VoiceChatPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/mood-tracker" element={<MoodTrackerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/voice-chat" element={<VoiceChatPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 