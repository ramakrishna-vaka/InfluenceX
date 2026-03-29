import React, { useState } from 'react';
import { Send, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import './Help.css';

const FAQS = [
  {
    q: 'Can I apply without connecting my social account?',
    a: 'Yes you can but connecting Instagram or YouTube is a best pratice to get approved from brands.',
  },
  {
    q: 'What happens if my deliverables get rejected?',
    a: 'The brand must provide a reason. You can revise and resubmit from the collaboration timeline. If you believe the rejection is unfair, use the Report Problem button and our team reviews within 24 hours.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'InfluenceX uses Razorpay — so UPI, debit/credit card, net banking, and all major wallets are supported.',
  },
  {
    q: 'Can a brand cancel after accepting my application?',
    a: 'Cancellations after acceptance require our support team. File a report via the Report Problem button on your collaboration timeline.',
  },
  {
    q: 'How long does payment take to arrive in my wallet?',
    a: "Payment moves to your InfluenceX wallet immediately after the brand completes checkout. Bank payouts follow Razorpay's standard settlement schedule.",
  },
  // {
  //   q: 'Is my chat history private?',
  //   a: 'Chats are only accessible by InfluenceX support staff when a Report Problem has been filed. They are not monitored in real time.',
  // },
];

const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`hlp-faq-item ${open ? 'hlp-faq-open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="hlp-faq-q">
        <span>{q}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </div>
      {open && <p className="hlp-faq-a">{a}</p>}
    </div>
  );
};

type State = 'idle' | 'sending' | 'done';

const Help: React.FC = () => {
  const [subject,  setSubject]  = useState('');
  const [category, setCategory] = useState('');
  const [message,  setMessage]  = useState('');
  const [state,    setState]    = useState<State>('idle');

  const canSubmit = subject.trim() && category && message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setState('sending');
    // Replace with real endpoint when ready
    await new Promise(r => setTimeout(r, 1200));
    setState('done');
  };

  const reset = () => { setSubject(''); setCategory(''); setMessage(''); setState('idle'); };

  return (
    <div className="hlp-page">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="hlp-hero">
        <div className="hlp-hero-inner">
          <p className="hlp-hero-eyebrow">Support</p>
          <h1 className="hlp-hero-title">How can we help?</h1>
          <p className="hlp-hero-sub">
            Describe your issue and our team will get back to you within a few hours.
          </p>
        </div>
        <div className="hlp-hero-blob hlp-blob-1" />
        <div className="hlp-hero-blob hlp-blob-2" />
      </div>

      <div className="hlp-body">

        {/* ── Contact form ──────────────────────────────────────────── */}
        <section className="hlp-form-section">
          <div className="hlp-section-label">Send us a message</div>

          {state === 'done' ? (
            <div className="hlp-done">
              <CheckCircle size={44} className="hlp-done-icon" />
              <h3>We've got your message</h3>
              <p>Someone from our team will reach out to you within a few hours. Check your email for a confirmation.</p>
              <button className="hlp-btn-ghost" onClick={reset}>Send another</button>
            </div>
          ) : (
            <div className="hlp-form-card">
              <div className="hlp-form-row hlp-form-row-2">
                <div className="hlp-field">
                  <label htmlFor="hlp-subject">Subject</label>
                  <input
                    id="hlp-subject"
                    type="text"
                    placeholder="Brief summary of your issue"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={state === 'sending'}
                  />
                </div>
                <div className="hlp-field">
                  <label htmlFor="hlp-category">Category</label>
                  <select
                    id="hlp-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    disabled={state === 'sending'}
                  >
                    <option value="">Select a topic…</option>
                    <option value="account">Account & Registration</option>
                    <option value="campaign">Campaigns & Applications</option>
                    <option value="deliverables">Deliverables & Reviews</option>
                    <option value="payment">Payments & Wallet</option>
                    <option value="chat">Messages & Chat</option>
                    <option value="verification">Social Account Verification</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
              </div>

              <div className="hlp-field">
                <label htmlFor="hlp-message">
                  Describe your issue
                  <span className="hlp-char-count">{message.length} / 1000</span>
                </label>
                <textarea
                  id="hlp-message"
                  rows={5}
                  maxLength={1000}
                  placeholder="Give us as much detail as you can — what you were trying to do, what happened, and any error messages you saw…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={state === 'sending'}
                />
              </div>

              <div className="hlp-form-footer">
                <p className="hlp-form-note">
                  We typically respond within 2–4 hours during business hours.
                </p>
                <button
                  className="hlp-btn-submit"
                  onClick={handleSubmit}
                  disabled={!canSubmit || state === 'sending'}
                >
                  {state === 'sending'
                    ? <><Loader2 size={15} className="hlp-spin" /> Sending…</>
                    : <><Send size={15} /> Send Message</>}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="hlp-faq-section">
          <div className="hlp-section-label">Common questions</div>
          <div className="hlp-faq-list">
            {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Help;