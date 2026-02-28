import React, { useState, useEffect, useMemo } from 'react';
import {
  Rocket, Users, DollarSign, Calendar, Image as ImageIcon,
  User, Clock, CheckCircle, Star, X, Share2, ExternalLink, Gift,
} from 'lucide-react';
import '../css/Home.css';
import { Link, useLocation } from 'react-router-dom';
import type { Post } from '../../utils/Posts';
import { useCampaignFilter } from '../../CampaignFilterContext';
import CreateCampaignDialog from '../../components/js/CreateCampaignDialog';
import { getPlatformConfig } from '../../utils/PlatformIcons';

// ─── Post lifecycle ───────────────────────────────────────────────────────────
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'draft':              return { className: 'status-draft',     text: 'Draft' };
    case 'open':               return { className: 'status-open',      text: 'Open' };
    case 'applications-ended':
    case 'booked':
    case 'filled':             return { className: 'status-filled',    text: 'Applications Closed' };
    case 'in-progress':        return { className: 'status-progress',  text: 'In Progress' };
    case 'closed':             return { className: 'status-completed', text: 'Closed' };
    case 'completed':          return { className: 'status-completed', text: 'Completed' };
    default:                   return { className: 'status-open',      text: 'Open' };
  }
};

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<Post | null>(null);
  const [filterCategory] = useState('all');
  const [showMyPosts] = useState(false);

  const { searchQuery, filters, sortBy } = useCampaignFilter();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openPostId && posts.length > 0) {
      const post = posts.find(p => p.id === location.state.openPostId);
      if (post) { setSelectedPost(post); window.history.replaceState({}, document.title); }
    }
  }, [location.state, posts]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8080/posts', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch posts');
        setPosts(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'all')
      result = result.filter(p => p.type.toLowerCase() === filters.category.toLowerCase());
    if (filterCategory !== 'all')
      result = result.filter(p => p.type === filterCategory);
    if (filters.status !== 'all')
      result = result.filter(p => p.status === filters.status);
    if (filters.compensation !== 'all') {
      const [min, max] = filters.budget.split('-').map(v => v.replace('+', ''));
      const lo = parseInt(min) || 0, hi = max ? parseInt(max) : Infinity;
      result = result.filter(p => p.budget >= lo && p.budget <= hi);
    }
    if (showMyPosts) result = result.filter(p => p.isMyPost);
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent': case 'newest':    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'budget_high': case 'price-high': return b.budget - a.budget;
        case 'budget_low':  case 'price-low':  return a.budget - b.budget;
        case 'deadline':     return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'alphabetical': return a.title.localeCompare(b.title);
        case 'followers': return b.followers - a.followers;
        case 'application_deadline': {
          const da = (a as any).applicationDeadline ? new Date((a as any).applicationDeadline).getTime() : Infinity;
          const db = (b as any).applicationDeadline ? new Date((b as any).applicationDeadline).getTime() : Infinity;
          return da - db;
        }
        default: return 0;
      }
    });
    return result;
  }, [posts, searchQuery, sortBy, filterCategory, showMyPosts, filters]);

  // ─── Formatters ─────────────────────────────────────────────────────────────
  const formatINRShort = (v: number) => {
    if (v >= 10000000) return (v / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (v >= 100000)   return (v / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    if (v >= 1000)     return (v / 1000).toFixed(2).replace(/\.00$/, '') + ' K';
    return v.toString();
  };
  const fmt = (v: number) => `₹${formatINRShort(v)}`;

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
    return n?.toString();
  };

  const getDays = (d: string) => {
    const now = new Date(); now.setHours(0,0,0,0);
    const dd = new Date(d);  dd.setHours(0,0,0,0);
    return Math.round((dd.getTime() - now.getTime()) / 86400000);
  };

  const renderDeadline = (deadline: string, inline = false) => {
    const days = getDays(deadline);
    const dateStr = new Date(deadline).toLocaleDateString();
    const isUrgent = days >= 0 && days <= 3, isPast = days < 0;
    const label = isPast ? 'Expired' : days === 0 ? 'Today!' : `${days}d left`;
    const badgeCls = `deadline-badge ${isUrgent || isPast ? 'deadline-urgent' : 'deadline-normal'}`;
    if (inline) return (<><span>{dateStr}</span><span className={badgeCls}>{label}</span></>);
    return (
      <span className={isUrgent || isPast ? 'deadline-text-urgent' : ''}>
        {dateStr}<span className={badgeCls} style={{ marginLeft: 8 }}>{label}</span>
      </span>
    );
  };

  const isAppDeadlinePast = (post: Post) => {
    const d = (post as any).applicationDeadline;
    if (!d) return false;
    const dd = new Date(d); dd.setHours(23,59,59,999);
    return dd < new Date();
  };

  // ─── Platform chips ──────────────────────────────────────────────────────────
  const renderPlatformsCompact = (platforms: string[]) => {
    if (!platforms?.length) return null;
    const show = platforms.slice(0, 3), rest = platforms.length - 3;
    return (
      <div className="platform-chips-compact">
        {show.map(p => (
          <span key={p} className="platform-chip-compact" title={p}>
            {getPlatformConfig(p).icon ? React.createElement(getPlatformConfig(p).icon, { size: 24 }) : '🔗'}
          </span>
        ))}
        {rest > 0 && <span className="platform-chip-compact platform-chip-more">+{rest}</span>}
      </div>
    );
  };

  const renderPlatformsFull = (platforms: string[]) => {
    if (!platforms?.length) return <span style={{ color: '#9ca3af', fontSize: 14 }}>—</span>;
    return (
      <div className="platform-chips-full">
        {platforms.map(p => {
          const cfg = getPlatformConfig(p);
          return (
            <span key={p} className="platform-chip-full">
              <span className="platform-chip-emoji">{cfg.emoji}</span>
              {cfg.label}
            </span>
          );
        })}
      </div>
    );
  };

  const handleApplyClick = (post: Post) => {
    if (post.isCreatedByMe) { setSelectedPostForEdit(post); }
    else { window.location.href = `/apply/${post.id}`; }
  };

  if (loading) return (
    <div className="main-content"><div className="loading-container">
      <div className="loading-spinner"></div><p>Loading campaigns...</p>
    </div></div>
  );
  if (error) return (
    <div className="main-content"><div className="error-container">
      <p>Error loading campaigns: {error}</p>
      <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
    </div></div>
  );

  return (
    <div className="main-content">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Premium Brand <span className="gradient-text">Partnerships</span></h1>
          <p className="hero-subtitle">Discover exclusive collaboration opportunities with top-tier brands and creators</p>
        </div>
      </div>

      <div className="content-section">
        {filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map(post => {
              const sc = getStatusConfig(post.status);
              const hasImg = post.imageBase64?.trim();
              const appClosed = isAppDeadlinePast(post);

              return (
                <div key={post.id} className={`post-card ${hasImg ? 'has-image' : 'no-image'}`}>
                  {hasImg && (
                    <div className="post-image">
                      <img className="post-img" src={`data:image/*;base64,${post.imageBase64}`} alt="Post" />
                      <div className="post-overlay"><span className={sc.className}>{sc.text}</span></div>
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-header">
                      <div className="post-title-section">
                        {!hasImg && <div className="post-icon-placeholder"><ImageIcon size={20} /></div>}
                        <h3 className="post-title">{post.title}</h3>
                        {!hasImg && <span className={sc.className}>{sc.text}</span>}
                      </div>
                      {/* Category + platform emojis */}
                      <div className="post-category-row">
                        <span className="post-category">{post.type}</span>
                        {renderPlatformsCompact(post.platformsNeeded)}
                      </div>
                    </div>

                    <p className="post-description">{post.description}</p>

                    <div className="post-metrics">
                      {post.compensationType === 'money' ? (
                        <div className="metric price-metric">
                          <DollarSign className="metric-icon" size={16} />
                          <span className="metric-value">{(fmt(Number(post.compensationDescription)))}</span>
                        </div>
                      ) : (
                        <div className="metric barter-metric">
                          <Gift className="metric-icon" size={16} />
                          <span className="metric-value">{post.compensationDescription || 'Other'}</span>
                        </div>
                      )}
                      <div className="metric">
                        <Users className="metric-icon" size={16} />
                        <span>{formatFollowers(post.followers)}+ followers</span>
                      </div>
                      <div className="metric">
                        <Calendar className="metric-icon" size={16} />
                        {renderDeadline(post.deadline, true)}
                      </div>
                    </div>

                    <div className="post-footer">
                      <div className="post-author">
                        <div className="author-avatar"><User size={14} /></div>
                        <Link to={`/profile/${post.createdBy.id}`}><span>{post.createdBy.name}</span></Link>
                      </div>
                      <div className="post-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{post.createdBy?.rating || 0}</span>
                      </div>
                    </div>

                    <div className="post-actions">
                      <button
                        className={`btn-primary${!post.isCreatedByMe && appClosed ? ' btn-disabled' : ''}`}
                        onClick={() => handleApplyClick(post)}
                        disabled={!post.isCreatedByMe && appClosed}
                      >
                        {post.isCreatedByMe ? 'Edit Campaign' : appClosed ? 'Applications Closed' : 'Apply Now'}
                      </button>
                      <button className="btn-secondary" onClick={() => setSelectedPost(post)}>View Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Rocket size={64} className="empty-icon" />
            <h3>No campaigns found</h3>
            <p>Try adjusting your filters or check back later for new opportunities.</p>
          </div>
        )}
      </div>

      <CreateCampaignDialog
        isOpen={!!selectedPostForEdit}
        onClose={() => setSelectedPostForEdit(null)}
        post={selectedPostForEdit}
        mode="edit"
      />

      {/* ── View Details Dialog ── */}
      {selectedPost && (
        <div className="dialog-overlay" onClick={() => setSelectedPost(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-header-left">
                <span className={`dialog-status-badge ${getStatusConfig(selectedPost.status).className}`}>
                  {getStatusConfig(selectedPost.status).text}
                </span>
                <h2>{selectedPost.title}</h2>
                <span className="dialog-category-tag">{selectedPost.type}</span>
              </div>
              <button className="dialog-close" onClick={() => setSelectedPost(null)}><X size={20} /></button>
            </div>

            <div className="dialog-body">
              {selectedPost.imageBase64 && (
                <div className="dialog-image">
                  <img className="post-img" src={`data:image/*;base64,${selectedPost.imageBase64}`} alt={selectedPost.title} />
                </div>
              )}

              <div className="dialog-info-grid">
                <div className="info-item">
                  <span className="info-label">Min Followers</span>
                  <span className="info-value">
                    <Users size={14} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                    {formatFollowers(selectedPost.followers)}+
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deliverable Deadline</span>
                  <span className="info-value">{renderDeadline(selectedPost.deadline)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Compensation</span>
                  <span className="info-value">
                    {selectedPost.compensationType === 'money'
                      ? fmt(selectedPost.budget)
                      : selectedPost.compensationType || 'Barter'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Posted By</span>
                  <span className="info-value">
                    <Link to={`/profile/${selectedPost.createdBy.id}`} className="dialog-author-link">
                      {selectedPost.createdBy.name}
                    </Link>
                  </span>
                </div>
                {(selectedPost as any).applicationDeadline && (
                  <div className="info-item">
                    <span className="info-label">Apply By</span>
                    <span className="info-value">
                      {renderDeadline((selectedPost as any).applicationDeadline)}
                    </span>
                  </div>
                )}
                {selectedPost.location && (
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{selectedPost.location}</span>
                  </div>
                )}
                {/* Platforms — spans full width */}
                {selectedPost.platformsNeeded?.length > 0 && (
                  <div className="info-item info-item-wide">
                    <span className="info-label">Platforms</span>
                    <div className="info-value" style={{ display:'block', marginTop:6 }}>
                      {renderPlatformsFull(selectedPost.platformsNeeded)}
                    </div>
                  </div>
                )}
              </div>

              <div className="dialog-section">
                <h3>Description</h3>
                <p>{selectedPost.description}</p>
              </div>
              <div className="dialog-section">
                <h3>Deliverables</h3>
                <p>{(selectedPost as any).deliverables || '—'}</p>
              </div>
              <div className="dialog-section">
                <h3>{selectedPost.compensationType === 'money' ? 'Compensation' : 'What You Get'}</h3>
                <p>{(selectedPost as any).compensationDescription || '—'}</p>
              </div>
              <div className="dialog-section">
                <h3>Application Period</h3>
                <p>
                  {new Date(selectedPost.createdAt).toLocaleDateString()}
                  {' – '}
                  {(selectedPost as any).applicationDeadline
                    ? new Date((selectedPost as any).applicationDeadline).toLocaleDateString()
                    : new Date(selectedPost.deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="dialog-meta-row">
                <span className="dialog-meta-item">
                  <Clock size={12} />
                  Posted {new Date(selectedPost.createdAt).toLocaleString()}
                </span>
                {(selectedPost as any).updatedAt && (selectedPost as any).updatedAt !== selectedPost.createdAt && (
                  <span className="dialog-meta-item">
                    <CheckCircle size={12} />
                    Updated {new Date((selectedPost as any).updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn-secondary"><Share2 size={16} />Share Campaign</button>
              <button
                className="btn-primary"
                onClick={() => handleApplyClick(selectedPost)}
                disabled={!selectedPost.isMyPost && isAppDeadlinePast(selectedPost)}
              >
                {selectedPost.isMyPost
                  ? 'Manage Campaign'
                  : isAppDeadlinePast(selectedPost)
                  ? 'Applications Closed'
                  : 'Apply to Collaborate'}
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;