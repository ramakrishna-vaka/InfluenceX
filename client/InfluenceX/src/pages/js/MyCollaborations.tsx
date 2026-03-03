import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import '../css/MyCollaborations.css';
import CollaborationsList from '../../components/js/CollaborationsList';
import ApplicationTimeline from '../../components/js/ApplicationTimeline';

export interface StatusEvent {
  status: string;
  timestamp: string;
}

export interface Collaboration {
  postId: string;
  title: string;
  applicationId: string;
  userName: string;
  userId: string;
  applicationStatusList: StatusEvent[];
  deadline: string;
}

export interface Counts {
  accepted: number;
  settled: number;
  pending: number;
  reviewing: number;
  rejected: number;
  withdrawn: number;
  pendingDeliverables: number;
}

const MyCollaborations: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Collaboration | null>(null);
  const [statsFilter, setStatsFilter] = useState<string>('all');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/my-collaborations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      setCollaborations(data.posts || []);
      setCounts(data.counts || null);
    } catch (err) {
      console.error('Error fetching collaborations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = (c: Collaboration): string => {
    const list = c.applicationStatusList;
    if (!list || list.length === 0) return 'pending';
    return list[list.length - 1].status.toLowerCase().replace(/ /g, '_');
  };

  const stats = {
    total: collaborations.length,
    pending: counts?.pending ?? 0,
    inProgress: (counts?.reviewing ?? 0) + (counts?.pendingDeliverables ?? 0),
    accepted: counts?.accepted ?? 0,
    completed: counts?.settled ?? 0,
  };

  const filtered = statsFilter === 'all'
    ? collaborations
    : collaborations.filter(c => {
        const s = getCurrentStatus(c);
        if (statsFilter === 'pending')     return s === 'pending';
        if (statsFilter === 'accepted')    return s === 'accepted' || s === 'reviewing';
        if (statsFilter === 'in-progress') return s === 'reviewing' || s === 'pending_deliverables';
        if (statsFilter === 'completed')   return s === 'settled';
        return true;
      });

  if (loading) {
    return (
      <div className="mycollab-container">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mycollab-container">
      {/* Header */}
      <div className="mycollab-header">
        <div>
          <h1>My Collaborations</h1>
          <p className="page-description">Track every campaign you've applied to</p>
        </div>
      </div>

      {/* Stats — identical markup to CampaignLifecycle stats-dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card" onClick={() => { setStatsFilter('all'); setSelected(null); }}>
          <div className="stat-icon total"><Users size={24} /></div>
          <div className="stat-content"><h3>{stats.total}</h3><p>Total</p></div>
        </div>
        <div className="stat-card" onClick={() => { setStatsFilter('pending'); setSelected(null); }}>
          <div className="stat-icon pending"><Clock size={24} /></div>
          <div className="stat-content"><h3>{stats.pending}</h3><p>Pending</p></div>
        </div>
        <div className="stat-card" onClick={() => { setStatsFilter('in-progress'); setSelected(null); }}>
          <div className="stat-icon progress"><Package size={24} /></div>
          <div className="stat-content"><h3>{stats.inProgress}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card" onClick={() => { setStatsFilter('accepted'); setSelected(null); }}>
          <div className="stat-icon accepted"><TrendingUp size={24} /></div>
          <div className="stat-content"><h3>{stats.accepted}</h3><p>Accepted</p></div>
        </div>
        <div className="stat-card" onClick={() => { setStatsFilter('completed'); setSelected(null); }}>
          <div className="stat-icon completed"><CheckCircle size={24} /></div>
          <div className="stat-content"><h3>{stats.completed}</h3><p>Settled</p></div>
        </div>
      </div>

      {/* Split panel — same grid as lifecycle-content */}
      <div className="mycollab-content">
        <CollaborationsList
          collaborations={filtered}
          selected={selected}
          onSelect={setSelected}
          filterStatus={statsFilter}
          getCurrentStatus={getCurrentStatus}
        />
        <ApplicationTimeline
          collaboration={selected}
          onRefresh={fetchCollaborations}
        />
      </div>
    </div>
  );
};

export default MyCollaborations;