/**
 * WalletDialog.tsx
 *
 * Self-contained wallet panel. Props:
 *   isOpen   — whether to show
 *   onClose  — close handler
 *
 * API shape expected:
 *   GET /wallet          → { balance: number, transactions: Transaction[] }
 *   POST /wallet/withdraw → { amount: number, accountNumber: string, ifsc: string }
 */

import React, { useEffect, useState } from 'react';
import {
  X, ArrowDownLeft, ArrowUpRight, IndianRupee,
  Landmark, AlertCircle, CheckCircle2, Loader2, Clock,
} from 'lucide-react';
import '../css/WalletDialog.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

type Screen = 'wallet' | 'withdraw' | 'success';

const MIN_WITHDRAW = 500;

// ─── Helper ───────────────────────────────────────────────────────────────────

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
    .format(amount);

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// ─── Component ────────────────────────────────────────────────────────────────

const WalletDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [screen, setScreen]       = useState<Screen>('wallet');
  const [wallet, setWallet]       = useState<WalletData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Withdraw form
  const [amount, setAmount]         = useState('');
  const [accountNo, setAccountNo]   = useState('');
  const [ifsc, setIfsc]             = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Fetch wallet on open
  useEffect(() => {
    if (!isOpen) return;
    setScreen('wallet');
    setError('');
    fetchWallet();
  }, [isOpen]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load wallet');
      const data: WalletData = await res.json();
      setWallet(data);
    } catch {
      setError('Could not load wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseFloat(amount);
    if (!amt || amt < MIN_WITHDRAW) {
      setWithdrawError(`Minimum withdrawal amount is ${fmt(MIN_WITHDRAW)}.`);
      return;
    }
    if (wallet && amt > wallet.balance) {
      setWithdrawError('Amount exceeds your wallet balance.');
      return;
    }
    if (!accountNo.trim() || !ifsc.trim()) {
      setWithdrawError('Please fill in all bank details.');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, accountNumber: accountNo, ifsc }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setWithdrawError(msg || 'Withdrawal failed. Please try again.');
        return;
      }
      setScreen('success');
      // Refresh balance after success
      await fetchWallet();
    } catch {
      setWithdrawError('Network error. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const resetWithdraw = () => {
    setAmount(''); setAccountNo(''); setIfsc('');
    setWithdrawError('');
    setScreen('wallet');
  };

  if (!isOpen) return null;

  const canWithdraw = wallet ? wallet.balance >= MIN_WITHDRAW : false;

  return (
    <>
      {/* Backdrop */}
      <div className="wd-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="wd-panel">

        {/* ── WALLET SCREEN ── */}
        {screen === 'wallet' && (
          <>
            <div className="wd-header">
              <span className="wd-title">My Wallet</span>
              <button className="wd-close" onClick={onClose}><X size={18} /></button>
            </div>

            {loading && (
              <div className="wd-loading">
                <Loader2 size={28} className="wd-spin" />
                <span>Loading wallet…</span>
              </div>
            )}

            {error && !loading && (
              <div className="wd-error-banner">
                <AlertCircle size={15} />{error}
              </div>
            )}

            {wallet && !loading && (
              <>
                {/* Balance card */}
                <div className="wd-balance-card">
                  <div className="wd-balance-label">Available Balance</div>
                  <div className="wd-balance-amount">{fmt(wallet.balance)}</div>
                  <div className="wd-balance-sub">InfluenceX Wallet</div>
                  <div className="wd-card-shimmer" />
                </div>

                {/* Withdraw button */}
                <div className="wd-withdraw-row">
                  {canWithdraw ? (
                    <button className="wd-btn-withdraw" onClick={() => setScreen('withdraw')}>
                      <Landmark size={15} />
                      Withdraw to Bank
                    </button>
                  ) : (
                    <div className="wd-min-notice">
                      <AlertCircle size={13} />
                      Minimum {fmt(MIN_WITHDRAW)} balance required to withdraw
                    </div>
                  )}
                </div>

                {/* Transaction history */}
                <div className="wd-txn-label">Transaction History</div>
                <div className="wd-txn-list">
                  {wallet.transactions.length === 0 ? (
                    <div className="wd-txn-empty">
                      <Clock size={32} />
                      <p>No transactions yet</p>
                    </div>
                  ) : (
                    wallet.transactions.map(txn => (
                      <div key={txn.id} className={`wd-txn-item wd-txn-${txn.type.toLowerCase()}`}>
                        <div className="wd-txn-icon">
                          {txn.type === 'CREDIT'
                            ? <ArrowDownLeft size={15} />
                            : <ArrowUpRight size={15} />}
                        </div>
                        <div className="wd-txn-info">
                          <span className="wd-txn-desc">{txn.description}</span>
                          <span className="wd-txn-date">{fmtDate(txn.createdAt)}</span>
                        </div>
                        <span className="wd-txn-amount">
                          {txn.type === 'CREDIT' ? '+' : '−'}{fmt(txn.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── WITHDRAW SCREEN ── */}
        {screen === 'withdraw' && (
          <>
            <div className="wd-header">
              <button className="wd-back" onClick={resetWithdraw}>
                <X size={16} />
              </button>
              <span className="wd-title">Withdraw Funds</span>
              <button className="wd-close" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="wd-balance-pill">
              Available: <strong>{fmt(wallet?.balance ?? 0)}</strong>
            </div>

            <form className="wd-form" onSubmit={handleWithdraw} noValidate>
              <div className="wd-field">
                <label>Amount (₹)</label>
                <div className="wd-input-wrap">
                  <IndianRupee size={14} className="wd-input-icon" />
                  <input
                    type="number" min={MIN_WITHDRAW} step="1"
                    placeholder={`Min. ₹${MIN_WITHDRAW}`}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="wd-field">
                <label>Bank Account Number</label>
                <input
                  type="text" placeholder="Enter account number"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                />
              </div>

              <div className="wd-field">
                <label>IFSC Code</label>
                <input
                  type="text" placeholder="e.g. SBIN0001234"
                  value={ifsc}
                  onChange={e => setIfsc(e.target.value.toUpperCase())}
                />
              </div>

              {withdrawError && (
                <div className="wd-error-banner">
                  <AlertCircle size={13} />{withdrawError}
                </div>
              )}

              <button type="submit" className="wd-btn-confirm" disabled={withdrawing}>
                {withdrawing
                  ? <><Loader2 size={15} className="wd-spin" /> Processing…</>
                  : <><Landmark size={15} /> Confirm Withdrawal</>}
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS SCREEN ── */}
        {screen === 'success' && (
          <div className="wd-success">
            <button className="wd-close wd-close-abs" onClick={onClose}><X size={18} /></button>
            <div className="wd-success-ring">
              <CheckCircle2 size={36} />
            </div>
            <h3>Withdrawal Initiated</h3>
            <p>Your funds will arrive in your bank account within 1–3 business days.</p>
            <button className="wd-btn-confirm" onClick={resetWithdraw}>
              Back to Wallet
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default WalletDialog;