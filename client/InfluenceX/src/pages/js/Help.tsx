// Help.tsx
import React from 'react';
import { HelpCircle, Book, MessageSquare, Mail } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="main-content">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Help & <span className="gradient-text">Support</span>
          </h1>
          <p className="hero-subtitle">
            Get the assistance you need to succeed on our platform
          </p>
        </div>
      </div>
      
      <div className="content-section">
        <div className="help-grid">
          <div className="help-card">
            <Book size={48} className="help-icon" />
            <h3>Documentation</h3>
            <p>Comprehensive guides to help you get started and make the most of our platform.</p>
            <button className="btn-secondary">View Docs</button>
          </div>
          
          <div className="help-card">
            <MessageSquare size={48} className="help-icon" />
            <h3>Live Chat</h3>
            <p>Chat with our support team for real-time assistance with your questions.</p>
            <button className="btn-secondary">Start Chat</button>
          </div>
          
          <div className="help-card">
            <Mail size={48} className="help-icon" />
            <h3>Email Support</h3>
            <p>Send us detailed questions and we'll get back to you within 24 hours.</p>
            <button className="btn-secondary">Send Email</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;