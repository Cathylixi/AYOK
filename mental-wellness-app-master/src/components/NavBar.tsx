import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h2>Mental Wellness</h2>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/tracker">Mood Tracker</Link>
        <Link to="/voice-chat">Voice Chat</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default NavBar; 