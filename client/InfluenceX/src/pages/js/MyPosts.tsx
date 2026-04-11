import React, { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, Calendar, DollarSign, Clock, Activity, Gift, Trash2 } from 'lucide-react';
import '../css/MyPosts.css';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  imageBase64: any;
  id: string;
  title: string;
  image?: string;
  category: string;
  price: number;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  postStatus: string;
  applicants: number;
  pendingCount: number;
  acceptedCount: number;
  inProgressCount: number;
  completedCount: number;
  description: string;
  applications: any[];
  compensationType: string;
  compensationDescription: string;
}

const MyPosts: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/my-posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE_URL}/delete/post/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      } else {
        const msg = await response.text();
        console.error('Delete failed:', msg);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/lifecycle`);
  };

  const getTotalStats = () => {
    return {
      totalCampaigns: campaigns.length,
      totalApplications: campaigns.reduce((sum, c) => sum + c.applications.length, 0),
      activeCampaigns: campaigns.filter(c => c.postStatus?.toLowerCase() === 'open' || c.postStatus?.toLowerCase() === 'in-progress').length,
      completedCampaigns: campaigns.filter(c => c.postStatus?.toLowerCase() === 'completed').length,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="updated-campaigns-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="updated-campaigns-container">
      <div className="campaigns-page-header">
        <div>
          <h1>Campaign Management</h1>
          <p className="page-description">Track and manage your influencer marketing campaigns</p>
        </div>
      </div>

      <div className="overview-stats">
        <div className="overview-card">
          <div className="overview-icon campaigns">
            <Activity size={28} />
          </div>
          <div className="overview-content">
            <p className="overview-label">Total Campaigns</p>
            <h2>{stats?.totalCampaigns}</h2>
            <span className="overview-sublabel">{stats.activeCampaigns} active</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon applications">
            <Users size={28} />
          </div>
          <div className="overview-content">
            <p className="overview-label">Total Applications</p>
            <h2>{stats.totalApplications}</h2>
            <span className="overview-sublabel">All campaigns</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon active">
            <TrendingUp size={28} />
          </div>
          <div className="overview-content">
            <p className="overview-label">Active Campaigns</p>
            <h2>{stats.activeCampaigns}</h2>
            <span className="overview-sublabel">In progress</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon completed">
            <Eye size={28} />
          </div>
          <div className="overview-content">
            <p className="overview-label">Completed</p>
            <h2>{stats.completedCampaigns}</h2>
            <span className="overview-sublabel">Successfully finished</span>
          </div>
        </div>
      </div>

      <div className="campaigns-section">
        <div className="section-header">
          <h2>Your Campaigns</h2>
          <p>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="empty-campaigns-state">
            <Activity size={64} />
            <h3>No campaigns yet</h3>
            <p>Create your first campaign to start collaborating with influencers</p>
            <button className="btn-create-first" onClick={() => navigate('/create-campaign')}>
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                className="campaign-grid-card"
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <div className="card-menu-wrapper" onClick={e => e.stopPropagation()}>
                  <button
                    className="card-menu-btn"
                    onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                  >
                    ···
                  </button>
                  {openMenuId === campaign.id && (
                    <div className="card-menu-dropdown">
                      <button className="card-menu-delete" onClick={e => deletePost(e, campaign.id)}>
                        <Trash2 size={14} />
                        Delete post
                      </button>
                    </div>
                  )}
                </div>

                {campaign.imageBase64 && (
                  <div className="campaign-image-container">
                    <img src={`data:image/*;base64,${campaign.imageBase64}`} alt={campaign.title} />
                    <div className={`status-overlay status-${campaign.status}`}>
                      {campaign.status}
                    </div>
                  </div>
                )}

                <div className="campaign-card-content">
                  <div className="campaign-card-header">
                    <h3>{campaign.title}</h3>
                    <span className="campaign-category-badge">{campaign.category}</span>
                  </div>

                  <div className="campaign-meta-info">
                    <div className="meta-info-item">
                      {campaign.compensationType === 'money' ? (
                        <><DollarSign size={16} /><span>${campaign.compensationDescription}</span></>
                      ) : (
                        <><Gift size={16} /><span>{campaign.compensationDescription || 'Other'}</span></>
                      )}
                    </div>
                    <div className="meta-info-item">
                      <Calendar size={16} />
                      <span>{new Date(campaign.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  <div className="campaign-progress">
                    <div className="progress-item">
                      <div className="progress-label">
                        <Users size={14} />
                        <span>Applications</span>
                      </div>
                      <span className="progress-value">{campaign.applications.length}</span>
                    </div>
                    {campaign.pendingCount > 0 && (
                      <div className="progress-item pending">
                        <div className="progress-label">
                          <Clock size={14} />
                          <span>Pending</span>
                        </div>
                        <span className="progress-value">{campaign.pendingCount}</span>
                      </div>
                    )}
                    {campaign.inProgressCount > 0 && (
                      <div className="progress-item in-progress">
                        <div className="progress-label">
                          <Activity size={14} />
                          <span>Active</span>
                        </div>
                        <span className="progress-value">{campaign.inProgressCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="campaign-card-footer">
                    <span className="view-lifecycle">View Campaign Lifecycle →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;