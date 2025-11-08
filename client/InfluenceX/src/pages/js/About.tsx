// About.tsx
import React from 'react';
import { Info, Users, Award, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="main-content">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            About <span className="gradient-text">InfluenceX</span>
          </h1>
          <p className="hero-subtitle">
            The premier platform connecting brands with authentic influencers
          </p>
        </div>
      </div>
      
      <div className="content-section">
        <div className="about-grid">
          <div className="about-card">
            <Users size={48} className="about-icon" />
            <h3>50K+ Creators</h3>
            <p>Join thousands of content creators earning through authentic partnerships.</p>
          </div>
          
          <div className="about-card">
            <Award size={48} className="about-icon" />
            <h3>Premium Quality</h3>
            <p>Curated campaigns from top-tier brands seeking quality collaborations.</p>
          </div>
          
          <div className="about-card">
            <Globe size={48} className="about-icon" />
            <h3>Global Reach</h3>
            <p>Connect with brands and influencers from around the world.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;