// client-web/app/components/Icons.tsx
import { 
  Bell, 
  User, 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Search,
  Loader2 // Good for loading states
} from 'lucide-react';

// 1. Standard Icons (Re-exporting for consistent usage)
export const BellIcon = Bell;
export const UserIcon = User;
export const HeartIcon = Heart;
export const ArrowRightIcon = ArrowRight;
export const SparklesIcon = Sparkles;
export const SearchIcon = Search;
export const LoadingIcon = Loader2;

// 2. Custom Icons (Extracted SVGs)
// This is the "Empty Box/Magnifying Glass" from your Catalogue page
export const EmptyStateIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  </svg>
);