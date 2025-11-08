import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Loader, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import '../css/ApplyToCampaign.css';

interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  minFollowers: number;
  location: string;
  authorName: string;
  image?: string;
  platformsNeeded: string[];
  requirements?: string;
  deliverables?: string;
}

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

  useEffect(() => {
    fetchCampaignDetails();
    // checkIfAlreadyApplied();
  }, [postId,authUser]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign details');
      
      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      setError('Failed to load campaign details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const checkIfAlreadyApplied = false;
//         async () => {
//     if (!authUser) return;
    
//     try {
//       const response = await fetch(
//         `http://localhost:8080/api/applications/check?postId=${postId}&influencerId=${authUser.id}`
//       );
//       const data = await response.json();
//       setHasApplied(data.hasApplied);
//     } catch (err) {
//       console.error('Error checking application status:', err);
//     }
//   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      setError('You must be logged in to apply');
      navigate('/login');
      return;
    }

    if (!pitchMessage.trim()) {
      setError('Please write a pitch message');
      return;
    }

    if (pitchMessage.trim().length < 50) {
      setError('Your pitch should be at least 50 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('http://localhost:8080/application/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          influencerId: authUser.id,
          pitchMessage: pitchMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString();
  };

  if (loading) {
    return (
      <div className="apply-page">
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="apply-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="apply-page">
        <div className="success-container">
          <CheckCircle size={64} className="success-icon" />
          <h2>Application Submitted!</h2>
          <p>Your application has been sent to the brand. They will review it and get back to you soon.</p>
          <p className="redirect-text">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="apply-page">
        <div className="info-container">
          <CheckCircle size={48} className="info-icon" />
          <h2>Already Applied</h2>
          <p>You have already submitted an application to this campaign.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            View Other Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-container">
        {/* Header */}
        <div className="apply-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Apply to Campaign</h1>
        </div>

        {/* Campaign Overview */}
        {campaign && (
          <div className="campaign-overview">
            {campaign.image && (
              <div className="campaign-image">
                <img src={campaign.image} alt={campaign.title} />
              </div>
            )}
            
            <div className="campaign-header">
              <h2>{campaign.title}</h2>
              <span className="campaign-category">{campaign.category}</span>
            </div>

            <p className="campaign-description">{campaign.description}</p>

            <div className="campaign-details-grid">
              <div className="detail-item">
                <DollarSign size={20} />
                <div>
                  <span className="detail-label">Budget</span>
                  <span className="detail-value">{formatCurrency(campaign.budget)}</span>
                </div>
              </div>

              <div className="detail-item">
                <Users size={20} />
                <div>
                  <span className="detail-label">Min. Followers</span>
                  <span className="detail-value">{formatFollowers(campaign.minFollowers)}+</span>
                </div>
              </div>

              <div className="detail-item">
                <Calendar size={20} />
                <div>
                  <span className="detail-label">Deadline</span>
                  <span className="detail-value">
                    {new Date(campaign.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {campaign.location && (
                <div className="detail-item">
                  <MapPin size={20} />
                  <div>
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{campaign.location}</span>
                  </div>
                </div>
              )}

              {campaign.platformsNeeded && campaign.platformsNeeded.length > 0 && (
                <div className="detail-item platforms">
                  <Briefcase size={20} />
                  <div>
                    <span className="detail-label">Platforms</span>
                    <div className="platform-tags">
                      {campaign.platformsNeeded.map((platform, idx) => (
                        <span key={idx} className="platform-tag">{platform}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {campaign.requirements && (
              <div className="campaign-section">
                <h3>Requirements</h3>
                <p>{campaign.requirements}</p>
              </div>
            )}

            {campaign.deliverables && (
              <div className="campaign-section">
                <h3>Deliverables</h3>
                <p>{campaign.deliverables}</p>
              </div>
            )}

            <div className="brand-info">
              <span className="brand-label">Posted by</span>
              <span className="brand-name">{campaign.authorName}</span>
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="application-form-section">
          <h3>Your Application</h3>
          <p className="form-description">
            Tell the brand why you're the perfect fit for this campaign. Share your experience, 
            audience demographics, and what makes you unique.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pitch">Your Pitch *</label>
              <textarea
                id="pitch"
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                placeholder="Hi! I'd love to collaborate on this campaign. I have a strong presence in [your niche] with an engaged audience of [X] followers. My previous collaborations include... I can deliver..."
                rows={8}
                required
                minLength={50}
                disabled={submitting}
              />
              <span className="char-count">
                {pitchMessage.length} characters (minimum 50)
              </span>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || pitchMessage.trim().length < 50}
              >
                {submitting ? (
                  <>
                    <Loader className="spinner" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Application
                  </>
                )}
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