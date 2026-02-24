import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Edit2,
  Save,
  X,
  Camera,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Award,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  BarChart3,
  Settings,
  Shield,
  Lock,
  Trash2,
  AlertCircle,
  Plus,
  FileText,
  TrendingUp,
  Loader,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Languages,
  Tag
} from 'lucide-react';
import '../css/Profile.css';
import { useAuth } from '../../AuthProvider.tsx';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const currentUserId = authUser?.id || null;
  const isOwnProfile = currentUserId ?
    userId ? userId === String(currentUserId) : true
    : false;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [profileData, setProfileData] = useState({
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '',
    location: 'San Francisco, CA',
    address: '',
    bio: 'Digital creator passionate about tech, lifestyle, and travel. Helping brands connect with engaged audiences.',
    category: 'Technology',
    username: 'johndoe',
    avatar: null,
    coverImage: null,
    role: 'INFLUENCER',
    verified: false,
    phoneVerified: false,
    languagesKnown: ['English', 'Hindi'],
    preferredCategories: ['Technology', 'Lifestyle'],
    socialMediaProfiles: [],
    stats: {
      totalCollaborations: 0,
      activeCollaborations: 0,
      completedCollaborations: 0,
      totalEarnings: 0,
      avgRating: 0,
      ratingCount: 0,
      totalPosts: 0
    },
    createdPosts: [],
    collaborations: []
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const targetUserId = userId || currentUserId;
        
        const response = await fetch(`http://localhost:8080/api/profile/${targetUserId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
         const parsed = parseProfileData(data);
        setProfileData(parsed);
        setEditForm(parsed);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUserId]);

  const parseProfileData = (data: any) => {
  return {
    ...data,
    languagesKnown: normalizeArray(data.languagesKnown),
    preferredCategories: normalizeArray(data.preferredCategories),
  };
};

  
  const normalizeArray = (arr: any): string[] => {
  if (!arr) return [];

  // Already correct format
  if (Array.isArray(arr) && arr.every(v => typeof v === "string") && !arr.join("").includes("["))
    return arr;

  try {
    // Extract each element, clean unwanted characters, and return clean array
    return arr
      .map((item: string) =>
        item
          .replace(/\\/g, "")   // remove backslashes \
          .replace(/"/g, "")    // remove double quotes "
          .replace(/\[/g, "")   // remove [
          .replace(/\]/g, "")   // remove ]
          .trim()
      )
      .filter((item: string) => item.length > 0); // remove empty strings

  } catch {
    return [];
  }
};




  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    if (!isOwnProfile) return;
    setIsEditing(true);
    setEditForm({ ...profileData });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const isValidPhone = (phone) => {
    if (!phone) return true; // Empty phone is valid
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
  };

  const canSaveContact = () => {
    if (editForm.phone && editForm.phone !== '') {
      if (!isValidPhone(editForm.phone)) return false;
      if (editForm.phone !== profileData.phone && !editForm.phoneVerified) {
        return false;
      }
    }
    return true;
  };

  const canSaveProfile = () => {
    return true;
  };

  const handleSave = async () => {
    if (!isOwnProfile || !canSaveProfile()) return;
    
    try {
      setSavingProfile(true);
      
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
       if(editForm.phone !=null && editForm.phone !== '') {
        formData.append('phone', editForm.phone);
      } 
      formData.append('location', editForm.location);
      if(editForm.website && editForm.website !== '')
        formData.append('website', editForm.website || '');
      if (editForm.address && editForm.address !== '') {
        formData.append('address', editForm.address);
      }
      if (JSON.stringify(editForm.languagesKnown) != undefined) {
        formData.append('languagesKnown', JSON.stringify(editForm.languagesKnown));
      }
      if(JSON.stringify(editForm.preferredCategories) != undefined && JSON.stringify(editForm.preferredCategories) != '[]') {
        formData.append('preferredCategories', JSON.stringify(editForm.preferredCategories));
      }
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`http://localhost:8080/api/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      const parsedData = {
        ...updatedData,
        languagesKnown: normalizeArray(updatedData.languagesKnown),
        preferredCategories: normalizeArray(updatedData.preferredCategories),
      }
      setProfileData(parsedData);
      setEditForm(parsedData);
      setIsEditing(false);
      setIsEditingContact(false);
      setSavingProfile(false);
      setSavingContact(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setPhoneChanged(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSavingProfile(false);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm({ ...profileData });
    setIsEditing(false);
    setIsEditingContact(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setPhoneChanged(false);
  };

  const handleEditContact = () => {
    if (!isOwnProfile) return;
    setIsEditingContact(true);
    setPhoneChanged(false);
    setEditForm({ ...profileData });
  };

  const handleSaveContact = async () => {
    if (!isOwnProfile || !canSaveContact()) return;
    
    try {
      setSavingContact(true);
      
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
      if(editForm.phone !=null && editForm.phone !== '') {
        formData.append('phone', editForm.phone);
      } 
      formData.append('location', editForm.location);
      if(editForm.website && editForm.website !== '')
        formData.append('website', editForm.website || '');
      if (editForm.address && editForm.address !== '') {
        formData.append('address', editForm.address);
      }
      if (JSON.stringify(editForm.languagesKnown) != undefined) {
        formData.append('languagesKnown', JSON.stringify(editForm.languagesKnown));
      }
      if(JSON.stringify(editForm.preferredCategories) != undefined && JSON.stringify(editForm.preferredCategories) != '[]') {
        formData.append('preferredCategories', JSON.stringify(editForm.preferredCategories));
      }

      const response = await fetch(`http://localhost:8080/api/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update contact details');
      
      const updatedData = await response.json();
       const parsedData = {
        ...updatedData,
        languagesKnown: normalizeArray(updatedData.languagesKnown),
        preferredCategories: normalizeArray(updatedData.preferredCategories),
      }
      setProfileData(parsedData);
      setEditForm(parsedData);
      setIsEditingContact(false);
      setSavingContact(false);
      setPhoneChanged(false);
    } catch (error) {
      console.error('Error updating contact details:', error);
      setSavingContact(false);
      alert('Failed to update contact details. Please try again.');
    }
  };

  const handleCancelContact = () => {
    setEditForm({ ...profileData });
    setIsEditingContact(false);
    setPhoneChanged(false);
  };

  const handleVerifyPhone = async () => {
    if (!isOwnProfile || !editForm.phone) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/profile/verify-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: editForm.phone,
          otp: null
        })
      });

      if (!response.ok) throw new Error('Failed to send verification code');
      
      setOtpSent(true);
      setShowOtpModal(true);
      setOtp('');
    } catch (error) {
      console.error('Error verifying phone:', error);
      alert('Failed to send verification code. Please try again.');
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifyingOtp(true);
      
      const response = await fetch(`http://localhost:8080/api/profile/verify-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: editForm.phone,
          otp: otp
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }
      
      // Mark as verified in editForm only - actual save happens on profile save
      setEditForm(prev => ({
        ...prev,
        phoneVerified: true
      }));
      
      setShowOtpModal(false);
      setOtp('');
      setOtpSent(false);
      setVerifyingOtp(false);
      setPhoneChanged(false);
      
      alert('Phone number verified successfully! Click "Save Changes" to persist.');
    } catch (error) {
      console.error('Error submitting OTP:', error);
      setVerifyingOtp(false);
      alert(error.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpSent(false);
  };

  const handleClearPhone = () => {
    setEditForm(prev => ({
      ...prev,
      phone: '',
      phoneVerified: false
    }));
    setPhoneChanged(true);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Track if phone number has changed
    if (field === 'phone') {
      if (value !== profileData.phone) {
        setPhoneChanged(true);
        // Phone changed, mark as unverified
        setEditForm(prev => ({ ...prev, phoneVerified: false }));
      } else {
        setPhoneChanged(false);
        // Phone restored to original, restore verification status
        setEditForm(prev => ({ 
          ...prev, 
          phoneVerified: profileData.phoneVerified 
        }));
      }
    }
  };

  const handleLanguageToggle = (language) => {
    setEditForm(prev => {
      const currentLanguages = prev.languagesKnown || [];
      const hasLanguage = currentLanguages.includes(language);
      
      return {
        ...prev,
        languagesKnown: hasLanguage 
          ? currentLanguages.filter(l => l !== language)
          : [...currentLanguages, language]
      };
    });
  };

  const handleCategoryToggle = (category) => {
    setEditForm(prev => {
      const currentCategories = prev.preferredCategories || [];
      const hasCategory = currentCategories.includes(category);
      
      return {
        ...prev,
        preferredCategories: hasCategory 
          ? currentCategories.filter(c => c !== category)
          : [...currentCategories, category]
      };
    });
  };

  const handleConnectSocial = async (platform) => {
    if (!isOwnProfile) return;
    
    setConnectingPlatform(platform);
    
    const oauthUrl = `http://localhost:8080/api/auth/oauth/${platform.toLowerCase()}`;
    window.location.href = oauthUrl;
  };

  const handleDisconnectSocial = async (platform) => {
    if (!isOwnProfile) return;
    
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/profile/social/${platform.toLowerCase()}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to disconnect');
      
      setProfileData(prev => ({
        ...prev,
        socialMediaProfiles: prev.socialMediaProfiles.filter(p => p.platform !== platform)
      }));
    } catch (error) {
      console.error('Error disconnecting social media:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  const getSocialProfile = (platform) => {
    return profileData.socialMediaProfiles?.find(p => p.platform === platform);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const availableLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'];
  const availableCategories = ['Technology', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Education', 'Entertainment'];

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-inner">
          <div className="profile-spinner"></div>
          <p className="profile-loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  const needsVerification = isOwnProfile && (!profileData.phoneVerified || 
    !getSocialProfile('INSTAGRAM') || !getSocialProfile('YOUTUBE'));

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Verification Alert */}
        {needsVerification && (
          <div className="profile-verification-alert">
            <AlertCircle size={20} />
            <div className="profile-verification-text">
              <strong>Complete your verification</strong>
              <p>Verify your phone number and connect Instagram & YouTube to get verified badge</p>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            {/* Avatar */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {avatarPreview || profileData.avatar ? (
                  <img src={avatarPreview || profileData.avatar} alt="Profile" />
                ) : (
                  profileData.name.charAt(0).toUpperCase()
                )}
                {profileData.verified && (
                  <div className="profile-verified-badge">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
              {isEditing && isOwnProfile && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="profile-avatar-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="profile-info">
              {isEditing ? (
                <div className="profile-edit-form">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="profile-name-input"
                    placeholder="Your name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="profile-bio-input"
                    placeholder="Tell us about yourself... (e.g., your interests, expertise, what you do)"
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="profile-location-input"
                    placeholder="Your location (e.g., Mumbai, India)"
                  />
                  
                  {/* Languages Selection */}
                  <div className="profile-edit-section">
                    <label className="profile-edit-label">
                      <Languages size={16} />
                      Languages you speak
                    </label>
                    <div className="profile-tag-selector">
                      {availableLanguages.map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageToggle(lang)}
                          className={`profile-tag-option ${(editForm.languagesKnown || []).includes(lang) ? 'selected' : ''}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories Selection */}
                  <div className="profile-edit-section">
                    <label className="profile-edit-label">
                      <Tag size={16} />
                      Preferred categories
                    </label>
                    <div className="profile-tag-selector">
                      {availableCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          className={`profile-tag-option ${(editForm.preferredCategories || []).includes(cat) ? 'selected' : ''}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="profile-name">
                    {profileData.name}
                    {profileData.verified && (
                      <span className="profile-verified-icon">
                        <CheckCircle2 size={24} />
                      </span>
                    )}
                  </h1>
                  
                  {profileData.bio ? (
                    <p className="profile-bio">{profileData.bio}</p>
                  ) : isOwnProfile && (
                    <p className="profile-bio-hint">
                      <Edit2 size={14} />
                      Add a bio to tell others about yourself
                    </p>
                  )}
                </>
              )}

              <div className="profile-badges">
                {!isEditing && (
                  <div className="profile-badge">
                    <MapPin size={16} />
                    {profileData.location || (isOwnProfile ? 'Add your location' : 'Location not set')}
                  </div>
                )}
                {profileData.stats?.avgRating > 0 && (
                  <div className="profile-badge rating">
                    <Award size={16} />
                    {profileData?.rating || '5.0'}
                  </div>
                )}
                {profileData.languagesKnown && profileData.languagesKnown.length > 0 && !isEditing && (
                  <div className="profile-badge">
                    <Languages size={16} />
                    {profileData.languagesKnown.join(', ')}
                  </div>
                )}
                {profileData.preferredCategories && profileData.preferredCategories.length > 0 && !isEditing && (
                  <div className="profile-badge">
                    <Tag size={16} />
                    {profileData.preferredCategories.join(', ')}
                  </div>
                )}
              </div>

              {/* Send Message Button (only for other users) */}
              {!isOwnProfile && (
                <div className="profile-actions">
                  <button
                    onClick={() => navigate(`/messages/${userId}`)}
                    className="profile-btn profile-btn-primary"
                  >
                    <Mail size={18} />
                    Send Message
                  </button>
                </div>
              )}
            </div>

            {/* Edit Profile Button Section */}
            <div className="profile-stats">
              {isOwnProfile && (
                !isEditing ? (
                  <button onClick={handleEdit} className="profile-btn profile-btn-primary">
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button 
                      onClick={handleSave} 
                      className="profile-btn profile-btn-success"
                      disabled={savingProfile || !canSaveProfile()}
                    >
                      {savingProfile ? (
                        <>
                          <Loader size={18} className="profile-spinner-icon" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="profile-btn profile-btn-secondary"
                      disabled={savingProfile}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <div className="profile-tabs-inner">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'details', label: 'Contact Details', icon: User, ownOnly: true },
              { id: 'social', label: 'Social Media', icon: Globe },
              { id: 'settings', label: 'Settings', icon: Settings, ownOnly: true }
            ].filter(tab => !tab.ownOnly || isOwnProfile).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="profile-overview-container">
              {/* Posts Section */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h3 className="profile-section-title">
                    <FileText size={24} />
                    Created Posts
                  </h3>
                  {isOwnProfile && profileData.createdPosts?.length > 0 && (
                    <button 
                      className="profile-btn-small profile-btn-primary"
                      onClick={() => navigate('/posts/create')}
                    >
                      <Plus size={16} />
                      New Post
                    </button>
                  )}
                </div>

                {profileData.createdPosts?.length > 0 ? (
                  <div className="profile-posts-grid">
                    {profileData.createdPosts.map((post, index) => (
                      <div key={index} className="profile-post-card">
                        <div className="profile-post-header">
                          <h4 className="profile-post-title">{post.title}</h4>
                          <span className={`profile-post-status ${post.status?.toLowerCase()}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="profile-post-description">{post.description}</p>
                        <div className="profile-post-meta">
                          <span className="profile-post-date">{post.createdAt}</span>
                          <button 
                            className="profile-post-view"
                           onClick={() => navigate('/', { state: { openPostId: post?.id } })}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">
                      <FileText size={48} />
                    </div>
                    <h4 className="profile-empty-title">No posts created yet</h4>
                    <p className="profile-empty-description">
                      {isOwnProfile 
                        ? 'Start sharing your campaigns and opportunities with influencers'
                        : 'This user hasn\'t created any posts yet'}
                    </p>
                    {isOwnProfile && (
                      <button 
                        className="profile-btn profile-btn-primary"
                        onClick={() => navigate('/posts/create')}
                      >
                        <Plus size={18} />
                        Create Your First Post
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Collaborations Section */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h3 className="profile-section-title">
                    <TrendingUp size={24} />
                    Collaborations
                  </h3>
                </div>

                {profileData.stats?.totalCollaborations > 0 ? (
                  <div className="profile-collab-stats">
                    <div className="profile-stat-box">
                      <div className="profile-stat-box-header">
                        <div className="profile-stat-icon">
                          <Clock size={24} />
                        </div>
                        <span className="profile-stat-badge">Active</span>
                      </div>
                      <div className="profile-stat-box-number">{profileData.stats.activeCollaborations}</div>
                      <div className="profile-stat-box-label">In Progress</div>
                    </div>

                    <div className="profile-stat-box success">
                      <div className="profile-stat-box-header">
                        <div className="profile-stat-icon">
                          <CheckCircle size={24} />
                        </div>
                        <span className="profile-stat-badge">+12%</span>
                      </div>
                      <div className="profile-stat-box-number">{profileData.stats.completedCollaborations}</div>
                      <div className="profile-stat-box-label">Completed</div>
                    </div>

                    <div className="profile-stat-box warning">
                      <div className="profile-stat-box-header">
                        <div className="profile-stat-icon">
                          <DollarSign size={24} />
                        </div>
                        <span className="profile-stat-badge warning">+23%</span>
                      </div>
                      <div className="profile-stat-box-number">{formatCurrency(profileData.stats.totalEarnings)}</div>
                      <div className="profile-stat-box-label">Total Earnings</div>
                    </div>
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">
                      <TrendingUp size={48} />
                    </div>
                    <h4 className="profile-empty-title">No collaborations yet</h4>
                    <p className="profile-empty-description">
                      {isOwnProfile 
                        ? 'Start collaborating with brands and grow your influence'
                        : 'This user hasn\'t started any collaborations yet'}
                    </p>
                    {isOwnProfile && (
                      <button 
                        className="profile-btn profile-btn-primary"
                        onClick={() => navigate('/explore')}
                      >
                        <Target size={18} />
                        Start Collaborating
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === 'details' && (
            <div className="profile-form-card">
              <div className="profile-section-header">
                <h3 className="profile-form-title">Contact Information</h3>
                {isOwnProfile && (
                  !isEditingContact ? (
                    <button onClick={handleEditContact} className="profile-btn-small profile-btn-primary">
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="profile-edit-actions-inline">
                      <button 
                        onClick={handleSaveContact} 
                        className="profile-btn-small profile-btn-success"
                        disabled={savingContact || !canSaveContact()}
                      >
                        {savingContact ? (
                          <>
                            <Loader size={16} className="profile-spinner-icon" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleCancelContact} 
                        className="profile-btn-small profile-btn-secondary"
                        disabled={savingContact}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )
                )}
              </div>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="profile-form-display disabled">
                    {profileData.email}
                    <span className="profile-form-disabled-badge">Cannot be changed</span>
                  </div>
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <Phone size={16} />
                    Phone Number
                    {!profileData.phoneVerified && profileData.phone && !isEditingContact && (
                      <span className="profile-form-verify-badge">Not Verified</span>
                    )}
                    {profileData.phoneVerified && profileData.phone && !isEditingContact && (
                      <span className="profile-form-verified-badge">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                    )}
                  </label>
                  {isEditingContact ? (
                    <div className="profile-phone-edit-container">
                      <div className="profile-phone-input-group">
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 10) {
                              handleInputChange('phone', value);
                            }
                          }}
                          className="profile-form-input"
                          placeholder="10-digit phone number"
                        />
                      </div>
                      <div className="profile-phone-actions">
                        {editForm.phone && (
                          <button 
                            className="profile-phone-clear-btn-new"
                            onClick={handleClearPhone}
                            type="button"
                          >
                            <X size={16} />
                            Clear
                          </button>
                        )}
                        {editForm.phone && isValidPhone(editForm.phone) && phoneChanged && !editForm.phoneVerified && (
                          <button 
                            className="profile-verify-btn"
                            onClick={handleVerifyPhone}
                            type="button"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="profile-form-display-with-action">
                      <div className="profile-form-display">
                        {profileData.phone || 'Not set'}
                        {profileData.phoneVerified && profileData.phone && (
                          <CheckCircle2 size={16} className="profile-verified-icon-small" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <MapPin size={16} />
                    Address
                  </label>
                  {isEditingContact ? (
                    <textarea
                      value={editForm.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="profile-form-textarea"
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  ) : (
                    <div className="profile-form-display">
                      {profileData.address || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <Globe size={16} />
                    Website
                  </label>
                  {isEditingContact ? (
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="profile-form-input"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <div className="profile-form-display">
                      {profileData.website ? (
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="profile-website-link"
                        >
                          {profileData.website}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        'Not set'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <div className="profile-form-card">
              <h3 className="profile-form-title">Social Media Profiles</h3>
              <p className="profile-form-subtitle">
                Connect your social media accounts to get verified and showcase your reach
              </p>

              <div className="profile-social-grid">
                {/* Instagram */}
                <div className="profile-social-card instagram">
                  <div className="profile-social-header">
                    <div className="profile-social-icon-wrapper">
                      <Instagram size={32} />
                    </div>
                    <div className="profile-social-info">
                      <h4 className="profile-social-platform">Instagram</h4>
                      {getSocialProfile('INSTAGRAM') ? (
                        <>
                          <p className="profile-social-username">
                            @{getSocialProfile('INSTAGRAM').username}
                          </p>
                          <div className="profile-social-metrics">
                            <span>{formatNumber(getSocialProfile('INSTAGRAM').followersCount)} followers</span>
                            <span>•</span>
                            <span>{getSocialProfile('INSTAGRAM').engagementRate}% engagement</span>
                          </div>
                        </>
                      ) : (
                        <p className="profile-social-not-connected">Not connected</p>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="profile-social-actions">
                      {getSocialProfile('INSTAGRAM') ? (
                        <>
                          <button 
                            className="profile-social-btn profile-social-btn-view"
                            onClick={() => window.open(getSocialProfile('INSTAGRAM').profileUrl, '_blank')}
                          >
                            <ExternalLink size={16} />
                            View Profile
                          </button>
                          <button 
                            className="profile-social-btn profile-social-btn-disconnect"
                            onClick={() => handleDisconnectSocial('INSTAGRAM')}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button 
                          className="profile-social-btn profile-social-btn-connect"
                          onClick={() => handleConnectSocial('INSTAGRAM')}
                          disabled={connectingPlatform === 'INSTAGRAM'}
                        >
                          {connectingPlatform === 'INSTAGRAM' ? (
                            <>
                              <Loader size={16} className="profile-spinner-icon" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Instagram size={16} />
                              Connect Instagram
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* YouTube */}
                <div className="profile-social-card youtube">
                  <div className="profile-social-header">
                    <div className="profile-social-icon-wrapper">
                      <Youtube size={32} />
                    </div>
                    <div className="profile-social-info">
                      <h4 className="profile-social-platform">YouTube</h4>
                      {getSocialProfile('YOUTUBE') ? (
                        <>
                          <p className="profile-social-username">
                            @{getSocialProfile('YOUTUBE').username}
                          </p>
                          <div className="profile-social-metrics">
                            <span>{formatNumber(getSocialProfile('YOUTUBE').followersCount)} subscribers</span>
                            <span>•</span>
                            <span>{getSocialProfile('YOUTUBE').engagementRate}% engagement</span>
                          </div>
                        </>
                      ) : (
                        <p className="profile-social-not-connected">Not connected</p>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="profile-social-actions">
                      {getSocialProfile('YOUTUBE') ? (
                        <>
                          <button 
                            className="profile-social-btn profile-social-btn-view"
                            onClick={() => window.open(getSocialProfile('YOUTUBE').profileUrl, '_blank')}
                          >
                            <ExternalLink size={16} />
                            View Channel
                          </button>
                          <button 
                            className="profile-social-btn profile-social-btn-disconnect"
                            onClick={() => handleDisconnectSocial('YOUTUBE')}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button 
                          className="profile-social-btn profile-social-btn-connect"
                          onClick={() => handleConnectSocial('YOUTUBE')}
                          disabled={connectingPlatform === 'YOUTUBE'}
                        >
                          {connectingPlatform === 'YOUTUBE' ? (
                            <>
                              <Loader size={16} className="profile-spinner-icon" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Youtube size={16} />
                              Connect YouTube
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Twitter */}
                <div className="profile-social-card twitter">
                  <div className="profile-social-header">
                    <div className="profile-social-icon-wrapper">
                      <Twitter size={32} />
                    </div>
                    <div className="profile-social-info">
                      <h4 className="profile-social-platform">Twitter (X)</h4>
                      {getSocialProfile('TWITTER') ? (
                        <>
                          <p className="profile-social-username">
                            @{getSocialProfile('TWITTER').username}
                          </p>
                          <div className="profile-social-metrics">
                            <span>{formatNumber(getSocialProfile('TWITTER').followersCount)} followers</span>
                            <span>•</span>
                            <span>{getSocialProfile('TWITTER').engagementRate}% engagement</span>
                          </div>
                        </>
                      ) : (
                        <p className="profile-social-not-connected">Not connected</p>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="profile-social-actions">
                      {getSocialProfile('TWITTER') ? (
                        <>
                          <button 
                            className="profile-social-btn profile-social-btn-view"
                            onClick={() => window.open(getSocialProfile('TWITTER').profileUrl, '_blank')}
                          >
                            <ExternalLink size={16} />
                            View Profile
                          </button>
                          <button 
                            className="profile-social-btn profile-social-btn-disconnect"
                            onClick={() => handleDisconnectSocial('TWITTER')}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button 
                          className="profile-social-btn profile-social-btn-connect"
                          onClick={() => handleConnectSocial('TWITTER')}
                          disabled={connectingPlatform === 'TWITTER'}
                        >
                          {connectingPlatform === 'TWITTER' ? (
                            <>
                              <Loader size={16} className="profile-spinner-icon" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Twitter size={16} />
                              Connect Twitter
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="profile-settings-section">
              {/* Security */}
              <div className="profile-form-card">
                <h3 className="profile-form-title">
                  <Shield size={24} style={{ color: '#10b981', display: 'inline', marginRight: '8px' }} />
                  Security & Privacy
                </h3>
                <div className="profile-security-list">
                  <button className="profile-security-item">
                    <div className="profile-security-left">
                      <Lock size={20} style={{ color: '#6366f1' }} />
                      <span className="profile-security-label">Change Password</span>
                    </div>
                    <span className="profile-security-arrow">→</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="profile-danger-card">
                <h3 className="profile-danger-title">
                  <AlertCircle size={24} />
                  Danger Zone
                </h3>
                <button className="profile-danger-button">
                  <div className="profile-danger-left">
                    <Trash2 size={20} />
                    <div>
                      <div className="profile-danger-button-title">Delete Account</div>
                      <div className="profile-danger-button-desc">Permanently delete your account and all data</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="profile-otp-modal-overlay" onClick={handleCloseOtpModal}>
          <div className="profile-otp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-otp-modal-header">
              <h3 className="profile-otp-modal-title">Verify Phone Number</h3>
              <button 
                className="profile-otp-modal-close"
                onClick={handleCloseOtpModal}
                disabled={verifyingOtp}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="profile-otp-modal-body">
              <p className="profile-otp-modal-text">
                We've sent a 6-digit verification code to
              </p>
              <p className="profile-otp-modal-phone">{editForm.phone}</p>
              
              <div className="profile-otp-input-wrapper">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  className="profile-otp-input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  autoFocus
                  disabled={verifyingOtp}
                />
              </div>

              <button
                onClick={handleSubmitOtp}
                className="profile-otp-submit-btn"
                disabled={verifyingOtp || otp.length !== 6}
              >
                {verifyingOtp ? (
                  <>
                    <Loader size={20} className="profile-spinner-icon" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Verify & Submit
                  </>
                )}
              </button>

              <button
                onClick={handleVerifyPhone}
                className="profile-otp-resend-btn"
                disabled={verifyingOtp}
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;