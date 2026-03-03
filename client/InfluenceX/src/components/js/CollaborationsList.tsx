import React from 'react';
import { Users, CheckCircle, Clock, XCircle, Package, Star, TrendingUp } from 'lucide-react';
// Reuses the exact same CSS as ApplicationsList
import '../css/ApplicationsList.css';
import type { Collaboration } from '../../pages/js/MyCollaborations';

interface Props {
  collaborations: Collaboration[];
  selected: Collaboration | null;
  onSelect: (c: Collaboration) => void;
  filterStatus: string;
  getCurrentStatus: (c: Collaboration) => string;
}

// Maps backend status → display label + icon  (mirrors ApplicationsList statuses)
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':              return <Clock size={16} />;
    case 'accepted':             return <CheckCircle size={16} />;
    case 'rejected':             return <XCircle size={16} />;
    case 'reviewing':            return <Package size={16} />;
    case 'pending_deliverables': return <Package size={16} />;
    case 'settled':              return <Star size={16} />;
    case 'withdraw':             return <XCircle size={16} />;
    default:                     return <Clock size={16} />;
  }
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending:              'Pending',
    accepted:             'Accepted',
    rejected:             'Rejected',
    reviewing:            'Reviewing',
    pending_deliverables: 'Pending Deliverables',
    settled:              'Settled',
    withdraw:             'Withdrawn',
  };
  return map[status] ?? status.replace(/_/g, ' ');
};

// Maps to the same .status-{x} CSS classes used in ApplicationsList.css
const getStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    pending:              'status-pending',
    accepted:             'status-accepted',
    rejected:             'status-rejected',
    reviewing:            'status-in-progress',
    pending_deliverables: 'status-delivered',
    settled:              'status-completed',
    withdraw:             'status-rejected',
  };
  return map[status] ?? 'status-pending';
};

const CollaborationsList: React.FC<Props> = ({
  collaborations,
  selected,
  onSelect,
  filterStatus,
  getCurrentStatus,
}) => {
  return (
    // Same container class as ApplicationsList — identical look
    <div className="applications-list-container">
      <div className="applications-list-header">
        <h2>Collaborations</h2>
        <span className="application-count">
          {collaborations.length}{filterStatus !== 'all' ? ` ${filterStatus}` : ''}
        </span>
      </div>

      <div className="applications-scroll">
        {collaborations.length === 0 ? (
          <div className="empty-applications-list">
            <Users size={48} />
            <p>No collaborations found</p>
          </div>
        ) : (
          collaborations.map(collab => {
            const status = getCurrentStatus(collab);
            const isSelected = selected?.applicationId === collab.applicationId;

            return (
              <div
                key={collab.applicationId}
                className={`application-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(collab)}
              >
                {/* Influencer-style header row — shows campaign avatar + title */}
                <div className="application-item-header">
                  <div className="influencer-avatar-small">
                    <div className="avatar-placeholder-small">
                      {collab.postName?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="influencer-info-small">
                    <h4>{collab.postName}</h4>
                    <p className="followers-small">
                      <Clock size={12} />
                      {new Date(collab.postDeadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Status badge — same classes as ApplicationsList */}
                <div className={`status-badge ${getStatusClass(status)}`}>
                  {getStatusIcon(status)}
                  <span>{getStatusLabel(status)}</span>
                </div>

                {/* Applied date from first event */}
                {collab.applicationStatusList?.[0]?.timestamp && (
                  <div className="application-date-small">
                    Applied{' '}
                    {new Date(collab.applicationStatusList[0].timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CollaborationsList;