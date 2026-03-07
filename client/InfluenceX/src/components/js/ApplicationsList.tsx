import React from 'react';
import { Users, CheckCircle, Clock, XCircle, Package, Star } from 'lucide-react';
import '../css/ApplicationsList.css';

interface Application {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerImage?: string;
  followers: number;
  currentStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED';
  appliedAt: string;
  pitchMessage: string;
}

interface ApplicationsListProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  filterStatus: 'all' | 'pending' | 'accepted' | 'in-progress' | 'completed';
  onRefresh: () => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  selectedApplication,
  onSelectApplication,
  filterStatus,
  onRefresh
}) => {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'accepted':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'in-progress':
        return <Package size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'completed':
        return <Star size={16} />;
      default:
        return null;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'in-progress') return app.status === 'in-progress' || app.status === 'delivered';
    if (filterStatus === 'accepted') return app.status === 'accepted' || app.status === 'in-progress';
    if (filterStatus === 'completed') return app.status === 'completed';
    return app.status === filterStatus;
  });

  return (
    <div className="applications-list-container">
      <div className="applications-list-header">
        <h2>Applications</h2>
        <span className="application-count">{filteredApplications.length} {filterStatus !== 'all' ? filterStatus : ''}</span>
      </div>

      <div className="applications-scroll">
        {filteredApplications.length === 0 ? (
          <div className="empty-applications-list">
            <Users size={48} />
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map(application => (
            <div
              key={application.id}
              className={`application-item ${selectedApplication?.id === application.id ? 'selected' : ''}`}
              onClick={() => onSelectApplication(application)}
            >
              <div className="application-item-header">
                <div className="influencer-avatar-small">
                  {application.influencerImage ? (
                    <img 
                        src={`data:image/*;base64,${application.influencerImage}`} 
                        alt={application.influencerName}
                      />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {application.influencerName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="influencer-info-small">
                  <h4>{application.influencerName}</h4>
                  {/* <p className="followers-small">
                    <Users size={12} />
                    {formatFollowers(application.followers)}
                  </p> */}
                </div>
              </div>

              <div className={`status-badge status-${application.currentStatus}`}>
                {getStatusIcon(application.currentStatus)}
                <span>{application.currentStatus?.replace('_', ' ')}</span>
              </div>

              <div className="application-date-small">
                Applied {new Date(application?.appliedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;