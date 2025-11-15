import React, { useState, useEffect } from 'react';
import { Users, Eye, CheckCircle, XCircle, MessageSquare, Clock, DollarSign, Calendar } from 'lucide-react';
import '../css/CreatedCampaigns.css';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  influencer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }
  followers: number;
  pitchMessage: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface Campaign {
  id: string;
  title: string;
  image?: string;
  category: string;
  price: number;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  applicationsCount: number;
  pendingCount: number;
  acceptedCount: number;
  applications: Application[];
}

const CreatedCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/my-posts', {
            method:'GET',
            headers:{
                    'Content-Type':'application/json'
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

  const handleApplicationAction = async (
    campaignId: string,
    applicationId: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      await fetch(`http://localhost:8080/campaigns/${campaignId}/applications/${applicationId}/${action}`, {
        method: 'POST',
      });
      // Refresh campaigns
      fetchCampaigns();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleViewProfile = (influencerId: string) => {
    window.location.href = `/influencer/${influencerId}`;
  };

 const handleSendMessage = (application: Application,selectedCampaign:Campaign) => {
  navigate(`/messages?userId=${application.influencer.id}`, {
    state: { application ,post:selectedCampaign},
  });
};

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString();
  };

  const filteredApplications = selectedCampaign?.applications?.filter(app => 
    filterStatus === 'all' ? true : app.status === filterStatus
  ) || [];

  if (loading) {
    return (
      <div className="created-campaigns-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="created-campaigns-container">
      <div className="page-header">
        <h1>My Created Campaigns</h1>
        <p className="page-subtitle">Manage your campaigns and review influencer applications</p>
      </div>

      <div className="campaigns-layout">
        {/* Left Side - Campaigns List */}
        <div className="campaigns-list">
          <div className="campaigns-list-header">
            <h2>Campaigns ({campaigns.length})</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="empty-campaigns">
              <p>No campaigns created yet</p>
            </div>
          ) : (
            campaigns.map(campaign => (
              <div
                key={campaign.id}
                className={`campaign-card ${selectedCampaign?.id === campaign.id ? 'active' : ''}`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                {campaign.image && (
                  <div className="campaign-thumbnail">
                    <img src={campaign.image} alt={campaign.title} />
                  </div>
                )}
                <div className="campaign-info">
                  <h3>{campaign.title}</h3>
                  <div className="campaign-meta">
                    <span className="campaign-category">{campaign.category}</span>
                    <span className={`campaign-status status-${campaign.status}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="campaign-stats">
                    <div className="stat">
                      <Users size={14} />
                      <span>{campaign.applicationsCount} applications</span>
                    </div>
                    {campaign.pendingCount > 0 && (
                      <div className="stat pending">
                        <Clock size={14} />
                        <span>{campaign.pendingCount} pending</span>
                      </div>
                    )}
                    {campaign.acceptedCount > 0 && (
                      <div className="stat accepted">
                        <CheckCircle size={14} />
                        <span>{campaign.acceptedCount} accepted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side - Applications Panel */}
        <div className="applications-panel">
          {selectedCampaign ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>{selectedCampaign.title}</h2>
                  <p className="applications-count">
                    {selectedCampaign.applicationsCount} total applications
                  </p>
                </div>
                <div className="filter-tabs">
                  <button
                    className={filterStatus === 'all' ? 'active' : ''}
                    onClick={() => setFilterStatus('all')}
                  >
                    All ({selectedCampaign.applicationsCount})
                  </button>
                  <button
                    className={filterStatus === 'pending' ? 'active' : ''}
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending ({selectedCampaign.pendingCount})
                  </button>
                  <button
                    className={filterStatus === 'accepted' ? 'active' : ''}
                    onClick={() => setFilterStatus('accepted')}
                  >
                    Accepted ({selectedCampaign.acceptedCount})
                  </button>
                  <button
                    className={filterStatus === 'rejected' ? 'active' : ''}
                    onClick={() => setFilterStatus('rejected')}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              <div className="applications-list">
                {filteredApplications.length === 0 ? (
                  <div className="empty-applications">
                    <p>No {filterStatus !== 'all' ? filterStatus : ''} applications</p>
                  </div>
                ) : (
                  filteredApplications.map(application => (
                    <div key={application.id} className="application-card">
                      <div className="application-header">
                        <div className="influencer-info">
                          <div className="influencer-avatar">
                            {application.influencer.avatar ? (
                              <img src={application.influencer.avatar} alt={application.influencer.name} />
                            ) : (
                              <div className="avatar-placeholder">
                                {application.influencer.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3>{application.influencer.name}</h3>
                            <p className="follower-count">
                              <Users size={14} />
                              {formatFollowers(application.followers)} followers
                            </p>
                          </div>
                        </div>
                        <span className={`application-status status-${application.status}`}>
                          {application.status}
                        </span>
                      </div>

                      <div className="application-message">
                        <p className="message-label">Application Message:</p>
                        <p className="message-text">{application.pitchMessage}</p>
                      </div>

                      <div className="application-footer">
                        <span className="applied-date">
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                        <div className="application-actions">
                          <button
                            className="btn-view-profile"
                            onClick={() => handleViewProfile(application.influencer.id)}
                          >
                            <Eye size={16} />
                            View Profile
                          </button>
                          <button
                            className="btn-message"
                            onClick={() => handleSendMessage(application,selectedCampaign)}
                          >
                            <MessageSquare size={16} />
                            Message
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                className="btn-accept"
                                onClick={() => handleApplicationAction(
                                  selectedCampaign.id,
                                  application.id,
                                  'accept'
                                )}
                              >
                                <CheckCircle size={16} />
                                Accept
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleApplicationAction(
                                  selectedCampaign.id,
                                  application.id,
                                  'reject'
                                )}
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="no-campaign-selected">
              <Users size={64} />
              <p>Select a campaign to view applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatedCampaigns;