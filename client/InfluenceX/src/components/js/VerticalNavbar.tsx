import React, { use } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, MessageCircle, Info, HelpCircle, Settings, User } from 'lucide-react';
import '../css/VerticalNavbar.css';
import { useAuth } from '../../AuthProvider';

interface VerticalNavbarProps {
  isVisible: boolean;
  onHide: () => void;
  selectedPath?: string;
}

const VerticalNavbar: React.FC<VerticalNavbarProps> = ({ isVisible, onHide,selectedPath }) => {
  const { authUser } = useAuth();
  const [selected, setSelectedPath] = React.useState<string>(selectedPath || '/');

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    {path:'/my-collaborations', icon: FileText, label: 'My Collaborations'},
    { path: '/my-promotions', icon: FileText, label: 'My Promotions' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/about', icon: Info, label: 'About' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <nav className={`vertical-navbar ${isVisible ? "show" : "hide"}`}>
      <div className="navbar-content">
        <div className="navbar-brand" onClick={onHide}>
          <div className="brand-logo">
            <span className="brand-icon">✨</span>
            <span className="brand-text">InfluenceX</span>
          </div>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${
                  isActive || item.path === selected ? "nav-item-active" : ""
                }`
              }
              onClick={() => setSelectedPath(item.path)} // update when nav item clicked
            >
              <item.icon className="nav-icon" size={20} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbar-footer">
          {/* <div className="nav-item nav-settings">
            <Settings className="nav-icon" size={20} />
            <span className="nav-label">Settings</span>
          </div> */}
          <div className="user-profile">
           <div className="user-avatar">
              {authUser?.avatar ? (
                <img src={authUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{authUser?.name}</span>
              {/* <span className="user-role">Creator</span> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavbar;
