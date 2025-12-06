export interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  minFollowers: number;
  category: string;
  deadline: string;
  imageBase64?: string;
  authorName: string;
  createdAt: string;
  status: 'open' | 'in-progress' | 'completed';
  hasApplied?: boolean;
  isMyPost?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected';
}

export const handleCreateCampaign=()=>{
    alert("Create Campaign Clicked");
}

export interface CreateCampaignDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: number;
}