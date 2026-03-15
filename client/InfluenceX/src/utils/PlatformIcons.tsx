// PlatformIcons.tsx — shared platform icon map using lucide-react

import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Music,
  Pin,
  Globe,
} from "lucide-react";

//import { FaXTwitter } from "react-icons/fa6"; // lucide doesn't have X logo

export interface PlatformConfig {
  icon: React.ElementType;
  label: string;
  color: string;
  emoji?: string;
}

export const PLATFORM_MAP: Record<string, PlatformConfig> = {
  Instagram: {
    icon: Instagram,
    label: "Instagram",
    color: "#e1306c",
  },
  Facebook: {
    icon: Facebook,
    label: "Facebook",
    color: "#1877f2",
  },
  YouTube: {
    icon: Youtube,
    label: "YouTube",
    color: "#ff0000",
  },
//   "Twitter/X": {
//     icon: FaXTwitter,
//     label: "Twitter/X",
//     color: "#000000",
//   },
  LinkedIn: {
    icon: Linkedin,
    label: "LinkedIn",
    color: "#0a66c2",
  },
  TikTok: {
    icon: Music,
    label: "TikTok",
    color: "#010101",
  },
  Pinterest: {
    icon: Pin,
    label: "Pinterest",
    color: "#e60023",
  },
};

export const getPlatformConfig = (platform: string): PlatformConfig =>
  PLATFORM_MAP[platform] ?? {
    icon: Globe,
    label: platform,
    color: "#6366f1",
  };
