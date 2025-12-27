// client-web/app/components/Icons.tsx
import { 
  Bell, 
  User, 
  Heart, 
  ArrowRight, 
  ArrowLeft, // Added for back navigation
  Sparkles, 
  Search,
  Loader2,
  Video, 
  PackageOpen,
  Download,   // Added for image download
  Share2,     // Added for social sharing
  ChevronRight, // Added for recommendation slider
  ChevronLeft   // Added for recommendation slider
} from 'lucide-react';

// 1. Standard Icons (Re-exporting for consistent usage)
export const BellIcon = Bell;
export const UserIcon = User;
export const HeartIcon = Heart;
export const ArrowRightIcon = ArrowRight;
export const ArrowLeftIcon = ArrowLeft;
export const SparklesIcon = Sparkles;
export const SearchIcon = Search;
export const LoadingIcon = Loader2;
export const MeetIcon = Video;
export const RequirementsIcon = PackageOpen;
export const DownloadIcon = Download;
export const ShareIcon = Share2;
export const ChevronRightIcon = ChevronRight;
export const ChevronLeftIcon = ChevronLeft;

// 2. Custom Icons (Extracted SVGs)
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

// 3. Branding Icons (Google Meet)
export const GoogleMeetIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <div className={`relative ${className} mx-auto mb-6`}>
    <img 
      src="/assets/google-meet-icon.png" 
      alt="Google Meet"
      className="object-contain"
    />
  </div>
);