import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Clock, Package, Star, DollarSign } from 'lucide-react';
import '../css/CampaignLifecycle.css';
import ApplicationsList from './ApplicationsList';
import ApplicationTimeline from './ApplicationTimeline';

interface Campaign {
  id: string;
  title: string;
  image?: string;
  category: string;
  price: number;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  description: string;
}

interface ApplicationLifecycle {
  id: string;
  influencer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  followers: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'delivered' | 'completed';
  appliedAt: string;
  acceptedAt?: string;
  deliveryDeadline?: string;
  deliveredAt?: string;
  reviewedAt?: string;
  paidAt?: string;
  pitchMessage: string;
  deliverables?: {
    url: string;
    type: string;
    uploadedAt: string;
  }[];
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

const CampaignLifecycle: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<ApplicationLifecycle[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationLifecycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsFilter, setStatsFilter] = useState<'all' | 'pending' | 'accepted' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const campaignResponse = await fetch(`http://localhost:8080/posts/${campaignId}`, {
        credentials: 'include'
      });
      const campaignData = await campaignResponse.json();
      setCampaign(campaignData);
      setApplications(campaignData?.applications || []);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted' || a.status === 'in-progress').length,
      inProgress: applications.filter(a => a.status === 'in-progress').length,
      delivered: applications.filter(a => a.status === 'delivered').length,
      completed: applications.filter(a => a.status === 'completed').length,
    };
  };

  const stats = getStatusCounts();

  if (loading) {
    return (
      <div className="lifecycle-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="lifecycle-container">
        <div className="error-state">
          <p>Campaign not found</p>
          <button onClick={() => navigate('/created-campaigns')} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lifecycle-container">
      <div className="lifecycle-header">
        <button onClick={() => navigate('/created-campaigns')} className="btn-back-header">
          <ArrowLeft size={20} />
          Back to Campaigns
        </button>
        <div className="campaign-header-info">
          <div className="campaign-header-left">
            {campaign.image && (
              <img src={campaign.image} alt={campaign.title} className="campaign-header-image" />
            )}
            <div>
              <h1>{campaign.title}</h1>
              <p className="campaign-category">{campaign.category}</p>
            </div>
          </div>
          <div className="campaign-header-meta">
            <div className="meta-item">
              <DollarSign size={18} />
              <span>${campaign.price}</span>
            </div>
            <div className="meta-item">
              <Clock size={18} />
              <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-dashboard">
        <div className="stat-card" onClick={() => setStatsFilter('all')}>
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setStatsFilter('pending')}>
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setStatsFilter('in-progress')}>
          <div className="stat-icon progress">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setStatsFilter('completed')}>
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="lifecycle-content">
        <ApplicationsList
          applications={applications}
          selectedApplication={selectedApplication}
          onSelectApplication={setSelectedApplication}
          filterStatus={statsFilter}
          onRefresh={fetchCampaignData}
        />
        <ApplicationTimeline
          application={selectedApplication}
          campaign={campaign}
          onRefresh={fetchCampaignData}
        />
      </div>
    </div>
  );
};

export default CampaignLifecycle;