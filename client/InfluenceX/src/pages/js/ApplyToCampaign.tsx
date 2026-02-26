import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Loader, DollarSign, Users, Calendar,
  MapPin, CheckCircle, AlertCircle, Briefcase, Gift, Clock, Package,
} from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import { getPlatformConfig } from '../../utils/PlatformIcons';
import '../css/ApplyToCampaign.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  type: string;            // was "category"
  status: string;
  budget: number;
  compensationType: string;
  compensationDescription: string;
  deadline: string;           // deliverable deadline
  applicationDeadline?: string;
  followers: number;          // was "minFollowers"
  location: string;
  createdBy: { id: string; name: string; rating?: number };
  imageBase64?: string;
  platformsNeeded: string[];
  deliverables?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINRShort = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(2).replace(/\.00$/, '')} K`;
  return `₹${v}`;
};

const formatFollowers = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return n?.toString();
};

const getDays = (d: string) => {
  const now = new Date(); now.setHours(0,0,0,0);
  const dd  = new Date(d); dd.setHours(0,0,0,0);
  return Math.round((dd.getTime() - now.getTime()) / 86400000);
};

const DeadlinePill: React.FC<{ date: string }> = ({ date }) => {
  const days = getDays(date);
  const label = days < 0 ? 'Expired' : days === 0 ? 'Today!' : `${days}d left`;
  const urgent = days <= 3;
  return (
    <span className={`deadline-pill ${urgent ? 'deadline-pill-urgent' : 'deadline-pill-normal'}`}>
      {label}
    </span>
  );
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open':               return { label: 'Open',                 cls: 'status-open' };
    case 'applications-ended':
    case 'booked':
    case 'filled':             return { label: 'Applications Closed',  cls: 'status-filled' };
    case 'in-progress':        return { label: 'In Progress',          cls: 'status-progress' };
    case 'closed':             return { label: 'Closed',               cls: 'status-closed' };
    case 'completed':          return { label: 'Completed',            cls: 'status-completed' };
    default:                   return { label: 'Open',                 cls: 'status-open' };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const ApplyToCampaign: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [pitchMessage, setPitchMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => { fetchCampaignDetails(); }, [postId, authUser]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/posts/${postId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch campaign details');
      const data = await res.json();
      setCampaign(data);
      // Check if already applied (backend may return a flag, or we check separately)
      if (data.hasApplied !== undefined) setHasApplied(data.hasApplied);
    } catch (err) {
      setError('Failed to load campaign details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAppDeadlinePast = () => {
    if (!campaign?.applicationDeadline) return false;
    const d = new Date(campaign.applicationDeadline); d.setHours(23,59,59,999);
    return d < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) { setError('You must be logged in to apply'); navigate('/login'); return; }
    if (!pitchMessage.trim()) { setError('Please write a pitch message'); return; }
    if (pitchMessage.trim().length < 50) { setError('Your pitch should be at least 50 characters'); return; }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('http://localhost:8080/application/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, influencerId: authUser.id, pitchMessage: pitchMessage.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit application');
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── States ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="apply-page">
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading campaign details...</p>
      </div>
    </div>
  );

  if (error && !campaign) return (
    <div className="apply-page">
      <div className="error-container">
        <AlertCircle size={48} />
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go Back Home</button>
      </div>
    </div>
  );

  if (success) return (
    <div className="apply-page">
      <div className="success-container">
        <CheckCircle size={64} className="success-icon" />
        <h2>Application Submitted!</h2>
        <p>Your application has been sent to the brand. They will review it and get back to you soon.</p>
        <p className="redirect-text">Redirecting to home...</p>
      </div>
    </div>
  );

  if (hasApplied) return (
    <div className="apply-page">
      <div className="info-container">
        <CheckCircle size={48} className="info-icon" />
        <h2>Already Applied</h2>
        <p>You have already submitted an application to this campaign.</p>
        <button onClick={() => navigate('/')} className="btn-primary">View Other Campaigns</button>
      </div>
    </div>
  );

  if (isAppDeadlinePast()) return (
    <div className="apply-page">
      <div className="info-container">
        <AlertCircle size={48} className="info-icon info-icon-warn" />
        <h2>Applications Closed</h2>
        <p>The application period for this campaign has ended.</p>
        <button onClick={() => navigate('/')} className="btn-primary">View Other Campaigns</button>
      </div>
    </div>
  );

  const statusInfo = getStatusLabel(campaign?.status ?? 'open');

  return (
    <div className="apply-page">
      <div className="apply-container">
        {/* Header */}
        <div className="apply-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} /> Back
          </button>
          <h1>Apply to Campaign</h1>
        </div>

        {/* Campaign Overview */}
        {campaign && (
          <div className="campaign-overview">
            {campaign.imageBase64 && (
              <div className="campaign-image">
                <img src={`data:image/*;base64,${campaign.imageBase64}`} alt={campaign.title} />
              </div>
            )}

            <div className="campaign-header">
              <div className="campaign-header-left">
                <h2>{campaign.title}</h2>
                <div className="campaign-badges">
                  <span className="campaign-category">{campaign.type}</span>
                  <span className={`campaign-status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>
              </div>
            </div>

            <p className="campaign-description">{campaign.description}</p>

            <div className="campaign-details-grid">
              {/* Compensation */}
              <div className="detail-item">
                {campaign.compensationType === 'money'
                  ? <DollarSign size={20} />
                  : <Gift size={20} />}
                <div>
                  <span className="detail-label">
                    {campaign.compensationType === 'money' ? 'Budget' : 'Compensation'}
                  </span>
                  <span className="detail-value">
                    {campaign.compensationType === 'money'
                      ? formatINRShort(campaign.budget)
                      : campaign.compensationType || 'Barter'}
                  </span>
                  {campaign.compensationDescription && (
                    <span className="detail-sub">{campaign.compensationDescription}</span>
                  )}
                </div>
              </div>

              {/* Followers */}
              <div className="detail-item">
                <Users size={20} />
                <div>
                  <span className="detail-label">Min. Followers</span>
                  <span className="detail-value">{formatFollowers(campaign.followers)}+</span>
                </div>
              </div>

              {/* Application deadline */}
              {campaign.applicationDeadline && (
                <div className="detail-item">
                  <Calendar size={20} />
                  <div>
                    <span className="detail-label">Apply By</span>
                    <span className="detail-value">
                      {new Date(campaign.applicationDeadline).toLocaleDateString()}
                      <DeadlinePill date={campaign.applicationDeadline} />
                    </span>
                  </div>
                </div>
              )}

              {/* Deliverable deadline */}
              <div className="detail-item">
                <Clock size={20} />
                <div>
                  <span className="detail-label">Deliverable Due</span>
                  <span className="detail-value">
                    {new Date(campaign.deadline).toLocaleDateString()}
                    <DeadlinePill date={campaign.deadline} />
                  </span>
                </div>
              </div>

              {/* Location */}
              {campaign.location && (
                <div className="detail-item">
                  <MapPin size={20} />
                  <div>
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{campaign.location}</span>
                  </div>
                </div>
              )}

              {/* Platforms */}
              {campaign.platformsNeeded?.length > 0 && (
                <div className="detail-item detail-item-wide">
                  <Briefcase size={20} />
                  <div>
                    <span className="detail-label">Platforms</span>
                    <div className="platform-tags">
                      {campaign.platformsNeeded.map((p, i) => {
                        const cfg = getPlatformConfig(p);
                        return (
                          <span key={i} className="platform-tag">
                            <span className="platform-tag-emoji">{cfg.emoji}</span>
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deliverables */}
            {campaign.deliverables && (
              <div className="campaign-section">
                <h3>Deliverables</h3>
                <p>{campaign.deliverables}</p>
              </div>
            )}

            {/* What you get (non-money) */}
            {campaign.compensationType !== 'money' && campaign.compensationDescription && (
              <div className="campaign-section">
                <h3>What You Get</h3>
                <p>{campaign.compensationDescription}</p>
              </div>
            )}

            <div className="brand-info">
              <span className="brand-label">Posted by</span>
              <span className="brand-name">{campaign.createdBy?.name}</span>
              {campaign.createdBy?.rating !== undefined && (
                <span className="brand-rating">⭐ {campaign.createdBy.rating}</span>
              )}
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="application-form-section">
          <h3>Your Application</h3>
          <p className="form-description">
            Tell the brand why you're the perfect fit. Share your experience,
            audience demographics, and what makes you unique.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pitch">Your Pitch *</label>
              <textarea
                id="pitch"
                value={pitchMessage}
                onChange={e => setPitchMessage(e.target.value)}
                placeholder="Hi! I'd love to collaborate on this campaign. I have a strong presence in [your niche] with an engaged audience of [X] followers..."
                rows={8}
                required
                minLength={50}
                disabled={submitting}
              />
              <span className={`char-count ${pitchMessage.length < 50 ? 'char-count-warn' : 'char-count-ok'}`}>
                {pitchMessage.length} / 50 min characters
              </span>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />{error}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting || pitchMessage.trim().length < 50}>
                {submitting
                  ? <><Loader className="spinner" size={16} />Submitting...</>
                  : <><Send size={16} />Submit Application</>}
              </button>
            </div>
          </form>

          <div className="info-box">
            <CheckCircle size={20} />
            <div>
              <strong>What happens next?</strong>
              <p>
                The brand will review your application along with your profile.
                You'll be notified when they make a decision. Check your dashboard
                to track the status of your applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyToCampaign;