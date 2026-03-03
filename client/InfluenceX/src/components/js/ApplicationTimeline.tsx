/**
 * ApplicationTimeline.tsx
 *
 * Unified timeline panel used by TWO flows:
 *
 *  1. CampaignLifecycle  (brand side) — pass `application` + `campaign`
 *     The campaign header stays fixed; only the timeline changes per application.
 *
 *  2. MyCollaborations   (influencer side) — pass `collaboration`
 *     Both the campaign header AND the timeline change when user picks a different card.
 *
 * Props:
 *   application?   — ApplicationLifecycle object from CampaignLifecycle flow
 *   campaign?      — Campaign object (only needed in CampaignLifecycle flow)
 *   collaboration? — Collaboration object from MyCollaborations flow
 *   onRefresh      — callback to reload parent data after actions
 */

import React, { useState } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, Package,
  DollarSign, Star, Send, Eye, AlertCircle,
  Calendar, MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/ApplicationTimeline.css';
import type { Collaboration, StatusEvent } from '../../pages/js/MyCollaborations';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationLifecycle {
  id: string;
  influencer: { id: string; name: string; email: string; avatar?: string };
  followers: number;
  status: string;
  appliedAt: string;
  acceptedAt?: string;
  deliveryDeadline?: string;
  deliveredAt?: string;
  reviewedAt?: string;
  paidAt?: string;
  pitchMessage: string;
  deliverables?: { url: string; type: string; uploadedAt: string }[];
  review?: { rating: number; comment: string; createdAt: string };
}

interface Campaign {
  id: string;
  title: string;
  deadline: string;
}

interface Props {
  // CampaignLifecycle flow
  application?: ApplicationLifecycle | null;
  campaign?: Campaign;
  // MyCollaborations flow
  collaboration?: Collaboration | null;
  onRefresh: () => void;
}

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  ring: string;
  description: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  created: {
    label: 'Application Created',
    icon: <FileText size={18} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: 'Your application was successfully submitted.',
  },
  pending: {
    label: 'Pending Review',
    icon: <Clock size={18} />,
    color: '#d97706', bg: '#fef3c7', ring: '#fcd34d',
    description: 'Waiting for the brand to review your application.',
  },
  accepted: {
    label: 'Accepted',
    icon: <CheckCircle size={18} />,
    color: '#2563eb', bg: '#dbeafe', ring: '#93c5fd',
    description: 'The brand accepted your application. Get started!',
  },
  reviewing: {
    label: 'Content Under Review',
    icon: <Eye size={18} />,
    color: '#7c3aed', bg: '#ede9fe', ring: '#c4b5fd',
    description: 'The brand is reviewing your submitted content.',
  },
  pending_deliverables: {
    label: 'Deliverables Required',
    icon: <Send size={18} />,
    color: '#0891b2', bg: '#cffafe', ring: '#67e8f9',
    description: 'Please submit your deliverables for this campaign.',
  },
  settled: {
    label: 'Settled',
    icon: <DollarSign size={18} />,
    color: '#059669', bg: '#d1fae5', ring: '#6ee7b7',
    description: 'Campaign completed and payment processed. Great work!',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle size={18} />,
    color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5',
    description: 'Your application was not selected for this campaign.',
  },
  withdraw: {
    label: 'Withdrawn',
    icon: <AlertCircle size={18} />,
    color: '#64748b', bg: '#f1f5f9', ring: '#cbd5e1',
    description: 'You withdrew your application from this campaign.',
  },
  // Legacy keys from CampaignLifecycle flow
  'in-progress': {
    label: 'In Progress',
    icon: <Package size={18} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: 'Content creation is in progress.',
  },
  delivered: {
    label: 'Delivered',
    icon: <Send size={18} />,
    color: '#0891b2', bg: '#cffafe', ring: '#67e8f9',
    description: 'Deliverables have been submitted.',
  },
  completed: {
    label: 'Completed',
    icon: <Star size={18} />,
    color: '#059669', bg: '#d1fae5', ring: '#6ee7b7',
    description: 'Campaign successfully completed.',
  },
};

const getMeta = (status: string): StatusMeta =>
  STATUS_META[status.toLowerCase().replace(/ /g, '_')] ?? {
    label: status,
    icon: <Clock size={18} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: '',
  };

const formatDt = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

