/**
 * Register.tsx
 * Flow: name + email + password → send OTP → verify OTP → account created
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Auth.css';

type Step = 'form' | 'otp' | 'done';

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669'];

export default function Register() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [step, setStep]           = useState<Step>('form');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [otp, setOtp]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const pwStr = passwordStrength(password);

  // ── Step 1: register → triggers OTP email ─────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwStr < 2) { setError('Please choose a stronger password.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const msg = await res.json();
        setError(msg.message || 'Registration failed.'); return;
      }
      // Now send OTP
      await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStep('otp');
      startCooldown();
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── Step 2: verify OTP ─────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit code.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) { setError('Invalid or expired code. Try again.'); return; }
      setStep('done');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    await fetch(`${API_BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    startCooldown();
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const iv = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
    }, 1000);
  };

  const PwdToggle = () => (
    <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
      {showPass
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">IX</div>
          <span>InfluenceX</span>
        </div>
        <div className="auth-left-copy">
          <h1>Start your<br/>story today.</h1>
          <p>Whether you're a growing creator or a small brand looking for visibility, InfluenceX helps you collaborate and grow together.</p>
        </div>
        <div className="auth-features">
          {[
            { icon: '⚡', text: 'Promote or Collaborate' },
            { icon: '🔒', text: 'Secure payments via Razorpay' },
            { icon: '📊', text: 'Real-time collaboration tracking' },
          ].map((f, i) => (
            <div key={i} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        <div className="auth-left-dots">
          {[...Array(12)].map((_, i) => <div key={i} className="auth-dot" />)}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-card">

          {/* ═══ STEP 1: REGISTRATION FORM ═══ */}
          {step === 'form' && (
            <>
              <div className="auth-card-head">
                <h2>Create account</h2>
                <p>Get started if you're a growing creator or a small brand looking for visibility</p>
              </div>

              <form onSubmit={handleRegister} noValidate>
                <div className="auth-field">
                  <label>Full name</label>
                  <input type="text" autoComplete="name" value={name}
                    onChange={e => setName(e.target.value)} required placeholder="Full name" />
                </div>

                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" autoComplete="email" value={email}
                    onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <input type={showPass ? 'text' : 'password'} autoComplete="new-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required placeholder="Min. 8 characters" />
                    <PwdToggle />
                  </div>
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="auth-strength">
                      <div className="auth-strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="auth-strength-bar"
                            style={{ background: i <= pwStr ? strengthColor[pwStr] : '#e2e8f0' }} />
                        ))}
                      </div>
                      <span style={{ color: strengthColor[pwStr] }}>{strengthLabel[pwStr]}</span>
                    </div>
                  )}
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Create account'}
                </button>
              </form>

              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </>
          )}

          {/* ═══ STEP 2: OTP VERIFICATION ═══ */}
          {step === 'otp' && (
            <>
              <div className="auth-card-head">
                <div className="auth-icon-circle auth-icon-circle--success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h2>Verify your email</h2>
                <p>
                  We sent a 6-digit code to<br />
                  <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="auth-field">
                  <label>Verification code</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required placeholder="000000"
                    className="auth-otp-input"
                    autoFocus
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Verify & activate'}
                </button>
              </form>

              <button className="auth-btn-ghost" onClick={handleResend}
                disabled={resendCooldown > 0}>
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive it? Resend"}
              </button>

              <button type="button" className="auth-link-btn" style={{ marginTop: 8 }}
                onClick={() => { setStep('form'); setOtp(''); setError(''); }}>
                ← Change email
              </button>
            </>
          )}

          {/* ═══ STEP 3: SUCCESS ═══ */}
          {step === 'done' && (
            <div className="auth-success">
              <div className="auth-success-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2>You're all set!</h2>
              <p>Your account has been verified and is ready to use.</p>
              <button className="auth-btn-primary" onClick={() => navigate('/login')}>
                Go to login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}