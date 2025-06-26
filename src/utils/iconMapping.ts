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
  type LucideIcon,
} from "lucide-react";

// Map icon string names to Lucide icon components
export const iconMap: Record<string, LucideIcon> = {
  database: Database,
  code: Code,
  cloud: Cloud,
  briefcase: Briefcase,
  brain: Brain,
  "message-circle": MessageCircle,
  "file-text": FileText,
  "dollar-sign": DollarSign,
  tool: Wrench,
  layers: Layers,
  folder: Folder,
  search: Search,
  "bar-chart": BarChart3,
  plug: Plug,
  "check-square": CheckSquare,
  shield: Shield,
  star: Star,
  wrench: Wrench,
};

export const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Folder; // Default to Folder icon if not found
};