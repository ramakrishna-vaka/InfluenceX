import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Clock, Package, DollarSign, Gift } from 'lucide-react';
import '../css/CampaignLifecycle.css';
import ApplicationsList from './ApplicationsList';
import ApplicationTimeline from './ApplicationTimeline';
import type { Application } from './ApplicationsList';

interface Campaign {
  id: string;
  title: string;
  image?: string;
  type: string;
  price: number;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  description: string;
  compensationType: string;
  compensationDescription: string;
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
  influencerId?: string;
  influencerName?: string;
  currentStatus?: any;
}

const CampaignLifecycle: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsFilter, setStatsFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const campaignResponse = await fetch(`${API_BASE_URL}/posts/${campaignId}`, {
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

  const getStatusCounts = () => ({
    total: applications.length,
    pending: applications.filter(a => a.currentStatus === 'PENDING').length,
    accepted: applications.filter(a => a.currentStatus === 'ACCEPTED' || a.currentStatus === 'IN_PROGRESS').length,
    inProgress: applications.filter(a => a.currentStatus === 'IN_PROGRESS').length,
    delivered: applications.filter(a => a.currentStatus === 'DELIVERED').length,
    completed: applications.filter(a => a.currentStatus === 'COMPLETED').length,
  });

  const stats = getStatusCounts();

  if (loading) {
    return (
      <div className="lifecycle-container">
        <div className="loading-state">
          <div className="loading-spinner" />
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
          <button onClick={() => navigate('/my-promotions')} className="btn-back">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lifecycle-container">

      {/* ── Compact single-row topbar: back + campaign info + stat pills ── */}
      <div className="lifecycle-topbar">

        {/* Left: back button + campaign identity */}
        <div className="topbar-left">
          <button onClick={() => navigate('/my-promotions')} className="btn-back-compact">
            <ArrowLeft size={16} />
          </button>

          {campaign.image && (
            <img src={campaign.image} alt={campaign.title} className="topbar-campaign-img" />
          )}

          <div className="topbar-campaign-text">
            <span className="topbar-campaign-title">{campaign.title}</span>
            <div className="topbar-campaign-meta">
              <span className="topbar-type-badge">{campaign.type}</span>
              <span className="topbar-meta-chip">
                {campaign.compensationType === 'money'
                  ? <><DollarSign size={11} />${campaign.compensationDescription}</>
                  : <><Gift size={11} />{campaign.compensationDescription}</>}
              </span>
              <span className="topbar-meta-chip">
                <Clock size={11} />
                {new Date(campaign.deadline).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: compact stat pills */}
        <div className="topbar-stats">
          <button
            className={`stat-pill stat-pill-total ${statsFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatsFilter('ALL')}
          >
            <Users size={12} />
            <strong>{stats.total}</strong>
            <span>All</span>
          </button>
          <button
            className={`stat-pill stat-pill-pending ${statsFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatsFilter('PENDING')}
          >
            <Clock size={12} />
            <strong>{stats.pending}</strong>
            <span>Pending</span>
          </button>
          <button
            className={`stat-pill stat-pill-progress ${statsFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setStatsFilter('IN_PROGRESS')}
          >
            <Package size={12} />
            <strong>{stats.inProgress}</strong>
            <span>Active</span>
          </button>
          <button
            className={`stat-pill stat-pill-completed ${statsFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatsFilter('COMPLETED')}
          >
            <CheckCircle size={12} />
            <strong>{stats.completed}</strong>
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* ── Main split panel — untouched ── */}
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