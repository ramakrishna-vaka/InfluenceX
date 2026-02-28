import React, { useState, useEffect } from "react";
import {
  X, Users, FileText, Megaphone, Gift, Zap, TrendingUp, Globe,
  UtensilsCrossed, ShoppingBag, Dumbbell, Plane, Music, Sparkles,
  DollarSign, Package, CalendarClock, CalendarCheck, Lock,
  ChevronDown, AlertTriangle,
} from "lucide-react";
import type { CreateCampaignDialogProps } from "../../utils/Posts";
import "./../css/CreateCampaignDialog.css";

type CompensationType = "money" | "other";

/**
 * Post lifecycle stages shown in the Edit dialog:
 *   open               → accepting new applications
 *   applications-ended → stop new applications, deliverables still running
 *   closed             → fully shut down (no new apps, no active deliverables)
 */
type PostStatus = "draft" | "open" | "applications-ended" | "closed";

interface FormData {
  name: string;
  type: string;
  description: string;
  deliverables: string;
  budget: string;
  compensationType: CompensationType;
  compensationDescription: string;
  applicationDeadline: string;
  deliverableDeadline: string;
  platforms: string[];
  location: string;
  followers: string;
  postStatus: PostStatus;
}

const campaignTypes = [
  { value: "food-beverage",     label: "Food & Beverage",    icon: UtensilsCrossed },
  { value: "fitness-wellness",  label: "Fitness & Wellness", icon: Dumbbell },
  { value: "fashion-style",     label: "Fashion & Style",    icon: ShoppingBag },
  { value: "travel-lifestyle",  label: "Travel & Lifestyle", icon: Plane },
  { value: "entertainment",     label: "Entertainment",      icon: Music },
  { value: "beauty-skincare",   label: "Beauty & Skincare",  icon: Sparkles },
  { value: "tech-gadgets",      label: "Tech & Gadgets",     icon: Zap },
  { value: "brand-awareness",   label: "Brand Awareness",    icon: Megaphone },
  { value: "giveaway",          label: "Contest & Giveaway", icon: Gift },
  { value: "performance",       label: "Performance",        icon: TrendingUp },
  { value: "influencer-collab", label: "Influencer Collab",  icon: Users },
  { value: "content-creation",  label: "Content Creation",   icon: FileText },
];

const availablePlatforms = [
  "Instagram", "Facebook", "YouTube", "Twitter/X", "LinkedIn", "TikTok", "Pinterest",
];

const compensationTypes: {
  value: CompensationType; label: string; icon: React.ElementType; placeholder: string;
}[] = [
  { value: "money", label: "Cash / Money",   icon: DollarSign, placeholder: "e.g. ₹5,000 per post" },
  { value: "other", label: "Other / Custom", icon: Package,    placeholder: "Describe your compensation offer" },
];

// Fields locked forever after creation
const CREATION_LOCKED: (keyof FormData | "image")[] = ["type", "platforms", "followers"];

// Fields locked while any application is in-progress
const IN_PROGRESS_LOCKED: (keyof FormData | "image")[] = [
  "deliverables", "compensationType", "compensationDescription", "deliverableDeadline",
];

// ─── Lifecycle option definitions ─────────────────────────────────────────────
interface LifecycleOption {
  value: PostStatus;
  label: string;
  description: string;
  requiresNoInProgress: boolean; // true = only available when no application is in-progress
  color: string;
}

const LIFECYCLE_OPTIONS: LifecycleOption[] = [
  {
    value: "open",
    label: "Open",
    description: "Accepting new applications.",
    requiresNoInProgress: false,
    color: "#10b981",
  },
  {
    value: "applications-ended",
    label: "Applications Closed",
    description: "Stop accepting new applications. Ongoing deliverables continue.",
    requiresNoInProgress: false,
    color: "#8b5cf6",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Fully close this post. No new applications or active deliverables.",
    requiresNoInProgress: true,
    color: "#ef4444",
  },
];

const buildInitialForm = (post: CreateCampaignDialogProps["post"]): FormData => ({
  name:                    post?.title                         ?? "",
  type:                    post?.type                          ?? "",
  description:             post?.description                   ?? "",
  deliverables:            (post as any)?.deliverables         ?? "",
  budget:                  post?.budget?.toString()            ?? "",
  compensationType:        (post as any)?.compensationType     ?? "money",
  compensationDescription: (post as any)?.compensationDescription ?? "",
  applicationDeadline:     (post as any)?.applicationDeadline  ?? "",
  deliverableDeadline:     post?.deadline                      ?? "",
  platforms:               post?.platformsNeeded               ?? [],
  location:                post?.location                      ?? "",
  followers:               post?.followers?.toString()         ?? "",
  postStatus:              ((post as any)?.status as PostStatus) ?? "open",
});

