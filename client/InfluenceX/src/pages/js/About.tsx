import React from 'react';
import {
  Zap, Search, CheckCircle, MessageSquare,
  Upload, CreditCard, Star, Download, ArrowRight,
  ShieldCheck, TrendingUp, Users,
} from 'lucide-react';
import './About.css';

const STEPS = [
  {
    icon: <Search size={20} />,
    role: 'Brand',
    color: '#f59e0b',
    bg: '#fef3c7',
    title: 'Post a Campaign',
    desc: 'Set your platform, niche, follower range, budget, and brief. Your campaign goes live instantly.',
  },
  {
    icon: <Users size={20} />,
    role: 'Creator',
    color: '#6366f1',
    bg: '#e0e7ff',
    title: 'Connect & Apply',
    desc: 'Connect Instagram or YouTube to verify your stats, then apply with a cover message and your rate.',
  },
  {
    icon: <CheckCircle size={20} />,
    role: 'Brand',
    color: '#f59e0b',
    bg: '#fef3c7',
    title: 'Review & Approve',
    desc: 'Browse applications with real verified data — follower counts, engagement rate, audience demographics.',
  },
  {
    icon: <MessageSquare size={20} />,
    role: 'Both',
    color: '#7c3aed',
    bg: '#ede9fe',
    title: 'Chat & Agree',
    desc: 'A private chat opens automatically. Negotiate deliverables, price, and timeline — all documented.',
  },
  {
    icon: <Upload size={20} />,
    role: 'Creator',
    color: '#6366f1',
    bg: '#e0e7ff',
    title: 'Deliver Content',
    desc: 'Publish your content and submit the live link plus a screenshot directly in the app.',
  },
  {
    icon: <CreditCard size={20} />,
    role: 'Brand',
    color: '#f59e0b',
    bg: '#fef3c7',
    title: 'Verify & Pay',
    desc: 'Review the submission, approve it, and release payment securely via Razorpay — no invoices needed.',
  },
  {
    icon: <Star size={20} />,
    role: 'Both',
    color: '#7c3aed',
    bg: '#ede9fe',
    title: 'Rate Each Other',
    desc: 'Both sides leave a rating. Reputations build over time — the best rise to the top.',
  },
];

const PILLARS = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Verified by default',
    desc: 'Creators connect their real social accounts. Brands see true follower counts and engagement — not self-reported numbers.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Fair pricing',
    desc: 'Creators see market rates. Brands set transparent budgets. No agency markups, no hidden fees.',
  },
  {
    icon: <CreditCard size={22} />,
    title: 'Secure payment',
    desc: 'Funds are released only after deliverables are verified. Powered by Razorpay. No chasing invoices.',
  },
  {
    icon: <Star size={22} />,
    title: 'Reputation system',
    desc: 'Every collaboration leaves a rating. Over time, the best creators and most professional brands earn trust — visibly.',
  },
];

const About: React.FC = () => (
  <div className="abt-page">

    {/* ── Hero ──────────────────────────────────────────────── */}
    <div className="abt-hero">
      <div className="abt-hero-inner">
        <span className="abt-eyebrow"><Zap size={12} /> About InfluenceX</span>
        <h1 className="abt-title">
          Where genuine brands<br />meet real creators.
        </h1>
        <p className="abt-subtitle">
          InfluenceX is a structured marketplace for paid content collaborations.
          No cold DMs. No spreadsheets. No guesswork — just a clear, fair process
          from campaign to payment.
        </p>
      </div>
      <div className="abt-blob abt-blob-a" />
      <div className="abt-blob abt-blob-b" />
    </div>

    {/* ── The problem we solve ──────────────────────────────── */}
    <section className="abt-section abt-problem">
      <div className="abt-inner">
        <div className="abt-two-col">
          <div className="abt-problem-card abt-problem-brand">
            <p className="abt-problem-eyebrow">For brands</p>
            <h3>Stop paying for followers that don't convert.</h3>
            <p>
              Finding the right influencer used to mean hours of research, cold DMs,
              ghosted replies, and invoices paid on trust. InfluenceX replaces all of
              that with verified data and a structured workflow.
            </p>
          </div>
          <div className="abt-problem-card abt-problem-creator">
            <p className="abt-problem-eyebrow">For creators</p>
            <h3>Stop undercharging. Start proving your value.</h3>
            <p>
              Genuine creators with 10K–100K engaged followers were invisible to brands
              and underpriced because they had no way to prove their reach. Your connected
              account does that for you automatically.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Four pillars ─────────────────────────────────────── */}
    <section className="abt-section abt-pillars-section">
      <div className="abt-inner">
        <p className="abt-section-label">What makes us different</p>
        <div className="abt-pillars">
          {PILLARS.map((pl, i) => (
            <div key={i} className="abt-pillar">
              <div className="abt-pillar-icon">{pl.icon}</div>
              <h4>{pl.title}</h4>
              <p>{pl.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How it works ─────────────────────────────────────── */}
    <section className="abt-section abt-flow-section">
      <div className="abt-inner">
        <p className="abt-section-label">How it works</p>
        <h2 className="abt-section-title">Seven steps, one complete collaboration.</h2>
        <div className="abt-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="abt-step">
                <div className="abt-step-num">{i + 1}</div>
                <div className="abt-step-icon" style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <div className="abt-step-body">
                  <span className="abt-step-role" style={{ color: s.color }}>{s.role}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="abt-step-arrow"><ArrowRight size={16} /></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>

    {/* ── Download docs ─────────────────────────────────────── */}
    <section className="abt-section abt-docs-section">
      <div className="abt-inner">
        <div className="abt-docs-card">
          <div className="abt-docs-left">
            <span className="abt-docs-tag">User Guide</span>
            <h3>Everything in one document.</h3>
            <p>
              The full InfluenceX user guide covers every screen, every status, every
              action — with step-by-step walkthroughs for both brands and creators.
              Download it and keep it handy.
            </p>
          </div>
          <a
            className="abt-docs-btn"
            href="/InfluenceX_UserGuide_V1.pdf"
            download="InfluenceX_UserGuide_V1.pdf"
          >
            <Download size={16} />
            Download User Guide
          </a>
        </div>
      </div>
    </section>

  </div>
);

export default About;