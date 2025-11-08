// MyPosts.tsx
import React, { useEffect } from 'react';
import { Users, DollarSign, Calendar, Image as ImageIcon, User,  Star } from 'lucide-react';
import { FileText, Plus } from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import CreateCampaignDialog from './../../components/js/CreateCampaignDialog';
import { useState } from 'react';
import type { Post } from '../../utils/Posts'

const MyPosts: React.FC = () => {
  const { authUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => { setIsOpen(false); }
  const [isLoading, setLoading] = useState(true);
  const [myPostsData, setMyPosts] = useState<Post[]>([]);
   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchMyPosts = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:8080/my-posts', {
            method:'GET',
            headers:{
                    'Content-Type':'application/json'
                },
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          const myPostsData = await response.json();
          setMyPosts(myPostsData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
  
      fetchMyPosts();
  }, []);
  
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString();
  };
  
  return (<>
    <div className="main-content">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            My <span className="gradient-text">Campaigns</span>
          </h1>
          <p className="hero-subtitle">
            Manage and track all your brand collaboration campaigns
          </p>
        </div>
      </div>
      
      <div className="content-section">
        {myPostsData.length > 0 ? (
          <div className="posts-grid">
            {myPostsData.map(post => {
              const statusConfig = getStatusConfig(post.status);
              const hasImage = post.image && post.image.trim() !== '';
              
              return (
                <div key={post.id} className={`post-card ${hasImage ? 'has-image' : 'no-image'}`}>
                  {hasImage && (
                    <div className="post-image">
                      <img src={post.image} alt={post.title} />
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
                      <button className="btn-primary">
                        {post.isMyPost ? 'Manage Campaign' : 'Apply Now'}
                      </button>
                      <button className="btn-secondary">
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
            <FileText size={64} className="empty-icon" />
            <h3>No campaigns yet</h3>
            <p>Create your first campaign to start collaborating with influencers.</p>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setIsOpen(true)}>
              <Plus size={20} style={{ marginRight: '8px' }} />
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </div >
    <CreateCampaignDialog isOpen={isOpen} onClose={close} userId={authUser?.id} />
    </>
  );
};

export default MyPosts;