const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
  isOpen, onClose, userId, post, mode,
}) => {
  const [formData, setFormData]       = useState<FormData>(buildInitialForm(post));
    const [image, setImage] = useState<File | null>(null);
const [existingImage, setExistingImage] = useState(post?.imageBase64 || "");
  const [applications, setApplications]   = useState<any[]>([]);
  const [showLifecycle, setShowLifecycle] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(buildInitialForm(post));
      setExistingImage(post.imageBase64 || "");
      if (mode === "edit") {
        fetch(`http://localhost:8080/applications/${post.id}`, { credentials: "include" })
          .then(r => r.json())
          .then(d => setApplications(Array.isArray(d) ? d : []))
          .catch(() => setApplications([]));
      }
    }
  }, [post]);

  const hasInProgress = applications.some(a => a.status === "in-progress");

  const isEditable = (field: keyof FormData | "image"): boolean => {
    if (mode !== "edit") return true;
    if (CREATION_LOCKED.includes(field)) return false;
    if (hasInProgress && IN_PROGRESS_LOCKED.includes(field)) return false;
    return true;
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!isEditable(name as keyof FormData)) return;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleTypeSelect = (type: string) => {
    if (!isEditable("type")) return;
    setFormData(p => ({ ...p, type }));
  };

  const handlePlatformToggle = (platform: string) => {
    if (!isEditable("platforms")) return;
    setFormData(p => ({
      ...p,
      platforms: p.platforms.includes(platform)
        ? p.platforms.filter(x => x !== platform)
        : [...p.platforms, platform],
    }));
  };

  const handleCompensationTypeSelect = (ct: CompensationType) => {
    if (!isEditable("compensationType")) return;
    setFormData(p => ({ ...p, compensationType: ct, budget: ct !== "money" ? "" : p.budget }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
    // if (!isEditable("image")) return;
    // if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  const handleLifecycleSelect = (value: PostStatus) => {
    const opt = LIFECYCLE_OPTIONS.find(o => o.value === value)!;
    if (opt.requiresNoInProgress && hasInProgress) return; // guard
    setFormData(p => ({ ...p, postStatus: value }));
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      alert("Please fill in required fields (Name and Type)");
      return;
    }
    const data = new FormData();
    data.append("userId",                  userId?.toString() ?? post?.createdBy?.id?.toString() ?? "");
    data.append("campaignTitle",           formData.name);
    data.append("campaignDescription",     formData.description);
    data.append("deliverables",            formData.deliverables);
    data.append("compensationType",        formData.compensationType);
    data.append("compensationDescription", formData.compensationDescription);
    data.append("applicationDeadline",     formData.applicationDeadline);
    data.append("deadline",                formData.deliverableDeadline);
    data.append("location",                formData.location);
    data.append("type",                    formData.type);
    data.append("followers",               formData.followers);
    data.append("postStatus",              formData.postStatus.toUpperCase());
    if (mode === "edit") data.append("postId", post?.id ?? "");
    formData.platforms.forEach((p, i) => data.append(`platforms[${i}]`, p));
    if (image) data.append("image", image);

    const url = mode === "edit"
      ? `http://localhost:8080/update/post/${post?.id}`
      : "http://localhost:8080/create/post";

    const res = await fetch(url, { method: "POST", body: data, credentials: "include" });
    if (res.ok) {
      alert(mode === "edit" ? "Post updated successfully" : "Post Created Successfully");
      onClose();
    } else {
      alert(mode === "edit" ? "Failed to update Post" : "Failed to create Post");
    }
  };

  if (!isOpen) return null;

  const selectedComp = compensationTypes.find(c => c.value === formData.compensationType)!;
  const currentLifecycle = LIFECYCLE_OPTIONS.find(o => o.value === formData.postStatus)
    ?? LIFECYCLE_OPTIONS[0];

  return (
    <div className="ccd-overlay">
      <div className="ccd-container">
        {/* ── Header ── */}
        <div className="ccd-header">
          <div className="ccd-header-left">
            <h2 className="ccd-title">{mode === "edit" ? "Edit Post" : "Create Post"}</h2>
            {mode === "edit" && hasInProgress && (
              <span className="ccd-inprogress-notice">
                <AlertTriangle size={12} />
                Some fields locked — application in progress
              </span>
            )}
          </div>
          <button className="ccd-close" onClick={onClose}><X size={22} /></button>
        </div>

        {/* ── Body ── */}
        <div className="ccd-body">

          {/* Post Name */}
          <div className="ccd-field">
            <label className="ccd-label">Post Name <span className="ccd-required">*</span></label>
            <input className="ccd-input" type="text" name="name" value={formData.name}
              onChange={handleInputChange} placeholder="Give your campaign a catchy name" />
          </div>

          {/* Post Type */}
          <div className="ccd-field">
            <label className="ccd-label">
              Post Type <span className="ccd-required">*</span>
              {!isEditable("type") && (
                <span className="ccd-locked-badge"><Lock size={12} /> Locked after creation</span>
              )}
            </label>
            <div className={`ccd-type-grid ${!isEditable("type") ? "ccd-disabled" : ""}`}>
              {campaignTypes.map(({ value, label, icon: Icon }) => (
                <div key={value}
                  className={`ccd-type-card ${formData.type === value ? "ccd-type-selected" : ""} ${!isEditable("type") ? "ccd-no-pointer" : ""}`}
                  onClick={() => handleTypeSelect(value)}>
                  <Icon size={18} /><span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="ccd-field">
            <label className="ccd-label">Description</label>
            <textarea className="ccd-textarea" name="description" value={formData.description}
              onChange={handleInputChange} rows={3}
              placeholder="What is this campaign about? Share context for influencers." />
          </div>

          {/* Deliverables */}
          <div className="ccd-field">
            <label className="ccd-label">
              Deliverables
              {!isEditable("deliverables") && (
                <span className="ccd-locked-badge"><Lock size={12} /> Locked — application in progress</span>
              )}
            </label>
            <textarea
              className={`ccd-textarea ${!isEditable("deliverables") ? "ccd-input-disabled" : ""}`}
              name="deliverables" value={formData.deliverables} onChange={handleInputChange} rows={3}
              placeholder="e.g. 2 Instagram reels, 3 stories, 1 YouTube short"
              disabled={!isEditable("deliverables")} />
          </div>

          {/* Compensation */}
          <div className="ccd-field">
            <label className="ccd-label">
              Compensation Type
              {!isEditable("compensationType") && (
                <span className="ccd-locked-badge"><Lock size={12} /> Locked — application in progress</span>
              )}
            </label>
            <div className={`ccd-comp-tabs ${!isEditable("compensationType") ? "ccd-disabled" : ""}`}>
              {compensationTypes.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button"
                  className={`ccd-comp-tab ${formData.compensationType === value ? "ccd-comp-selected" : ""}`}
                  onClick={() => handleCompensationTypeSelect(value as CompensationType)}
                  disabled={!isEditable("compensationType")}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
            {formData.compensationType === "money" && (
              <div className="ccd-comp-input-wrapper">
                <span className="ccd-currency-prefix">₹</span>
                <input className="ccd-input ccd-input-indent" type="number" name="budget"
                  value={formData.budget} onChange={handleInputChange}
                  placeholder="Enter amount (e.g. 5000)" />
              </div>
            )}
            {formData.compensationType !== "money" && (
              <input
                className={`ccd-input ${!isEditable("compensationDescription") ? "ccd-input-disabled" : ""}`}
                type="text" name="compensationDescription" value={formData.compensationDescription}
                onChange={handleInputChange} placeholder={selectedComp.placeholder}
                disabled={!isEditable("compensationDescription")} />
            )}
          </div>

          {/* Deadlines */}
          <div className="ccd-field">
            <label className="ccd-label">
              <CalendarClock size={15} style={{ display: "inline", marginRight: 4 }} />
              Deadlines
            </label>
            <div className="ccd-date-row">
              <div className="ccd-date-group">
                <span className="ccd-date-sublabel"><CalendarCheck size={14} /> Application Closes</span>
                <input className="ccd-input" type="date" name="applicationDeadline"
                  value={formData.applicationDeadline} onChange={handleInputChange} />
              </div>
              <div className="ccd-date-group">
                <span className="ccd-date-sublabel">
                  <CalendarClock size={14} /> Deliverable Due
                  {!isEditable("deliverableDeadline") && (
                    <span className="ccd-locked-badge" style={{ marginLeft: 6 }}><Lock size={11} /> Locked</span>
                  )}
                </span>
                <input
                  className={`ccd-input ${!isEditable("deliverableDeadline") ? "ccd-input-disabled" : ""}`}
                  type="date" name="deliverableDeadline" value={formData.deliverableDeadline}
                  onChange={handleInputChange} disabled={!isEditable("deliverableDeadline")} />
              </div>
            </div>
          </div>

          {/* Min Followers */}
          <div className="ccd-field">
            <label className="ccd-label">
              Minimum Followers Required
              {!isEditable("followers") && (
                <span className="ccd-locked-badge"><Lock size={12} /> Locked after creation</span>
              )}
            </label>
            <input
              className={`ccd-input ${!isEditable("followers") ? "ccd-input-disabled" : ""}`}
              type="number" name="followers" value={formData.followers}
              onChange={handleInputChange} placeholder="e.g. 10000"
              disabled={!isEditable("followers")} />
          </div>

          {/* Platforms */}
          <div className="ccd-field">
            <label className="ccd-label">
              Platforms
              {!isEditable("platforms") && (
                <span className="ccd-locked-badge"><Lock size={12} /> Locked after creation</span>
              )}
            </label>
            <div className={`ccd-platform-list ${!isEditable("platforms") ? "ccd-disabled" : ""}`}>
              {availablePlatforms.map(platform => (
                <div key={platform}
                  className={`ccd-platform-chip ${formData.platforms.includes(platform) ? "ccd-chip-selected" : ""} ${!isEditable("platforms") ? "ccd-no-pointer" : ""}`}
                  onClick={() => handlePlatformToggle(platform)}>
                  <Globe size={14} /> {platform}
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="ccd-field">
            <label className="ccd-label">Location / Target Region</label>
            <input className="ccd-input" type="text" name="location" value={formData.location}
              onChange={handleInputChange} placeholder="e.g. Mumbai, Pan India, Hyderabad" />
          </div>

       {/* ── Campaign Image ── */}
<div className="ccd-field">
  <label className="ccd-label">Campaign Image</label>

  {existingImage && !image ? (
    /* Has existing image — show preview + change button */
    <div className="ccd-image-preview-wrapper">
      <img
        className="ccd-image-preview"
        src={`data:image/*;base64,${existingImage}`}
        alt="Campaign"
      />
      <label className="ccd-image-change-btn" htmlFor="ccd-image-input">
        <span>Change Image</span>
      </label>
      <input
        id="ccd-image-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </div>
  ) : image ? (
    /* User just picked a new file — show its preview + change option */
    <div className="ccd-image-preview-wrapper">
      <img
        className="ccd-image-preview"
        src={URL.createObjectURL(image)}
        alt="New upload"
      />
      <label className="ccd-image-change-btn" htmlFor="ccd-image-input">
        <span>Change Image</span>
      </label>
      <input
        id="ccd-image-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </div>
  ) : (
    /* No image at all — show dashed upload zone */
    <label className="ccd-file-dropzone" htmlFor="ccd-image-input">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span className="ccd-dropzone-label">Click to upload image</span>
      <span className="ccd-dropzone-sub">PNG, JPG, WEBP up to 10MB</span>
      <input
        id="ccd-image-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </label>
  )}
</div>

           {/* <label>Upload Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} /> */}

          {/* ── Post Lifecycle (edit only) ─────────────────────────────────── */}
          {mode === "edit" && (
            <div className="ccd-field">
              <label className="ccd-label">Post Status</label>

              {/* Current status pill + toggle */}
              <button
                type="button"
                className="ccd-lifecycle-trigger"
                onClick={() => setShowLifecycle(v => !v)}
                style={{ borderColor: currentLifecycle.color }}
              >
                <span className="ccd-lifecycle-dot" style={{ background: currentLifecycle.color }} />
                <span className="ccd-lifecycle-trigger-label">{currentLifecycle.label}</span>
                <ChevronDown size={15} className={`ccd-lifecycle-chevron ${showLifecycle ? 'open' : ''}`} />
              </button>

              {showLifecycle && (
                <div className="ccd-lifecycle-panel">
                  {LIFECYCLE_OPTIONS.map(opt => {
                    const locked = opt.requiresNoInProgress && hasInProgress;
                    const active = formData.postStatus === opt.value;
                    return (
                      <div
                        key={opt.value}
                        className={`ccd-lifecycle-option
                          ${active ? 'ccd-lifecycle-active' : ''}
                          ${locked ? 'ccd-lifecycle-locked' : ''}`}
                        onClick={() => !locked && handleLifecycleSelect(opt.value)}
                      >
                        <span className="ccd-lifecycle-dot" style={{ background: opt.color }} />
                        <div className="ccd-lifecycle-text">
                          <span className="ccd-lifecycle-name">{opt.label}</span>
                          <span className="ccd-lifecycle-desc">{opt.description}</span>
                          {locked && (
                            <span className="ccd-lifecycle-lock-note">
                              <Lock size={11} /> Available only when no application is in-progress
                            </span>
                          )}
                        </div>
                        {active && <span className="ccd-lifecycle-check">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="ccd-footer">
          <button className="ccd-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ccd-btn-submit" onClick={handleSubmit}
            disabled={!formData.name || !formData.type}>
            {mode === "edit" ? "Save Changes" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignDialog;