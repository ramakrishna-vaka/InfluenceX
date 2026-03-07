/**
 * ApplicationTimeline.tsx — Unified timeline panel
 *
 * CampaignLifecycle (brand) : pass `application` + `campaign`
 * MyCollaborations (influencer): pass `collaboration`
 *
 * Status keys mirror ApplicationStatusEnum (lowercased):
 *   pending · accepted · in_progress · rejected · withdraw
 *   pending_deliverables · deliverables_submitted · reviewing
 *   deliverables_accepted · deliverables_rejected
 *   payment_pending · payment_success · payment_failed · payment_receiving · settled
 */

import React, { useState } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, Package,
  DollarSign, Star, Send, Eye, AlertCircle, LifeBuoy,
  Calendar, MessageSquare, Upload, Plus, Trash2,
  Link2, ImageIcon, RefreshCw, Loader2, Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/ApplicationTimeline.css';
import type { Collaboration, StatusEvent } from '../../pages/js/MyCollaborations';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Deliverable {
  type: string;
  url: string;
  imageUrl?: string;
  uploadedAt?: string;
}

interface ApplicationLifecycle {
  id: string;
  applicationId: string;
  influencer: { id: string; name: string; email: string; avatar?: string };
  followers: number;
  currentStatus: string;
  appliedAt: string;
  paidAt?: string;
  pitchMessage: string;
  deliverables?: Deliverable[];
  review?: { rating: number; comment: string; createdAt: string };
  applicationStatus: { statusEnum: string; time: string }[];
}

interface Campaign {
  id: string;
  title: string;
  deadline: string;
}

interface DeliverableRow {
  type: string;
  url: string;
  imageUrl: string;
}

interface Props {
  application?: ApplicationLifecycle | null;
  campaign?: Campaign;
  collaboration?: Collaboration | null;
  onRefresh: () => void;
}

// ─── Status metadata ──────────────────────────────────────────────────────────
// Keys must exactly match ApplicationStatusEnum values lowercased + underscored.
// e.g. DELIVERABLES_SUBMITTED → "deliverables_submitted"

interface StatusMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  ring: string;
  description: string;
}

const STATUS_META: Record<string, StatusMeta> = {

  // Virtual first step synthesised by the frontend from appliedAt
  created: {
    label: 'Application Submitted',
    icon: <FileText size={15} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: 'Application successfully submitted.',
  },

  // ── ApplicationStatusEnum values ──────────────────────────────────────────

  pending: {
    label: 'Pending Review',
    icon: <Clock size={15} />,
    color: '#d97706', bg: '#fef3c7', ring: '#fcd34d',
    description: 'Waiting for the brand to review your application.',
  },

  accepted: {
    label: 'Accepted',
    icon: <CheckCircle size={15} />,
    color: '#2563eb', bg: '#dbeafe', ring: '#93c5fd',
    description: 'Application accepted! Start working on your content.',
  },

  in_progress: {
    label: 'In Progress',
    icon: <Package size={15} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: 'Content creation is in progress.',
  },

  rejected: {
    label: 'Rejected',
    icon: <XCircle size={15} />,
    color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5',
    description: 'Your application was not selected for this campaign.',
  },

  withdraw: {
    label: 'Withdrawn',
    icon: <AlertCircle size={15} />,
    color: '#64748b', bg: '#f1f5f9', ring: '#cbd5e1',
    description: 'You withdrew your application.',
  },

  // Set by backend when deliverables deadline passes without submission
  pending_deliverables: {
    label: 'Deliverables Overdue',
    icon: <Send size={15} />,
    color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5',
    description: 'Deadline has passed — please submit your deliverables immediately.',
  },

  deliverables_submitted: {
    label: 'Deliverables Submitted',
    icon: <Upload size={15} />,
    color: '#7c3aed', bg: '#ede9fe', ring: '#c4b5fd',
    description: 'Deliverables submitted — awaiting brand review.',
  },

  reviewing: {
    label: 'Under Review',
    icon: <Eye size={15} />,
    color: '#7c3aed', bg: '#ede9fe', ring: '#c4b5fd',
    description: 'The brand is reviewing your submitted deliverables.',
  },

  deliverables_accepted: {
    label: 'Deliverables Accepted',
    icon: <CheckCircle size={15} />,
    color: '#2563eb', bg: '#dbeafe', ring: '#93c5fd',
    description: 'Deliverables approved! Payment is being initiated.',
  },

  deliverables_rejected: {
    label: 'Deliverables Rejected',
    icon: <XCircle size={15} />,
    color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5',
    description: 'Your deliverables were not approved. Please revise and resubmit.',
  },

  // Brand side — Razorpay order created, checkout not yet completed
  payment_pending: {
    label: 'Payment Pending',
    icon: <DollarSign size={15} />,
    color: '#d97706', bg: '#fef3c7', ring: '#fcd34d',
    description: 'Waiting for the brand to complete payment.',
  },

  // Brand side — payment.captured confirmed by webhook
  payment_success: {
    label: 'Payment Successful',
    icon: <CheckCircle size={15} />,
    color: '#059669', bg: '#d1fae5', ring: '#6ee7b7',
    description: 'Payment confirmed. Transferring to influencer wallet.',
  },

  payment_failed: {
    label: 'Payment Failed',
    icon: <AlertCircle size={15} />,
    color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5',
    description: 'Payment could not be processed. Please retry.',
  },

  // Influencer side — payment in transit to wallet
  payment_receiving: {
    label: 'Receiving Payment',
    icon: <Wallet size={15} />,
    color: '#0891b2', bg: '#cffafe', ring: '#67e8f9',
    description: 'Payment is on its way to your wallet.',
  },

  // Influencer side — payment fully received
  settled: {
    label: 'Settled',
    icon: <CheckCircle size={15} />,
    color: '#059669', bg: '#d1fae5', ring: '#6ee7b7',
    description: 'Payment received. Collaboration complete!',
  },
};

const getMeta = (status: string): StatusMeta =>
  STATUS_META[status.toLowerCase().replace(/ /g, '_')] ?? {
    label: status,
    icon: <Clock size={15} />,
    color: '#6366f1', bg: '#e0e7ff', ring: '#a5b4fc',
    description: '',
  };

const fmtDt = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

// ─── Deliverables Dialog ──────────────────────────────────────────────────────

const DeliverablesDialog: React.FC<{
  isResubmit?: boolean;
  onClose: () => void;
  onSubmit: (rows: DeliverableRow[]) => Promise<void>;
}> = ({ isResubmit, onClose, onSubmit }) => {
  const [rows, setRows]         = useState<DeliverableRow[]>([{ type: '', url: '', imageUrl: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState<string[]>([]);

  const addRow    = () => setRows(r => [...r, { type: '', url: '', imageUrl: '' }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const update    = (i: number, field: keyof DeliverableRow, val: string) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const handleSubmit = async () => {
    const errs: string[] = [];
    rows.forEach((r, i) => {
      if (!r.type) errs.push(`Row ${i + 1}: select a type`);
      if (!r.url)  errs.push(`Row ${i + 1}: content URL is required`);
    });
    if (errs.length) { setErrors(errs); return; }
    setSubmitting(true);
    try { await onSubmit(rows); } finally { setSubmitting(false); }
  };

  return (
    <div className="apptl-modal-overlay" onClick={onClose}>
      <div className="apptl-modal apptl-modal-wide" onClick={e => e.stopPropagation()}>

        <div className="apptl-modal-header">
          <div className="apptl-modal-title-row">
            <Upload size={18} style={{ color: '#6366f1' }} />
            <h3>{isResubmit ? 'Resubmit Deliverables' : 'Submit Deliverables'}</h3>
          </div>
          {isResubmit && (
            <div className="apptl-resubmit-notice">
              <AlertCircle size={13} />
              Your previous deliverables were rejected. Please revise and resubmit.
            </div>
          )}
          <p>Add each piece of content with its type, link, and optional preview image.</p>
        </div>

        <div className="apptl-deliverables-form">
          {rows.map((row, i) => (
            <div key={i} className="apptl-deliverable-form-row">
              <div className="apptl-form-row-number">{i + 1}</div>
              <div className="apptl-form-fields">

                <div className="apptl-form-field">
                  <label>Type</label>
                  <select value={row.type} onChange={e => update(i, 'type', e.target.value)}>
                    <option value="">Select…</option>
                    <option>Instagram Post</option>
                    <option>Instagram Reel</option>
                    <option>Instagram Story</option>
                    <option>YouTube Video</option>
                    <option>YouTube Short</option>
                    <option>TikTok</option>
                    <option>Twitter/X Post</option>
                    <option>Blog Post</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="apptl-form-field apptl-form-field-grow">
                  <label><Link2 size={10} /> Content URL</label>
                  <input type="url" placeholder="https://..." value={row.url}
                    onChange={e => update(i, 'url', e.target.value)} />
                </div>

                <div className="apptl-form-field apptl-form-field-grow">
                  <label>
                    <ImageIcon size={10} /> Preview Image
                    <span className="apptl-optional"> (optional)</span>
                  </label>
                  <input type="url" placeholder="https://..." value={row.imageUrl}
                    onChange={e => update(i, 'imageUrl', e.target.value)} />
                </div>

              </div>
              {rows.length > 1 && (
                <button className="apptl-remove-row" onClick={() => removeRow(i)}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="apptl-form-errors">
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        <button className="apptl-add-row-btn" onClick={addRow}>
          <Plus size={13} /> Add Another
        </button>

        <div className="apptl-modal-actions">
          <button className="apptl-btn-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="apptl-btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? <><Loader2 size={14} className="spin" /> Submitting…</>
              : <><Upload size={14} /> {isResubmit ? 'Resubmit' : 'Submit All'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Report Problem Dialog ────────────────────────────────────────────────────

const ReportDialog: React.FC<{
  appId: string;
  onClose: () => void;
}> = ({ appId, onClose }) => {
  const [category,   setCategory]   = useState('');
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const handleSubmit = async () => {
    if (!category || !message.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`http://localhost:8080/application/${appId}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apptl-modal-overlay" onClick={onClose}>
      <div className="apptl-modal" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="apptl-report-done">
            <CheckCircle size={40} color="#059669" />
            <h3>Report Submitted</h3>
            <p>Our team will review your case and get back to you within 24 hours.</p>
            <button className="apptl-btn-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="apptl-modal-title-row" style={{ marginBottom: 16 }}>
              <LifeBuoy size={18} style={{ color: '#6366f1' }} />
              <h3>Report a Problem</h3>
            </div>

            <div className="apptl-form-field" style={{ marginBottom: 12 }}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select a category…</option>
                <option value="unfair_rejection">Deliverables unfairly rejected</option>
                <option value="unclear_requirements">Unclear campaign requirements</option>
                <option value="payment_issue">Payment problem</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div className="apptl-form-field" style={{ marginBottom: 16 }}>
              <label>Describe the issue</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Please describe what happened…"
                rows={4}
                className="apptl-report-textarea"
              />
            </div>

            <div className="apptl-modal-actions">
              <button className="apptl-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="apptl-btn-submit" onClick={handleSubmit}
                disabled={submitting || !category || !message.trim()}>
                {submitting
                  ? <><Loader2 size={14} className="spin" /> Sending…</>
                  : <><Send size={14} /> Submit Report</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Review Modal ─────────────────────────────────────────────────────────────

const ReviewModal: React.FC<{
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}> = ({ onClose, onSubmit }) => {
  const [rating,     setRating]     = useState(5);
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="apptl-modal-overlay" onClick={onClose}>
      <div className="apptl-modal" onClick={e => e.stopPropagation()}>
        <div className="apptl-modal-title-row" style={{ marginBottom: 16 }}>
          <Star size={18} style={{ color: '#f59e0b' }} />
          <h3>Submit Review</h3>
        </div>

        <div className="apptl-stars-selector">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={28} className="star-clickable"
              fill={s <= rating ? '#fbbf24' : 'none'}
              color={s <= rating ? '#fbbf24' : '#cbd5e1'}
              onClick={() => setRating(s)} />
          ))}
        </div>

        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your feedback about the deliverables…"
          rows={4} className="apptl-report-textarea" />

        <div className="apptl-modal-actions" style={{ marginTop: 16 }}>
          <button className="apptl-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="apptl-btn-submit"
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(rating, comment);
              setSubmitting(false);
            }}
            disabled={submitting}>
            {submitting
              ? <Loader2 size={14} className="spin" />
              : <><Send size={14} /> Submit</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Inline action helpers ────────────────────────────────────────────────────

const StepActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="apptl-step-actions">{children}</div>
);

type BtnVariant = 'accept' | 'reject' | 'info' | 'warn' | 'neutral';

const ActionBtn: React.FC<{
  variant: BtnVariant;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ variant, icon, label, onClick, disabled }) => (
  <button className={`apptl-inline-btn apptl-inline-btn-${variant}`}
    onClick={onClick} disabled={disabled}>
    {icon}<span>{label}</span>
  </button>
);

// ─── Razorpay loader ──────────────────────────────────────────────────────────

declare global { interface Window { Razorpay: any; } }

const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src     = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload  = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

// ─── Main Component ───────────────────────────────────────────────────────────

const ApplicationTimeline: React.FC<Props> = ({
  application, campaign, collaboration, onRefresh,
}) => {
  const navigate = useNavigate();

  const [showDeliverables, setShowDeliverables] = useState(false);
  const [showReport,       setShowReport]       = useState(false);
  const [showReview,       setShowReview]       = useState(false);
  const [payLoading,       setPayLoading]       = useState(false);

  const isCampaignFlow = !!application;
  const isCollabFlow   = !!collaboration;
  const hasContent     = isCampaignFlow || isCollabFlow;

  // ── Build chronological event list ───────────────────────────────────────
  const buildEvents = (
    appliedAt: string,
    statusList: { statusEnum: string; time: string }[] | undefined,
    fallbackList: StatusEvent[] | undefined,
  ): StatusEvent[] => {
    const base: StatusEvent[] = [{ status: 'created', timestamp: appliedAt }];
    if (statusList?.length) {
      statusList.forEach(({ statusEnum, time }) =>
        base.push({ status: statusEnum.toLowerCase(), timestamp: time })
      );
    } else if (fallbackList?.length) {
      fallbackList.forEach(ev =>
        base.push({ status: ev.status.toLowerCase(), timestamp: ev.timestamp })
      );
    }
    return base;
  };

  let events: StatusEvent[] = [];

  if (isCampaignFlow && application) {
    events = buildEvents(application.appliedAt, application.applicationStatus, undefined);
  } else if (isCollabFlow && collaboration) {
    const c = collaboration as any;
    const appliedAt =
      c.appliedAt ??
      collaboration.applicationStatusList?.[0]?.timestamp ??
      new Date().toISOString();
    events = buildEvents(appliedAt, c.applicationStatus, collaboration.applicationStatusList);
  }

  const lastStatus = events.length
    ? events[events.length - 1].status.toLowerCase().replace(/ /g, '_')
    : (application?.currentStatus?.toLowerCase() ?? 'pending');

  const currentMeta = getMeta(lastStatus);

  // ── Identifiers ───────────────────────────────────────────────────────────
  const collab        = collaboration as any;
  const campaignTitle    = campaign?.title    ?? collab?.postName    ?? collab?.title    ?? '';
  const campaignDeadline = campaign?.deadline ?? collab?.postDeadline ?? collab?.deadline ?? '';
  const campaignId       = campaign?.id       ?? collab?.postId      ?? '';
  const appId            = application?.applicationId ?? collab?.applicationId ?? '';

  // ── API helpers ───────────────────────────────────────────────────────────
  const doPost = async (path: string, body?: object) =>
    fetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

  const handleAccept   = async () => { await doPost(`http://localhost:8080/application/${appId}/accept`);   onRefresh(); };
  const handleReject   = async () => { await doPost(`http://localhost:8080/application/${appId}/reject`);   onRefresh(); };
  const handleWithdraw = async () => { await doPost(`http://localhost:8080/application/${appId}/withdraw`); onRefresh(); };

  // Sends plain JSON array — matches List<DeliverablesDTO> on the backend
  const handleSubmitDeliverables = async (rows: DeliverableRow[]) => {
    await doPost(`http://localhost:8080/application/${appId}/upload-deliverables`, rows);
    setShowDeliverables(false);
    onRefresh();
  };

  // Brand: reject deliverables → DELIVERABLES_REJECTED
  const handleRejectDeliverables = async () => {
    await doPost(`http://localhost:8080/application/${appId}/reject-deliverables`);
    onRefresh();
  };

  // Brand: accept deliverables → create Razorpay order → open checkout
  const handleAcceptDeliverables = async () => {
    setPayLoading(true);
    try {
      const res  = await doPost(`http://localhost:8080/payment/order/${appId}`);
      const data = await res.json();

      const ok = await loadRazorpay();
      if (!ok) { alert('Failed to load payment gateway. Please try again.'); return; }

      const rzp = new window.Razorpay({
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency ?? 'INR',
        name:        'InfluenceX',
        description: 'Payment for campaign collaboration',
        order_id:    data.orderId,
        handler: async (response: any) => {
          await doPost('http://localhost:8080/payment/verify', {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onRefresh();
        },
        modal: { ondismiss: () => { setPayLoading(false); onRefresh(); } },
        theme: { color: '#6366f1' },
      });

      rzp.on('payment.failed', async (resp: any) => {
        await doPost('http://localhost:8080/payment/failed', {
          razorpayOrderId: data.orderId,
          reason: resp.error?.description ?? 'Payment failed',
        });
        onRefresh();
      });

      rzp.open();
    } catch (e) {
      console.error('Payment initiation failed', e);
      alert('Could not initiate payment. Please try again.');
      setPayLoading(false);
    }
  };

  // Brand: submit written review
  const handleSubmitReview = async (rating: number, comment: string) => {
    await doPost(`http://localhost:8080/application/${appId}/review`, { rating, comment });
    setShowReview(false);
    onRefresh();
  };

  // ── Inline actions for the LAST timeline step ─────────────────────────────
  const renderLastStepActions = () => {
    const s = lastStatus;

    // ── INFLUENCER side ───────────────────────────────────────────────────────
    if (isCollabFlow) {

      if (s === 'pending') return (
        <StepActions>
          <ActionBtn variant="reject" icon={<XCircle size={12} />}
            label="Withdraw Application" onClick={handleWithdraw} />
        </StepActions>
      );

      // All states where influencer should / can submit deliverables
      if (s === 'accepted' || s === 'in_progress' || s === 'pending_deliverables') return (
        <StepActions>
          <ActionBtn variant="info" icon={<Upload size={12} />}
            label="Submit Deliverables" onClick={() => setShowDeliverables(true)} />
        </StepActions>
      );

      // Resubmit after brand rejection + option to report
      if (s === 'deliverables_rejected') return (
        <StepActions>
          <ActionBtn variant="warn" icon={<RefreshCw size={12} />}
            label="Resubmit Deliverables" onClick={() => setShowDeliverables(true)} />
          <ActionBtn variant="neutral" icon={<LifeBuoy size={12} />}
            label="Report Problem" onClick={() => setShowReport(true)} />
        </StepActions>
      );

      // Waiting on brand to pay — no action for influencer
      if (s === 'deliverables_accepted' || s === 'payment_pending') return (
        <div className="apptl-payment-pending-badge">
          <Loader2 size={13} className="spin" />
          Waiting for brand to complete payment…
        </div>
      );

      // Payment in transit to influencer wallet
      if (s === 'payment_receiving') return (
        <div className="apptl-payment-pending-badge">
          <Loader2 size={13} className="spin" />
          Payment arriving in your wallet…
        </div>
      );

      // Brand's payment failed — influencer can only report, brand must retry
      if (s === 'payment_failed') return (
        <StepActions>
          <ActionBtn variant="neutral" icon={<LifeBuoy size={12} />}
            label="Report Problem" onClick={() => setShowReport(true)} />
        </StepActions>
      );

      // Fully complete
      if (s === 'settled' || s === 'payment_success') return (
        <div className="apptl-settled-badge">
          <CheckCircle size={13} />
          Payment received — collaboration complete!
        </div>
      );
    }

    // ── BRAND side ────────────────────────────────────────────────────────────
    if (isCampaignFlow) {

      if (s === 'pending') return (
        <StepActions>
          <ActionBtn variant="accept" icon={<CheckCircle size={12} />}
            label="Accept" onClick={handleAccept} />
          <ActionBtn variant="reject" icon={<XCircle size={12} />}
            label="Reject" onClick={handleReject} />
        </StepActions>
      );

      // Deliverables are in for review
      if (s === 'deliverables_submitted' || s === 'reviewing') return (
        <StepActions>
          <ActionBtn variant="accept"
            icon={payLoading ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />}
            label="Accept & Pay" onClick={handleAcceptDeliverables} disabled={payLoading} />
          <ActionBtn variant="reject" icon={<XCircle size={12} />}
            label="Request Revision" onClick={handleRejectDeliverables} />
        </StepActions>
      );

      // Razorpay order created but checkout window not completed yet
      if (s === 'payment_pending') return (
        <StepActions>
          <ActionBtn variant="info"
            icon={payLoading ? <Loader2 size={12} className="spin" /> : <DollarSign size={12} />}
            label="Complete Payment" onClick={handleAcceptDeliverables} disabled={payLoading} />
        </StepActions>
      );

      // Brand side payment failed — retry
      if (s === 'payment_failed') return (
        <StepActions>
          <ActionBtn variant="warn"
            icon={payLoading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
            label="Retry Payment" onClick={handleAcceptDeliverables} disabled={payLoading} />
        </StepActions>
      );

      // Brand side done
      if (s === 'payment_success' || s === 'settled') return (
        <div className="apptl-settled-badge">
          <CheckCircle size={13} />
          Payment sent successfully
        </div>
      );
    }

    return null;
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!hasContent) {
    return (
      <div className="apptl-container apptl-empty-wrap">
        <div className="apptl-empty">
          <Clock size={52} />
          <h3>{isCampaignFlow ? 'Select an Application' : 'Select a Collaboration'}</h3>
          <p>Choose one from the list to view its timeline</p>
        </div>
      </div>
    );
  }

  const deliverables: Deliverable[] =
    application?.deliverables ?? (collaboration as any)?.deliverables ?? [];

  return (
    <>
      {/* Full-page blur behind any open dialog */}
      {(showDeliverables || showReport || showReview) && (
        <div className="apptl-page-blur" />
      )}

      <div className="apptl-container">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="apptl-campaign-header">
          <div className="apptl-campaign-avatar">
            {campaignTitle.charAt(0).toUpperCase()}
          </div>
          <div className="apptl-campaign-info">
            <h2>{campaignTitle}</h2>
            <div className="apptl-campaign-meta">
              {campaignDeadline && (
                <span className="apptl-meta-item">
                  <Calendar size={12} />
                  {new Date(campaignDeadline).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              )}
              <span className="apptl-current-badge"
                style={{ color: currentMeta.color, background: currentMeta.bg }}>
                {currentMeta.icon}{currentMeta.label}
              </span>
            </div>
          </div>
          <button className="apptl-btn-message"
            onClick={() => navigate(`/messages?postId=${campaignId}`)}>
            <MessageSquare size={14} /> Message
          </button>
        </div>

        {/* ── Pitch (brand side, pending only) ───────────────────────────── */}
        {isCampaignFlow && application?.pitchMessage &&
          application.currentStatus?.toUpperCase() === 'PENDING' && (
          <div className="apptl-pitch">
            <span className="apptl-pitch-label">Application Message</span>
            <p>{application.pitchMessage}</p>
          </div>
        )}

        {/* ── Current status card ─────────────────────────────────────────── */}
        <div className="apptl-status-card"
          style={{ background: currentMeta.bg, borderLeftColor: currentMeta.ring }}>
          <span style={{ color: currentMeta.color }}>{currentMeta.icon}</span>
          <div>
            <strong style={{ color: currentMeta.color }}>{currentMeta.label}</strong>
            <p>{currentMeta.description}</p>
          </div>
        </div>

        {/* ── Timeline ────────────────────────────────────────────────────── */}
        <div className="apptl-section-label">Timeline</div>
        <div className="apptl-track">
          {events.map((ev, i) => {
            const meta   = getMeta(ev.status);
            const isLast = i === events.length - 1;
            const { date, time } = fmtDt(ev.timestamp);

            return (
              <div key={i} className={`apptl-step ${isLast ? 'apptl-step-latest' : ''}`}>
                {!isLast && (
                  <div className="apptl-connector"
                    style={{ background: `${meta.color}33` }} />
                )}
                <div
                  className={`apptl-node ${isLast ? 'apptl-node-active' : ''}`}
                  style={{
                    background: meta.bg,
                    border: `2px solid ${meta.ring}`,
                    color: meta.color,
                    boxShadow: isLast ? `0 0 0 5px ${meta.ring}44` : undefined,
                  }}
                >
                  {meta.icon}
                </div>
                <div
                  className={`apptl-step-body ${isLast ? 'apptl-step-body-latest' : ''}`}
                  style={isLast ? { borderColor: meta.ring } : undefined}
                >
                  <div className="apptl-step-header">
                    <span className="apptl-step-label" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    {isLast && <span className="apptl-now-chip">Current</span>}
                  </div>
                  <div className="apptl-step-time">
                    {date}<span className="apptl-dot">·</span>{time}
                  </div>
                  {isLast && renderLastStepActions()}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Submitted deliverables list ─────────────────────────────────── */}
        {deliverables.length > 0 && (
          <div className="apptl-deliverables">
            <div className="apptl-section-label">Submitted Deliverables</div>
            {deliverables.map((d, i) => (
              <div key={i} className="apptl-deliverable-row">
                <span className="apptl-deliverable-type">{d.type}</span>
                {d.imageUrl && (
                  <img src={d.imageUrl} alt="preview" className="apptl-deliverable-thumb" />
                )}
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  View Content
                </a>
                {d.uploadedAt && (
                  <span className="apptl-deliverable-date">
                    {new Date(d.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Review display ──────────────────────────────────────────────── */}
        {application?.review && (
          <div className="apptl-review">
            <div className="apptl-section-label">Your Review</div>
            <div className="apptl-review-card">
              <div className="apptl-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={17}
                    fill={i < application.review!.rating ? '#fbbf24' : 'none'}
                    color={i < application.review!.rating ? '#fbbf24' : '#cbd5e1'} />
                ))}
              </div>
              <p>{application.review.comment}</p>
              <span>{new Date(application.review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Dialogs rendered outside container so blur covers the whole page ── */}
      {showDeliverables && (
        <DeliverablesDialog
          isResubmit={lastStatus === 'deliverables_rejected'}
          onClose={() => setShowDeliverables(false)}
          onSubmit={handleSubmitDeliverables}
        />
      )}
      {showReport && (
        <ReportDialog appId={appId} onClose={() => setShowReport(false)} />
      )}
      {showReview && (
        <ReviewModal
          onClose={() => setShowReview(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </>
  );
};

export default ApplicationTimeline;