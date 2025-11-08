import React, { useState } from "react";
import {
  X,
  Users,
  Target,
  FileText,
  Megaphone,
  Gift,
  Zap,
  TrendingUp,
  Globe,
} from "lucide-react";
import type { CreateCampaignDialogProps } from "../../utils/Posts";
import "./../css/CreateCampaignDialog.css";

const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    budget: "",
    deadline: "",
    platforms: [] as string[],
    location: "",
  });

  const [image, setImage] = useState<File | null>(null);

  const campaignTypes = [
    { value: "brand-awareness", label: "Brand Awareness", icon: Megaphone },
    { value: "product-launch", label: "Product Launch", icon: Zap },
    { value: "influencer-collab", label: "Influencer Partnership", icon: Users },
    { value: "giveaway", label: "Contest & Giveaway", icon: Gift },
    { value: "performance", label: "Performance Marketing", icon: TrendingUp },
    { value: "content", label: "Content Creation", icon: FileText },
  ];

  const availablePlatforms = [
    "Instagram",
    "Facebook",
    "YouTube",
    "Twitter/X",
    "LinkedIn",
    "TikTok",
    "Pinterest",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: alreadySelected
          ? prev.platforms.filter((p) => p !== platform)
          : [...prev.platforms, platform],
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      alert("Please fill in required fields (Name and Type)");
      return;
    }

    const data = new FormData();
    data.append("userId", userId ? userId.toString() : "");
    data.append("campaignTitle", formData.name);
    data.append("campaignDescription", formData.description);
    data.append("budget", formData.budget);
    data.append("deadline", formData.deadline);
    data.append("location", formData.location);
    data.append("type", formData.type);

    formData.platforms.forEach((p, i) => {
  data.append(`platforms[${i}]`, p);
});

    if (image) data.append("image", image);

    const response = await fetch("http://localhost:8080/create/post", {
      method: "POST",
      body: data, 
    });

    if (response.ok) {
      alert("Campaign Created Successfully");
      onClose();
    } else {
      alert("Failed to create campaign");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h2>Create Campaign</h2>
          <button className="dialog-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="dialog-body scrollable">
          <label>Campaign Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Summer Collection Launch 2024"
          />

          <label>Campaign Type *</label>
          <div className="campaign-types">
            {campaignTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.value;
              return (
                <div
                  key={type.value}
                  className={`type-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleTypeSelect(type.value)}
                >
                  <Icon size={20} />
                  <span>{type.label}</span>
                </div>
              );
            })}
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Briefly describe your campaign..."
          />

          <label>Budget (USD)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            placeholder="Enter budget"
          />

          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
          />

          <label>Platforms</label>
          <div className="platform-list">
            {availablePlatforms.map((platform) => (
              <div
                key={platform}
                className={`platform-chip ${
                  formData.platforms.includes(platform) ? "selected" : ""
                }`}
                onClick={() => handlePlatformToggle(platform)}
              >
                <Globe size={16} /> {platform}
              </div>
            ))}
          </div>

          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., United States, Global"
          />

          <label>Upload Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="dialog-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type}
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignDialog;
