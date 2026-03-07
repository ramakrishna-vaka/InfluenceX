import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import '../css/MyCollaborations.css';
import CollaborationsList from '../../components/js/CollaborationsList';
import ApplicationTimeline from '../../components/js/ApplicationTimeline';

export interface StatusEvent { status: string; timestamp: string; }

export interface Collaboration {
  postId: string; title: string; applicationId: string;
  userName: string; userId: string;
  applicationStatusList: StatusEvent[]; deadline: string;
}

export interface Counts {
  accepted: number; settled: number; pending: number; reviewing: number;
  rejected: number; withdrawn: number; pendingDeliverables: number;
}

const MyCollaborations: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Collaboration | null>(null);
  const [statsFilter, setStatsFilter] = useState<string>('all');

  useEffect(() => { fetchCollaborations(); }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/my-collaborations', {
        method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      });
      const data = await res.json();
      setCollaborations(data.posts || []);
      setCounts(data.counts || null);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
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

  const filtered = statsFilter === 'all' ? collaborations
    : collaborations.filter(c => {
        const s = getCurrentStatus(c);
        if (statsFilter === 'pending')     return s === 'pending';
        if (statsFilter === 'accepted')    return s === 'accepted' || s === 'reviewing';
        if (statsFilter === 'in-progress') return s === 'reviewing' || s === 'pending_deliverables';
        if (statsFilter === 'completed')   return s === 'settled';
        return true;
      });

  if (loading) return (
    <div className='mycollab-container'>
      <div className='loading-state'><div className='loading-spinner' /><p>Loading...</p></div>
    </div>
  );

  const pill = (filter: string, cls: string, icon: React.ReactNode, count: number, label: string) => (
    <button
      className={['stat-pill', cls, statsFilter === filter ? 'active' : ''].join(' ')}
      onClick={() => { setStatsFilter(filter); setSelected(null); }}
    >
      {icon}<strong>{count}</strong><span>{label}</span>
    </button>
  );

  return (
    <div className='mycollab-container'>
      <div className='mycollab-topbar'>
        <div className='mycollab-topbar-title'>
          <h1>My Collaborations</h1>
          <span className='mycollab-topbar-sub'>Track every campaign you've applied to</span>
        </div>
        <div className='topbar-stats'>
          {pill('all',         'stat-pill-total',    <Users size={12} />,     stats.total,      'All')}
          {pill('pending',     'stat-pill-pending',  <Clock size={12} />,     stats.pending,    'Pending')}
          {pill('in-progress', 'stat-pill-progress', <Package size={12} />,   stats.inProgress, 'Active')}
          {pill('accepted',    'stat-pill-accepted', <TrendingUp size={12} />,stats.accepted,   'Accepted')}
          {pill('completed',   'stat-pill-completed',<CheckCircle size={12} />,stats.completed, 'Settled')}
        </div>
      </div>

      <div className='mycollab-content'>
        <CollaborationsList
          collaborations={filtered} selected={selected} onSelect={setSelected}
          filterStatus={statsFilter} getCurrentStatus={getCurrentStatus}
        />
        <ApplicationTimeline collaboration={selected} onRefresh={fetchCollaborations} />
      </div>
    </div>
  );
};

export default MyCollaborations;