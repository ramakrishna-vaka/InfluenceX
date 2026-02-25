import React, { useState, useEffect ,useMemo} from 'react';
import { Rocket, Users, DollarSign, Calendar, Filter, Image as ImageIcon, User, Clock, CheckCircle, Star,X, Share2, ExternalLink, Gift  } from 'lucide-react';
import '../css/Home.css';
import { Link, useLocation  } from "react-router-dom";
import type { Post } from '../../utils/Posts';
import { useAuth } from '../../AuthProvider';
import { useCampaignFilter } from '../../CampaignFilterContext';
import CreateCampaignDialog from '../../components/js/CreateCampaignDialog';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [selectedPostForEdit, setSelectedPostForEdit] = useState<Post | null>(null);

  
  const [filterCategory, setFilterCategory] = useState('all');
  const [showMyPosts, setShowMyPosts] = useState(false);

  const categories = ['Technology', 'Fashion', 'Fitness', 'Food', 'Travel', 'Beauty', 'Gaming'];

  const { searchQuery, filters, sortBy } = useCampaignFilter();
  
  const location = useLocation();

  useEffect(() => {
  if (location.state?.openPostId && posts.length > 0) {
    const post = posts.find(p => p.id === location.state.openPostId);
    if (post) {
      setSelectedPost(post);
      window.history.replaceState({}, document.title);
    }
  }
  }, [location.state, posts]);
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/posts', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const postsData = await response.json();
        setPosts(postsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.type?.toLowerCase().includes(query)
      );
    }

    if (filters.category !== 'all') {
      result = result.filter(post => post.type.toLowerCase() === filters.category.toLowerCase());
    }

    if (filterCategory !== 'all') {
      result = result.filter(post => post.type === filterCategory);
    }

    if (filters.status !== 'all') {
      result = result.filter(post => post.status === filters.status);
    }

    if (filters.budget !== 'all') {
      const [min, max] = filters.budget.split('-').map(v => v.replace('+', ''));
      const minBudget = parseInt(min) || 0;
      const maxBudget = max ? parseInt(max) : Infinity;
      result = result.filter(post => post.budget >= minBudget && post.budget <= maxBudget);
    }

    if (showMyPosts) {
      result = result.filter(post => post.isMyPost);
    }

    const sortKey = sortBy;
    result.sort((a, b) => {
      switch (sortKey) {
        case 'recent':
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'budget_high':
        case 'price-high':
          return b.budget - a.budget;
        case 'budget_low':
        case 'price-low':
          return a.budget - b.budget;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'followers':
          return b.followers - a.followers;
        default:
          return 0;
      }
    });

    return result;
  }, [posts, searchQuery, sortBy, filterCategory, showMyPosts]);

  const formatINRShortWithSymbol = (value: number) => {
    const formatted = formatINRShort(value);
    return `₹${formatted}`;
  };
  
  const formatINRShort = (value: number) => {
    if (value >= 10000000) {
      return (value / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    } 
    if (value >= 100000) {
      return (value / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(2).replace(/\.00$/, '') + ' K';
    }
    return value.toString();
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return Math.round((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const renderDeadline = (deadline: string, inline = false) => {
    const days = getDaysUntilDeadline(deadline);
    const dateStr = new Date(deadline).toLocaleDateString();
    const isUrgent = days >= 0 && days <= 3;
    const isPast = days < 0;

    const urgencyLabel = isPast
      ? 'Expired'
      : days === 0
      ? 'Today!'
      : `${days}d left`;

    if (inline) {
      return (
        <>
          <span>{dateStr}</span>
          <span className={`deadline-badge ${isUrgent || isPast ? 'deadline-urgent' : 'deadline-normal'}`}>
            {urgencyLabel}
          </span>
        </>
      );
    }

    return (
      <span className={isUrgent || isPast ? 'deadline-text-urgent' : ''}>
        {dateStr}
        <span className={`deadline-badge ${isUrgent || isPast ? 'deadline-urgent' : 'deadline-normal'}`} style={{ marginLeft: 8 }}>
          {urgencyLabel}
        </span>
      </span>
    );
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { className: 'status-open', text: 'Open' };
      case 'in-progress':
        return { className: 'status-progress', text: 'In Progress' };
      case 'completed':
        return { className: 'status-completed', text: 'Completed' };
      default:
        return { className: 'status-open', text: 'Open' };
    }
  };

  const handleApplyClick = (post: Post) => {
    if (post.isCreatedByMe) {
      setSelectedPostForEdit(post);
    } else {
      window.location.href = `/apply/${post.id}`;
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <p>Error loading campaigns: {error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Brand <span className="gradient-text">Partnerships</span>
          </h1>
          <p className="hero-subtitle">
            Discover exclusive collaboration opportunities with top-tier brands and creators
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="content-section">
        {filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map(post => {
              const statusConfig = getStatusConfig(post.status);
              const hasImage = post.imageBase64 && post.imageBase64.trim() !== '';
              
              return (
                <div key={post.id} className={`post-card ${hasImage ? 'has-image' : 'no-image'}`}>
                  {hasImage && (
                    <div className="post-image">
                      <img 
                        className="post-img"
                        src={`data:image/*;base64,${post.imageBase64}`} 
                        alt="Post"
                      />
                      <div className="post-overlay">
                        <span className={statusConfig.className}>
                          {statusConfig.text}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="post-content">
                    <div className="post-header">
                      <div className="post-title-section">
                        {!hasImage && (
                          <div className="post-icon-placeholder">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <h3 className="post-title">{post.title}</h3>
                        {!hasImage && (
                          <span className={statusConfig.className}>
                            {statusConfig.text}
                          </span>
                        )}
                      </div>
                      <span className="post-category">{post.type}</span>
                    </div>
                    
                    <p className="post-description">{post.description}</p>
                    
                    <div className="post-metrics">
                      {post.compensationType === 'money' ? (
                        <div className="metric price-metric">
                          <DollarSign className="metric-icon" size={16} />
                          <span className="metric-value">{formatINRShortWithSymbol(post.budget)}</span>
                        </div>
                      ) : (
                        <div className="metric barter-metric">
                          <Gift className="metric-icon" size={16} />
                          <span className="metric-value">{post.compensationType || 'Barter'}</span>
                        </div>
                      )}
                      <div className="metric">
                        <Users className="metric-icon" size={16} />
                        <span>{formatFollowers(post.followers)}+ followers</span>
                      </div>
                      <div className="metric">
                        <Calendar className="metric-icon" size={16} />
                        {renderDeadline(post.deadline, true)}
                      </div>
                    </div>
                    
                    <div className="post-footer">
                      <div className="post-author">
                        <div className="author-avatar">
                          <User size={14} />
                        </div>
                        <Link to={`/profile/${post.createdBy.id}`}>
                          <span>{post.createdBy.name}</span>
                        </Link>
                      </div>
                      <div className="post-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{post.createdBy?.rating || 0}</span>
                      </div>
                    </div>

                    <div className="post-actions">
                      <button className="btn-primary" onClick={() => handleApplyClick(post)}>
                        {post.isCreatedByMe ? 'Edit Campaign' : 'Apply Now'}
                      </button>
                      <button className="btn-secondary" onClick={() => setSelectedPost(post)}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Rocket size={64} className="empty-icon" />
            <h3>No campaigns found</h3>
            <p>Try adjusting your filters or check back later for new opportunities.</p>
          </div>
        )}
      </div>

      <CreateCampaignDialog
        isOpen={!!selectedPostForEdit}
        onClose={() => setSelectedPostForEdit(null)}
        post={selectedPostForEdit}
        mode="edit"
      />

      {/* Details Dialog */}
      {selectedPost && (
        <div className="dialog-overlay" onClick={() => setSelectedPost(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="dialog-header">
              <div className="dialog-header-left">
                <span className={`dialog-status-badge ${getStatusConfig(selectedPost.status).className}`}>
                  {getStatusConfig(selectedPost.status).text}
                </span>
                <h2>{selectedPost.title}</h2>
                <span className="dialog-category-tag">{selectedPost.type}</span>
              </div>
              <button className="dialog-close" onClick={() => setSelectedPost(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="dialog-body">
              {selectedPost.imageBase64 && (
                <div className="dialog-image">
                  <img 
                    className="post-img"
                    src={`data:image/*;base64,${selectedPost.imageBase64}`} 
                    alt={selectedPost.title}
                  />
                </div>
              )}

              <div className="dialog-info-grid">
                <div className="info-item">
                  <span className="info-label">Min Followers</span>
                  <span className="info-value">
                    <Users size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {formatFollowers(selectedPost.followers)}+
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deadline</span>
                  <span className="info-value">
                    {renderDeadline(selectedPost.deadline)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Compensation</span>
                  <span className="info-value">
                    {selectedPost.compensationType === 'money'
                      ? formatINRShortWithSymbol(selectedPost.budget)
                      : selectedPost.compensationType || 'Barter'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Posted By</span>
                  <span className="info-value">
                    <Link to={`/profile/${selectedPost.createdBy.id}`} className="dialog-author-link">
                      {selectedPost.createdBy.name}
                    </Link>
                  </span>
                </div>
              </div>

              <div className="dialog-section">
                <h3>Description</h3>
                <p>{selectedPost.description}</p>
              </div>

              <div className="dialog-section">
                <h3>Deliverables</h3>
                <p>{selectedPost.deliverables}</p>
              </div>

              <div className="dialog-section">
                <h3>{selectedPost.compensationType === 'money' ? 'Compensation' : 'What You Get'}</h3>
                <p>{selectedPost.compensationDescription}</p>
              </div>

              <div className="dialog-section">
                <h3>Application Period</h3>
                <p>{new Date(selectedPost.createdAt).toLocaleDateString()} – {new Date(selectedPost.deadline).toLocaleDateString()}</p>
              </div>

              {/* Metadata row — styled, inside the scrollable body */}
              <div className="dialog-meta-row">
                <span className="dialog-meta-item">
                  <Clock size={12} />
                  Posted {new Date(selectedPost.createdAt).toLocaleString()}
                </span>
                {selectedPost.updatedAt && selectedPost.updatedAt !== selectedPost.createdAt && (
                  <span className="dialog-meta-item">
                    <CheckCircle size={12} />
                    Updated {new Date(selectedPost.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="dialog-footer">
              <button className="btn-secondary">
                <Share2 size={16} />
                Share Campaign
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleApplyClick(selectedPost)}
              >
                {selectedPost.isMyPost ? 'Manage Campaign' : 'Apply to Collaborate'}
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;