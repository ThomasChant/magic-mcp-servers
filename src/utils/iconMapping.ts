import {
  Database,
  Code,
  Cloud,
  Briefcase,
  Brain,
  MessageCircle,
  FileText,
  DollarSign,
  Wrench,
  Layers,
  Folder,
  Search,
  BarChart3,
  Plug,
  CheckSquare,
  Shield,
  Star,
  Globe,
  Settings,
  Wifi,
  Image,
  CreditCard,
  Monitor,
  Palette,
  Activity,
  Link2,
  type LucideIcon,
} from "lucide-react";

// Map icon string names to Lucide icon components
export const iconMap: Record<string, LucideIcon> = {
  // Core database and storage
  database: Database,
  folder: Folder,
  
  // Development and coding
  code: Code,
  wrench: Wrench,
  tool: Wrench,
  settings: Settings,
  
  // Cloud and infrastructure
  cloud: Cloud,
  layers: Layers,
  
  // Business and productivity
  briefcase: Briefcase,
  
  // AI and intelligence
  brain: Brain,
  
  // Communication
  "message-circle": MessageCircle,
  
  // Content and media
  "file-text": FileText,
  image: Image,
  palette: Palette,
  
  // Finance and payments
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  
  // Web and network
  globe: Globe,
  wifi: Wifi,
  "link-2": Link2,
  
  // Monitoring and analytics
  search: Search,
  "bar-chart": BarChart3,
  activity: Activity,
  monitor: Monitor,
  
  // Security and verification
  shield: Shield,
  "check-square": CheckSquare,
  
  // General utility
  plug: Plug,
  star: Star,
};

export const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Folder; // Default to Folder icon if not found
};