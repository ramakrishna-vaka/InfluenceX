import React, { useState, useEffect ,useMemo} from 'react';
import { Rocket, Users, DollarSign, Calendar, Filter, Image as ImageIcon, User, Clock, CheckCircle, Star,X, Share2, ExternalLink  } from 'lucide-react';
import '../css/Home.css';
import type { Post } from '../../utils/Posts';
import { useAuth } from '../../AuthProvider';
import { useCampaignFilter } from '../../CampaignFilterContext';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const [filterCategory, setFilterCategory] = useState('all');
  const [showMyPosts, setShowMyPosts] = useState(false);

  const categories = ['Technology', 'Fashion', 'Fitness', 'Food', 'Travel', 'Beauty', 'Gaming'];

  const {searchQuery,filters,sortBy}= useCampaignFilter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/posts');
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

  // Memoized filtered and sorted posts using context values
  //without useMemo whatever changes, the entire filtering and sorting logic runs again causing performance issues
  //with useMemo, it only recalculates when dependencies change
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Apply search query from context
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter from context (if category is set)
    if (filters.category !== 'all') {
      result = result.filter(post => post.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Apply local category filter (from dropdown)
    if (filterCategory !== 'all') {
      result = result.filter(post => post.category === filterCategory);
    }

    // Apply status filter from context
    if (filters.status !== 'all') {
      result = result.filter(post => post.status === filters.status);
    }

    // Apply budget filter from context
    if (filters.budget !== 'all') {
      const [min, max] = filters.budget.split('-').map(v => v.replace('+', ''));
      const minBudget = parseInt(min) || 0;
      const maxBudget = max ? parseInt(max) : Infinity;
      result = result.filter(post => post.price >= minBudget && post.price <= maxBudget);
    }

    // Apply "My Posts" filter
    if (showMyPosts) {
      result = result.filter(post => post.isMyPost);
    }

    // Apply sorting from context
    //const sortKey = sortBy !== 'recent' ? sortBy : localSortBy;
    const sortKey = sortBy;
    result.sort((a, b) => {
      switch (sortKey) {
        case 'recent':
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'budget_high':
        case 'price-high':
          return b.price - a.price;
        case 'budget_low':
        case 'price-low':
          return a.price - b.price;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'followers':
          return b.minFollowers - a.minFollowers;
        default:
          return 0;
      }
    });

    return result;
  }, [posts, searchQuery, sortBy, filterCategory, showMyPosts]); //dependencies

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
    if (post.isMyPost) {
      // Navigate to manage campaign page
      window.location.href = `/manage-campaign/${post.id}`;
    }
    else {
      // Navigate to apply page
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
            {/* <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Campaigns</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Creators</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$2M+</span>
              <span className="stat-label">Paid Out</span>
            </div> 
          </div>  */}
        </div>
      </div>

      {/* Sticky Controls */}
      {/* <div className="controls-container">
        <div className="controls-section">
          <div className="controls-left">
            <div className="filter-group">
              <Filter size={20} />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="followers">Min Followers</option>
              </select>
            </div>

            <button 
              className={`toggle-btn ${showMyPosts ? 'active' : ''}`}
              onClick={() => setShowMyPosts(!showMyPosts)}
            >
              My Posts
            </button>
          </div>

          <div className="results-count">
            {filteredPosts.length} campaigns found
          </div>
        </div>
      </div> */}

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
                      <span className="post-category">{post.category}</span>
                    </div>
                    
                    <p className="post-description">{post.description}</p>
                    
                    <div className="post-metrics">
                      <div className="metric price-metric">
                        <DollarSign className="metric-icon" size={16} />
                        <span className="metric-value">{formatCurrency(post.price)}</span>
                      </div>
                      <div className="metric">
                        <Users className="metric-icon" size={16} />
                        <span>{formatFollowers(post.minFollowers)}+ followers</span>
                      </div>
                      <div className="metric">
                        <Calendar className="metric-icon" size={16} />
                        <span>{new Date(post.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="post-footer">
                      <div className="post-author">
                        <div className="author-avatar">
                          <User size={14} />
                        </div>
                        <span>{post.authorName}</span>
                      </div>
                      <div className="post-rating">
                        <Star size={14} fill="currentColor" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <div className="post-actions">
                      <button className="btn-primary" onClick={() => {
                        handleApplyClick(post);
                      }}>
                        {post.isMyPost ? 'Manage Campaign' : 'Apply Now'}
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

       {/* Details Dialog */}
      {selectedPost && (
        <div className="dialog-overlay" onClick={() => setSelectedPost(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{selectedPost.title}</h2>
              <button 
                className="dialog-close"
                onClick={() => setSelectedPost(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="dialog-body">
              {selectedPost.imageBase64 && (
                <div className="dialog-image">
                  <img src={selectedPost.imageBase64} alt={selectedPost.title} />
                </div>
              )}

              <div className="dialog-info-grid">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{selectedPost.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`info-value ${getStatusConfig(selectedPost.status).className}`}>
                    {getStatusConfig(selectedPost.status).text}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Budget</span>
                  <span className="info-value">{formatCurrency(selectedPost.price)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Min Followers</span>
                  <span className="info-value">{formatFollowers(selectedPost.minFollowers)}+</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deadline</span>
                  <span className="info-value">
                    {new Date(selectedPost.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Posted By</span>
                  <span className="info-value">{selectedPost.authorName}</span>
                </div>
              </div>

              <div className="dialog-section">
                <h3>Description</h3>
                <p>{selectedPost.description}</p>
              </div>

              {/* Add more sections as needed: Requirements, Deliverables, etc. */}
            </div>

            <div className="dialog-footer">
              <button 
                className="btn-secondary"
                //onClick={() => handleShareCampaign(selectedPost.id)}
              >
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