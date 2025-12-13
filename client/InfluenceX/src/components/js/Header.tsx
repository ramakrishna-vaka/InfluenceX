import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  User, 
  ChevronDown, 
  Search, 
  Plus, 
  Settings,
  LogOut,
  Zap,
  Filter,
  SortDesc
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './../css/Header.css';
import { useAuth } from '../../AuthProvider';
import CreateCampaignDialog from './CreateCampaignDialog';
import { useCampaignFilter } from '../../CampaignFilterContext';
import type { FilterState } from '../../CampaignFilterContext';
import { useWebSocket } from '../../hooks/useWebSocket';

interface HeaderProps {
  onToggleNavbar: (pathname:string) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleNavbar }) => {
  const { authUser, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [isOpen, setIsOpen] = useState(false);
  const close = () => { setIsOpen(false); }
  
  const { searchQuery, sortBy, filters,setSearchQuery,setFilters, setSortBy,clearAllFilters } = useCampaignFilter();


// WebSocket for real-time notifications
  const { notifications: realtimeNotifications } = useWebSocket(authUser?.id);
  // Merge real-time notifications with existing ones
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotificationsList((prev) => {
        const newNotifications = realtimeNotifications.filter(
          (newNotif) => !prev.some((existing) => existing.id === newNotif.id)
        );
        return [...newNotifications, ...prev];
      });
    }
  }, [realtimeNotifications]);

  // Calculate unread count
  useEffect(() => {
    const count = notificationsList.filter(n => !n.readBy).length;
    setUnreadCount(count);
  }, [notificationsList]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event:any) => {
      const target = event.target;
      if (!target.closest('.notification-wrapper')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-profile-wrapper')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.filter-wrapper')) {
        setShowFilters(false);
      }
      if (!target.closest('.sort-wrapper')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //fetch notifications from rest api on mount
  useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await fetch('http://localhost:8080/get/notifications',{
            method:'GET',
            headers:{
                    'Content-Type':'application/json'
                },
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }
          const notificationsData = await response.json();
          setNotificationsList(notificationsData);
        } catch (err) {
          //setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          //setLoading(false);
        }
      };
  
       if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

   // Mark all as read when bell is clicked
  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    
    if (!showNotifications && unreadCount > 0) {
      try {
        const response = await fetch('http://localhost:8080/post/notification/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          // Mark all as read in local state
          setNotificationsList(prev => 
            prev.map(n => ({ ...n, readBy: true }))
          );
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };

  // Remove old read notifications (older than 24 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setNotificationsList(prev => 
        prev.filter(n => {
          if (!n.readBy) return true;
          // Assuming you add createdAt field to notifications
          // const notificationAge = now - new Date(n.createdAt).getTime();
          // return notificationAge < 24 * 60 * 60 * 1000; // 24 hours
          return true; // Keep all for now, add createdAt field for proper filtering
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'draft', label: 'Draft' }
    ],
    category: [
      { value: 'all', label: 'All Categories' },
      { value: 'tech', label: 'Technology' },
      { value: 'fashion', label: 'Fashion' },
      { value: 'food', label: 'Food & Drink' },
      { value: 'travel', label: 'Travel' },
      { value: 'fitness', label: 'Fitness' }
    ],
    //TODO
    // budget: [
    //   { value: 'all', label: 'Any Budget' },
    //   { value: '0-500', label: '$0 - $500' },
    //   { value: '500-1000', label: '$500 - $1,000' },
    //   { value: '1000-5000', label: '$1,000 - $5,000' },
    //   { value: '5000+', label: '$5,000+' }
    // ]
  };

  const notifications = isLoggedIn ? notificationsList.filter(n => n.readBy==false).length : 0;
  const user = {
    name: authUser?.name || "John Doe",
    role: "influencer",
    email: authUser?.email || "john@example.com",
    avatar: null
  };

  const handleSearch = useCallback((e:any) => {
    e.preventDefault();
    //TODO
    // if (searchQuery.trim()) {
    //   navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    // }
  }, [searchQuery, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleSortChange = (value: any) => {
    setSortBy(value);
    setShowSortMenu(false);
    // Emit sort change event or call parent handler
    // You can add your sort logic here or emit an event
  };

  const handleFilterChange = (type: keyof FilterState, value: string) => {
  setFilters((prevFilters) => ({
    ...prevFilters,
    [type]: value
  }));
};

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;
  const handleOnClick = (pathname:string) => {
    console.log("Clicked");
    onToggleNavbar(pathname);
  }

  // Public header when not logged in
  if (!isLoggedIn) {
    return (
      <header className="header">
        <div className="header-container">
          {/* Logo and Brand */}
          <div className="header-brand" onClick={()=>handleOnClick(location.pathname)}>
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Zap size={24} />
              </div>
              <span className="brand-name">InfluenceX</span>
            </Link>
          </div>

          {/* Public Navigation */}
          <nav className="header-nav">
            <Link to="/campaigns" className="nav-item">
              <span>Campaigns</span>
            </Link>
            <Link to="/about" className="nav-item">
              <span>About</span>
            </Link>
            <Link to="/contact" className="nav-item">
              <span>Contact</span>
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="header-actions">
            <Link to="/login" className="create-campaign-btn">
              Login
            </Link>
            <Link to="/register" className="create-campaign-btn">
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Logged-in header with sort/filter instead of navigation
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand" onClick={() => handleOnClick(location.pathname)}>
          <span className="logo">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <span className="brand-name">InfluenceX</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <form onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* Sort and Filter Controls - Replacing Navigation */}
        <div className="header-controls">
          {/* Sort Dropdown */}
          <div className="sort-wrapper control-wrapper">
            <button 
              className="control-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <SortDesc size={16} />
              <span className="control-text">Sort</span>
              <span className="control-value">{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
              <ChevronDown size={14} className={`control-arrow ${showSortMenu ? 'rotated' : ''}`} />
            </button>

            {showSortMenu && (
              <div className="control-dropdown">
                <div className="control-dropdown-header">
                  <span>Sort by</span>
                </div>
                <div className="control-dropdown-list">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`control-dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="filter-wrapper control-wrapper">
            <button 
              className={`control-btn ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span className="control-text">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="filter-count">{activeFiltersCount}</span>
              )}
              <ChevronDown size={14} className={`control-arrow ${showFilters ? 'rotated' : ''}`} />
            </button>

            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-header">
                  <span>Filters</span>
                  <button className="clear-filters-btn" onClick={clearAllFilters}>
                    Clear All
                  </button>
                </div>

                <div className="filter-sections">
                  {Object.entries(filterOptions).map(([filterType, options]) => (
                    <div key={filterType} className="filter-section">
                      <div className="filter-section-title">
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </div>
                      <div className="filter-options">
                        {options.map((option) => (
                          <label key={option.value} className="filter-option">
                            <input
                              type="radio"
                              name={filterType}
                              value={option.value}
                              checked={filters[filterType as keyof FilterState] === option.value}
                              onChange={(e) => handleFilterChange(filterType as keyof FilterState, e.target.value)}
                            />
                            <span className="filter-option-label">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Unchanged */}
        <div className="header-actions">
          {/* Create Button */}
          <button className="create-campaign-btn" onClick={() => setIsOpen(true)}>
            <Plus size={18} />
            <span>Create</span>
          </button>
          <CreateCampaignDialog isOpen={isOpen} onClose={close} userId={authUser?.id} />
{/* Notifications */}
          <div className="notification-wrapper">
            <button 
              className="notification-btn"
              onClick={handleBellClick}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <span className="notifications-count">{unreadCount} new</span>
                </div>
                <div className="notifications-list">
                  {notificationsList.length === 0 ? (
                    <div className="no-notifications">
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notificationsList.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.readBy ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <p className="notification-message">{notification.notification}</p>
                        </div>
                        {!notification.readBy && <div className="unread-dot"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="user-profile-wrapper">
            <button 
              className="user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <User size={20} />
                )}
              </div>
              {/* <div className="user-info">
                <span className="user-name">{user.name}</span>
              </div> */}
              <ChevronDown size={16} className="dropdown-arrow" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar large">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="user-details">
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                    <span className="user-role-badge">{user.role}</span>
                  </div>
                </div>
                
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="menu-item">
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/settings" className="menu-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <hr className="menu-divider" />
                  <button className="menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;