import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/js/Login.tsx';
import Register from './pages/js/Register.tsx';
import Home from './pages/js/Home.tsx';
import MyPosts from './pages/js/MyPosts.tsx';
import Messages from './pages/js/Messages.tsx';
import About from './pages/js/About.tsx';
import Help from './pages/js/Help.tsx';
import { AuthProvider } from './AuthProvider.tsx';
import Header from './components/js/Header.tsx';
import VerticalNavbar from './components/js/VerticalNavbar.tsx';
import './App.css';
import { CampaignFilterProvider } from './CampaignFilterContext.tsx';
import ApplyToCampaign from './pages/js/ApplyToCampaign.tsx';
import CreatedCampaigns from './pages/js/CreatedCampaigns.tsx';
import CampaignLifecycle from './components/js/CampaignLifecycle.tsx';
import Profile from './pages/js/Profile.tsx';

function App() {
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [selectedPath, setSelectedPath] = useState('/');

  return (
    <Router>
    <AuthProvider>
      <CampaignFilterProvider>
      
        <div className="app-layout">
        <VerticalNavbar 
          isVisible={navbarVisible} 
          onHide={() => setNavbarVisible(false)} 
          selectedPath={selectedPath}
        />

        <div className={`content-shell ${navbarVisible ? 'navbar-open' : ''}`}>
          <Header
            onToggleNavbar={(pathname) => {
              setNavbarVisible((prev) => !prev);
              setSelectedPath(pathname);
            }}
          />

          <main className="main-app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-applied-posts" element={<MyPosts />} />
              <Route path="/my-created-campaigns" element={<CreatedCampaigns />} />
              <Route path="/messages">
                <Route index element={<Messages />} />
                <Route path=":chatId" element={<Messages />} />
              </Route>
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/apply/:postId" element={<ApplyToCampaign />} />
              <Route
                path="campaigns/:campaignId/lifecycle"
                element={<CampaignLifecycle />}
                  />
                   <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:userId" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
        </CampaignFilterProvider>
      </AuthProvider>
      </Router>
  );
}

export default App;
