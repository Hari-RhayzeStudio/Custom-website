// client-web/app/components/Icons.tsx
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Fits "Sparkles"
import SearchIconMUI from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync'; // Fits "Loader"
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'; // Fits "PackageOpen"
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ChevronRightIconMUI from '@mui/icons-material/ChevronRight';
import ChevronLeftIconMUI from '@mui/icons-material/ChevronLeft';
import TuneIcon from '@mui/icons-material/Tune'; // Fits "SlidersHorizontal/Filter"
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CheckIconMUI from '@mui/icons-material/Check';

// 1. Standard Icons
// We map MUI icons to your existing export names
export const BellIcon = NotificationsNoneIcon;
export const UserIcon = PersonOutlineIcon;
export const HeartIcon = FavoriteBorderIcon;
export const ArrowRightIcon = ArrowForwardIcon;
export const ArrowLeftIcon = ArrowBackIcon;
export const SparklesIcon = AutoAwesomeIcon;
export const SearchIcon = SearchIconMUI;
export const LoadingIcon = SyncIcon; // Usually typically rotated via CSS/Tailwind in parent
export const MeetIcon = VideocamOutlinedIcon;
export const RequirementsIcon = Inventory2OutlinedIcon;
export const DownloadIcon = FileDownloadOutlinedIcon;
export const ShareIcon = ShareOutlinedIcon;
export const ChevronRightIcon = ChevronRightIconMUI;
export const ChevronLeftIcon = ChevronLeftIconMUI;
export const FilterIcon = TuneIcon; // "Tune" looks like horizontal sliders
export const XIcon = CloseIcon;

// 2. Custom Icons
// We wrap MUI icons to maintain your specific default sizing/styling logic if needed,
// or simply alias them if the behavior matches.

export const EmptyStateIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <SearchOffIcon className={className} />
);

export const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <CheckIconMUI className={className} />
);