const ApplicationTimeline: React.FC<Props> = ({
  application,
  campaign,
  collaboration,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // ── Determine which flow we're in ──────────────────────────────────────────
  const isCampaignFlow = !!application;
  const isCollabFlow   = !!collaboration;
  const hasContent     = isCampaignFlow || isCollabFlow;

  // ── Build the event list ───────────────────────────────────────────────────
  let events: StatusEvent[] = [];

  if (isCampaignFlow && application) {
    // Reconstruct events from the application milestone timestamps
    // (CampaignLifecycle doesn't have applicationStatusList, so we synthesise)
    const synthesised: StatusEvent[] = [
      { status: 'created',      timestamp: application.appliedAt },
    ];
    if (application.status === 'rejected') {
      synthesised.push({ status: 'rejected', timestamp: application.acceptedAt || application.appliedAt });
    } else {
      if (application.acceptedAt)  synthesised.push({ status: 'accepted',    timestamp: application.acceptedAt });
      if (application.acceptedAt)  synthesised.push({ status: 'in-progress', timestamp: application.acceptedAt });
      if (application.deliveredAt) synthesised.push({ status: 'delivered',   timestamp: application.deliveredAt });
      if (application.reviewedAt)  synthesised.push({ status: 'reviewing',   timestamp: application.reviewedAt });
      if (application.paidAt)      synthesised.push({ status: 'completed',   timestamp: application.paidAt });
    }
    events = synthesised;
  } else if (isCollabFlow && collaboration) {
    events = collaboration.applicationStatusList ?? [];
    // Ensure a 'created' anchor exists
    if (!events[0] || events[0].status.toLowerCase() !== 'created') {
      events = [
        { status: 'CREATED', timestamp: events[0]?.timestamp ?? new Date().toISOString() },
        ...events,
      ];
    }
  }

  const lastStatus = events.length > 0
    ? events[events.length - 1].status.toLowerCase().replace(/ /g, '_')
    : (application?.status ?? 'pending');
  const currentMeta = getMeta(lastStatus);

  // ── Campaign info for header ───────────────────────────────────────────────
  const campaignTitle    = campaign?.title    ?? collaboration?.title    ?? '';
  const campaignDeadline = campaign?.deadline ?? collaboration?.deadline ?? '';
  const campaignId       = campaign?.id       ?? collaboration?.postId   ?? '';

  // ── Actions (CampaignLifecycle flow only) ─────────────────────────────────
  const handleAction = async (action: 'accept' | 'reject') => {
    if (!campaign || !application) return;
    await fetch(`http://localhost:8080/campaigns/${campaign.id}/applications/${application.id}/${action}`, {
      method: 'POST', credentials: 'include',
    });
    onRefresh();
  };

  const handleMarkPaid = async () => {
    if (!campaign || !application) return;
    await fetch(`http://localhost:8080/campaigns/${campaign.id}/applications/${application.id}/mark-paid`, {
      method: 'POST', credentials: 'include',
    });
    onRefresh();
  };

  const handleSubmitReview = async () => {
    if (!campaign || !application) return;
    await fetch(`http://localhost:8080/campaigns/${campaign.id}/applications/${application.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment: reviewComment }),
      credentials: 'include',
    });
    setShowReviewModal(false);
    setRating(5);
    setReviewComment('');
    onRefresh();
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!hasContent) {
    return (
      <div className="apptl-container apptl-empty-wrap">
        <div className="apptl-empty">
          <Clock size={56} />
          <h3>Select a Collaboration</h3>
          <p>Choose one from the list to view its timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apptl-container">

      {/* ── Campaign info header ── */}
      <div className="apptl-campaign-header">
        <div className="apptl-campaign-avatar">
          {campaignTitle.charAt(0).toUpperCase()}
        </div>
        <div className="apptl-campaign-info">
          <h2>{campaignTitle}</h2>
          <div className="apptl-campaign-meta">
            <span className="apptl-meta-item">
              <Calendar size={13} />
              Deadline: {new Date(campaignDeadline).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
            <span
              className="apptl-current-badge"
              style={{ color: currentMeta.color, background: currentMeta.bg }}
            >
              {currentMeta.icon}
              {currentMeta.label}
            </span>
          </div>
        </div>

        {/* Message button — collaboration flow only */}
        {isCollabFlow && (
          <button
            className="apptl-btn-message"
            onClick={() => navigate(`/messages?postId=${campaignId}`)}
          >
            <MessageSquare size={15} />
            Message
          </button>
        )}
      </div>

      {/* ── Pitch / application message (CampaignLifecycle flow) ── */}
      {isCampaignFlow && application?.pitchMessage && (
        <div className="apptl-pitch">
          <span className="apptl-pitch-label">Application Message</span>
          <p>{application.pitchMessage}</p>
        </div>
      )}

      {/* ── Pending accept/reject actions (CampaignLifecycle flow) ── */}
      {isCampaignFlow && application?.status === 'pending' && (
        <div className="apptl-pending-actions">
          <h4>Review Application</h4>
          <p>Accept or reject this influencer's application.</p>
          <div className="apptl-action-row">
            <button className="apptl-btn-accept" onClick={() => handleAction('accept')}>
              <CheckCircle size={16} /> Accept
            </button>
            <button className="apptl-btn-reject" onClick={() => handleAction('reject')}>
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      )}

      {/* ── Status description card ── */}
      <div
        className="apptl-status-card"
        style={{ background: currentMeta.bg, borderLeftColor: currentMeta.ring }}
      >
        <span style={{ color: currentMeta.color }}>{currentMeta.icon}</span>
        <div>
          <strong style={{ color: currentMeta.color }}>{currentMeta.label}</strong>
          <p>{currentMeta.description}</p>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="apptl-section-label">Timeline</div>
      <div className="apptl-track">
        {events.map((ev, i) => {
          const meta   = getMeta(ev.status);
          const isLast = i === events.length - 1;
          const { date, time } = formatDt(ev.timestamp);

          return (
            <div key={i} className={`apptl-step ${isLast ? 'apptl-step-latest' : ''}`}>
              {/* Connector line */}
              {!isLast && (
                <div className="apptl-connector" style={{ background: `${meta.color}44` }} />
              )}

              {/* Node */}
              <div
                className={`apptl-node ${isLast ? 'apptl-node-active' : ''}`}
                style={{
                  background: meta.bg,
                  border: `2px solid ${meta.ring}`,
                  color: meta.color,
                  boxShadow: isLast ? `0 0 0 5px ${meta.ring}55` : undefined,
                }}
              >
                {meta.icon}
              </div>

              {/* Content */}
              <div className={`apptl-step-body ${isLast ? 'apptl-step-body-latest' : ''}`}
                   style={isLast ? { borderColor: meta.ring } : undefined}>
                <div className="apptl-step-header">
                  <span className="apptl-step-label" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  {isLast && <span className="apptl-now-chip">Current</span>}
                </div>
                <div className="apptl-step-time">
                  {date}<span className="apptl-dot">·</span>{time}
                </div>
                {isLast && meta.description && (
                  <p className="apptl-step-desc">{meta.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Deliverables (CampaignLifecycle flow) ── */}
      {isCampaignFlow && application?.deliverables && application.deliverables.length > 0 && (
        <div className="apptl-deliverables">
          <div className="apptl-section-label">Submitted Deliverables</div>
          {application.deliverables.map((d, i) => (
            <div key={i} className="apptl-deliverable-row">
              <span className="apptl-deliverable-type">{d.type}</span>
              <a href={d.url} target="_blank" rel="noopener noreferrer">View Content</a>
              <span className="apptl-deliverable-date">
                {new Date(d.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Review display (CampaignLifecycle) ── */}
      {isCampaignFlow && application?.review && (
        <div className="apptl-review">
          <div className="apptl-section-label">Your Review</div>
          <div className="apptl-review-card">
            <div className="apptl-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18}
                  fill={i < application.review!.rating ? '#fbbf24' : 'none'}
                  color={i < application.review!.rating ? '#fbbf24' : '#cbd5e1'}
                />
              ))}
            </div>
            <p>{application.review.comment}</p>
            <span>{new Date(application.review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* ── CTA buttons (CampaignLifecycle flow) ── */}
      {isCampaignFlow && application?.status === 'delivered' && !application?.reviewedAt && (
        <div className="apptl-cta">
          <button className="apptl-btn-review" onClick={() => setShowReviewModal(true)}>
            <Star size={16} /> Submit Review
          </button>
        </div>
      )}
      {isCampaignFlow && application?.status === 'completed' && !application?.paidAt && (
        <div className="apptl-cta">
          <button className="apptl-btn-paid" onClick={handleMarkPaid}>
            <DollarSign size={16} /> Mark as Paid
          </button>
        </div>
      )}

      {/* ── Review modal ── */}
      {showReviewModal && (
        <div className="apptl-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="apptl-modal" onClick={e => e.stopPropagation()}>
            <h3>Submit Review</h3>
            <div className="apptl-stars-selector">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={28} className="star-clickable"
                  fill={s <= rating ? '#fbbf24' : 'none'}
                  color={s <= rating ? '#fbbf24' : '#cbd5e1'}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your feedback..."
              rows={4}
            />
            <div className="apptl-modal-actions">
              <button className="apptl-btn-cancel" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="apptl-btn-submit" onClick={handleSubmitReview}>
                <Send size={14} /> Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;