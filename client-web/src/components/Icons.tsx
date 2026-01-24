"use client";

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIconMUI from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ChevronRightIconMUI from '@mui/icons-material/ChevronRight';
import ChevronLeftIconMUI from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CheckIconMUI from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UndoIcon from '@mui/icons-material/Undo';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FacebookIconMUI from '@mui/icons-material/Facebook';
import TwitterIconMUI from '@mui/icons-material/Twitter';
import YouTubeIconMUI from '@mui/icons-material/YouTube';
import InstagramIconMUI from '@mui/icons-material/Instagram';
import PinterestIconMUI from '@mui/icons-material/Pinterest';
import PhoneIconMUI from '@mui/icons-material/Phone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIconMUI from '@mui/icons-material/Logout';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

// --- 1. Existing & Standard Icons ---
export const BellIcon = NotificationsNoneIcon;
export const UserIcon = PersonOutlineIcon;
export const ArrowRightIcon = ArrowForwardIcon;
export const SearchIcon = SearchIconMUI;
export const MeetIcon = VideocamOutlinedIcon;
export const RequirementsIcon = Inventory2OutlinedIcon;
export const ShareIcon = ShareOutlinedIcon;
export const ChevronRightIcon = ChevronRightIconMUI;
export const ChevronLeftIcon = ChevronLeftIconMUI;
export const FilterIcon = TuneIcon; 

// --- 2. Requested Icons (Mapped from Lucide) ---
export const LoaderIcon = SyncIcon;
export const PackageOpenIcon = Inventory2OutlinedIcon;
export const CalendarIcon = CalendarTodayIcon;
export const CheckIcon = CheckIconMUI;
export const ArrowLeftIcon = ArrowBackIcon;

export const Undo2Icon = UndoIcon;
export const PencilIcon = EditIcon;
export const DownloadIcon = FileDownloadOutlinedIcon;
export const AlertTriangleIcon = WarningAmberIcon;
export const ChevronDownIcon = ExpandMoreIcon;
export const ChevronUpIcon = ExpandLessIcon;
export const XIcon = CloseIcon;
export const UploadIcon = FileUploadOutlinedIcon;
export const SparklesIcon = AutoAwesomeIcon;
export const CheckCircleIcon = CheckCircleOutlineIcon;
export const SaveIcon = SaveOutlinedIcon;
export const ShoppingBagIcon = ShoppingBagOutlinedIcon;
export const SettingsIcon = SettingsOutlinedIcon;
export const LogoutIcon = LogoutIconMUI;

export const FacebookIcon = FacebookIconMUI;
export const TwitterIcon = TwitterIconMUI;
export const YoutubeIcon = YouTubeIconMUI;
export const InstagramIcon = InstagramIconMUI;
export const PinIcon = PinterestIconMUI;
export const PhoneIcon = PhoneIconMUI;
export const MailIcon = MailOutlineIcon;


// --- 3. Custom/Wrapped Icons ---
export const EmptyStateIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <SearchOffIcon className={className} />
);

export const HeartIcon = FavoriteBorderIcon;       // Outline
export const HeartFilledIcon = FavoriteIcon;       // Filled