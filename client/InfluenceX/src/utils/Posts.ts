export interface Post {
  id: string;
  title: string;
  description: string;
  budget: number;
  followers: number;
  type: string;
  deadline: string;
  imageBase64?: string;
  createdBy: {
    name: string;
    email: string;
    id?: string;
  };
  createdAt: string;
  status: 'open' | 'in-progress' | 'completed';
  hasApplied?: boolean;
  isMyPost?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected';
  isCreatedByMe?: boolean;
  platformsNeeded: string[];
  location: string;
}

export const handleCreateCampaign=()=>{
    alert("Create Campaign Clicked");
}

export interface CreateCampaignDialogProps {
    isOpen: boolean;
    onClose: () => void;
  userId?: number;
  post?: Post | null;
  mode?: "create" | "edit";
}