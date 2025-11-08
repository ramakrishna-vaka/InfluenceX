import React from "react";
import { X, Share2, ExternalLink } from "lucide-react";

interface ShowPostDetailsDialogProps {
  selectedPost: any; // ideally replace 'any' with a Post interface
  setSelectedPost: (post: any | null) => void;
  handleShareCampaign: (id: string) => void;
  handleApplyClick: (post: any) => void;
  getStatusConfig: (status: string) => { text: string; className: string };
  formatCurrency: (price: number) => string;
  formatFollowers: (followers: number) => string;
}

const ShowPostDetailsDialog: React.FC<ShowPostDetailsDialogProps> = ({
  selectedPost,
  setSelectedPost,
  handleShareCampaign,
  handleApplyClick,
  getStatusConfig,
  formatCurrency,
  formatFollowers,
}) => {
  if (!selectedPost) return null; // safety check

  return (
    <div className="dialog-overlay" onClick={() => setSelectedPost(null)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{selectedPost.title}</h2>
          <button
            className="dialog-close"
            onClick={() => setSelectedPost(null)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="dialog-body">
          {selectedPost.image && (
            <div className="dialog-image">
              <img src={selectedPost.image} alt={selectedPost.title} />
            </div>
          )}

          <div className="dialog-info-grid">
            <div className="info-item">
              <span className="info-label">Category</span>
              <span className="info-value">{selectedPost.category}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span
                className={`info-value ${
                  getStatusConfig(selectedPost.status).className
                }`}
              >
                {getStatusConfig(selectedPost.status).text}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Budget</span>
              <span className="info-value">
                {formatCurrency(selectedPost.price)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Min Followers</span>
              <span className="info-value">
                {formatFollowers(selectedPost.minFollowers)}+
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Deadline</span>
              <span className="info-value">
                {new Date(selectedPost.deadline).toLocaleDateString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Posted By</span>
              <span className="info-value">{selectedPost.authorName}</span>
            </div>
          </div>

          <div className="dialog-section">
            <h3>Description</h3>
            <p>{selectedPost.description}</p>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            className="btn-secondary"
            onClick={() => handleShareCampaign(selectedPost.id)}
          >
            <Share2 size={16} />
            Share Campaign
          </button>
          <button
            className="btn-primary"
            onClick={() => handleApplyClick(selectedPost)}
          >
            {selectedPost.isMyPost ? "Manage Campaign" : "Apply to Collaborate"}
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowPostDetailsDialog;
