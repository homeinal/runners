import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Activity,
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarRange,
  CalendarX,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Contrast,
  Flame,
  Hourglass,
  Landmark,
  LayoutGrid,
  MapPin,
  Megaphone,
  Menu,
  Moon,
  PersonStanding,
  PhoneCall,
  RefreshCw,
  Search,
  SearchX,
  Sun,
  Timer,
  TimerOff,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName =
  | "alarm_on"
  | "app_registration"
  | "arrow_back"
  | "arrow_forward"
  | "calendar_month"
  | "calendar_view_week"
  | "campaign"
  | "category"
  | "check_circle"
  | "chevron_left"
  | "chevron_right"
  | "contrast"
  | "dark_mode"
  | "directions_run"
  | "event_busy"
  | "event_upcoming"
  | "groups"
  | "hourglass_empty"
  | "light_mode"
  | "local_fire_department"
  | "location_on"
  | "menu"
  | "perm_phone_msg"
  | "refresh"
  | "schedule"
  | "search"
  | "search_off"
  | "sprint"
  | "stadium"
  | "timer"
  | "timer_off";

type IconProps = Omit<LucideProps, "ref"> & {
  name: IconName;
};

const ICONS: Record<IconName, LucideIcon> = {
  alarm_on: AlarmClock,
  app_registration: ClipboardCheck,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  calendar_month: Calendar,
  calendar_view_week: CalendarRange,
  campaign: Megaphone,
  category: LayoutGrid,
  check_circle: CheckCircle,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  contrast: Contrast,
  dark_mode: Moon,
  directions_run: PersonStanding,
  event_busy: CalendarX,
  event_upcoming: CalendarClock,
  groups: Users,
  hourglass_empty: Hourglass,
  light_mode: Sun,
  local_fire_department: Flame,
  location_on: MapPin,
  menu: Menu,
  perm_phone_msg: PhoneCall,
  refresh: RefreshCw,
  schedule: Clock,
  search: Search,
  search_off: SearchX,
  sprint: Activity,
  stadium: Landmark,
  timer: Timer,
  timer_off: TimerOff,
};

export function Icon({ name, className, size = "1em", ...props }: IconProps) {
  const LucideIcon = ICONS[name];
  const hasLabel = props["aria-label"] || props["aria-labelledby"];

  return (
    <LucideIcon
      className={cn("inline-block shrink-0 align-middle", className)}
      size={size}
      aria-hidden={hasLabel ? undefined : true}
      {...props}
    />
  );
}
