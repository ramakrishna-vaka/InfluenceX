/**
 * Login.tsx
 * Flows: Login | Forgot Password (email → reset)
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';
import GoogleButton from '../../components/js/GoogleButton';
import '../css/Auth.css';

type Screen = 'login' | 'forgot-email' | 'forgot-reset';

export default function Login() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { login, setAuthUser } = useAuth();

  const [screen, setScreen]       = useState<Screen>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // forgot-password state
  const [fpEmail, setFpEmail]       = useState('');
  const [fpCode, setFpCode]         = useState('');
  const [fpNewPass, setFpNewPass]   = useState('');
  const [fpConfirm, setFpConfirm]   = useState('');
  const [fpSent, setFpSent]         = useState(false);
  const [fpCodeOk, setFpCodeOk]     = useState(false);
  const [fpShowNew, setFpShowNew]   = useState(false);
  const [fpShowConf, setFpShowConf] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError('Invalid email or password.'); return; }

      const whoRes = await fetch(`${API_BASE_URL}/whoAmI`, { credentials: 'include' });
      if (!whoRes.ok) { setError('Could not fetch user info.'); return; }
      const data = await whoRes.json();
      setAuthUser({ id: data.id, name: data.name, email: data.email, imageData: data.imageData, rating: data.rating, walletMoney: data.walletMoney });
      login();
      navigate('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot — send reset code ────────────────────────────────────────────
  const handleFpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      if (!res.ok) { setError('No account found for that email.'); return; }
      setFpSent(true);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  // ── Forgot — verify code ────────────────────────────────────────────────
  const handleFpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, code: fpCode }),
      });
      if (!res.ok) { setError('Invalid or expired code.'); return; }
      setFpCodeOk(true);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  // ── Forgot — set new password ───────────────────────────────────────────
  const handleFpReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpNewPass !== fpConfirm) { setError('Passwords do not match.'); return; }
    if (fpNewPass.length < 8)    { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, code: fpCode, newPassword: fpNewPass }),
      });
      if (!res.ok) { setError('Reset failed. Please start over.'); return; }
      // Reset done — go back to login
      setScreen('login');
      setFpEmail(''); setFpCode(''); setFpNewPass(''); setFpConfirm('');
      setFpSent(false); setFpCodeOk(false);
      setError('');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  // ── Render helpers ──────────────────────────────────────────────────────
  const PwdToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" className="auth-eye" onClick={onToggle} tabIndex={-1}
      aria-label="Toggle password visibility">
      {show
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
          <h1>Connect.<br/>Collaborate.<br/>Create.</h1>
          <p>The platform where brands and influencers build something remarkable together.</p>
        </div>
        <div className="auth-left-dots">
          {[...Array(12)].map((_, i) => <div key={i} className="auth-dot" />)}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-card">

          {/* ═══ LOGIN SCREEN ═══ */}
          {screen === 'login' && (
            <>
              <div className="auth-card-head">
                <h2>Welcome back</h2>
                <p>Sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} noValidate>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" autoComplete="email" value={email}
                    onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>

                <div className="auth-field">
                  <div className="auth-field-row">
                    <label>Password</label>
                    <button type="button" className="auth-link-btn"
                      onClick={() => { setScreen('forgot-email'); setError(''); }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <input type={showPass ? 'text' : 'password'} autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required placeholder="••••••••" />
                    <PwdToggle show={showPass} onToggle={() => setShowPass(p => !p)} />
                  </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Sign in'}
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>
              <GoogleButton />

              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </>
          )}

          {/* ═══ FORGOT — ENTER EMAIL ═══ */}
          {screen === 'forgot-email' && (
            <>
              <button className="auth-back-btn" onClick={() => { setScreen('login'); setError(''); setFpSent(false); setFpCodeOk(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                Back to login
              </button>

              <div className="auth-card-head">
                <div className="auth-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h2>{fpCodeOk ? 'New password' : fpSent ? 'Check your email' : 'Reset password'}</h2>
                <p>
                  {fpCodeOk
                    ? 'Choose a strong new password.'
                    : fpSent
                    ? `We sent a 6-digit code to ${fpEmail}`
                    : 'Enter your email and we\'ll send a reset code.'}
                </p>
              </div>

              {/* Step 1: email */}
              {!fpSent && (
                <form onSubmit={handleFpSend} noValidate>
                  <div className="auth-field">
                    <label>Email address</label>
                    <input type="email" value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)} required placeholder="you@example.com" />
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Send reset code'}
                  </button>
                </form>
              )}

              {/* Step 2: enter code */}
              {fpSent && !fpCodeOk && (
                <form onSubmit={handleFpVerify} noValidate>
                  <div className="auth-field">
                    <label>6-digit code</label>
                    <input type="text" inputMode="numeric" maxLength={6}
                      value={fpCode} onChange={e => setFpCode(e.target.value.replace(/\D/g, ''))}
                      required placeholder="000000" className="auth-otp-input" />
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Verify code'}
                  </button>
                  <button type="button" className="auth-btn-ghost"
                    onClick={() => { setFpSent(false); setFpCode(''); setError(''); }}>
                    Resend code
                  </button>
                </form>
              )}

              {/* Step 3: new password */}
              {fpSent && fpCodeOk && (
                <form onSubmit={handleFpReset} noValidate>
                  <div className="auth-field">
                    <label>New password</label>
                    <div className="auth-input-wrap">
                      <input type={fpShowNew ? 'text' : 'password'} value={fpNewPass}
                        onChange={e => setFpNewPass(e.target.value)} required placeholder="••••••••" />
                      <PwdToggle show={fpShowNew} onToggle={() => setFpShowNew(p => !p)} />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label>Confirm password</label>
                    <div className="auth-input-wrap">
                      <input type={fpShowConf ? 'text' : 'password'} value={fpConfirm}
                        onChange={e => setFpConfirm(e.target.value)} required placeholder="••••••••" />
                      <PwdToggle show={fpShowConf} onToggle={() => setFpShowConf(p => !p)} />
                    </div>
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Set new password'}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}