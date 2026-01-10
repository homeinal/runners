import type { ReactNode, SVGProps } from "react";
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

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  title?: string;
};

const ICONS: Record<IconName, ReactNode> = {
  alarm_on: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9 3L6 6" />
      <path d="M15 3l3 3" />
      <path d="M12 13l3 2" />
    </>
  ),
  app_registration: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6" />
      <polyline points="9 13 11.5 15.5 15.5 11.5" />
    </>
  ),
  arrow_back: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="9 8 5 12 9 16" />
    </>
  ),
  arrow_forward: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="15 8 19 12 15 16" />
    </>
  ),
  calendar_month: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </>
  ),
  calendar_view_week: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="6" y1="13" x2="18" y2="13" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </>
  ),
  campaign: (
    <>
      <path d="M3 11l9-4v10l-9-4z" />
      <path d="M12 8l6-2v12l-6-2z" />
      <path d="M6 14l2 6" />
    </>
  ),
  category: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </>
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9.5" />
    </>
  ),
  chevron_left: <polyline points="15 6 9 12 15 18" />,
  chevron_right: <polyline points="9 6 15 12 9 18" />,
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </>
  ),
  dark_mode: (
    <path
      d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7 7 0 1 0 11 11z"
      fill="currentColor"
      stroke="none"
    />
  ),
  directions_run: (
    <>
      <circle cx="8" cy="5" r="2" />
      <path d="M8 7l2 4 4 1" />
      <path d="M10 11l-4 5" />
      <path d="M12 12l5 2" />
      <path d="M9 16l1 6" />
    </>
  ),
  event_busy: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="13" x2="16" y2="19" />
      <line x1="16" y1="13" x2="8" y2="19" />
    </>
  ),
  event_upcoming: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <polyline points="7 15 10 18 16 12" />
    </>
  ),
  groups: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="9" r="3" />
      <path d="M2 20c1.5-3 4.5-5 8-5" />
      <path d="M12 15c3.5 0 6.5 2 8 5" />
    </>
  ),
  hourglass_empty: (
    <path d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4z" />
  ),
  light_mode: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4" y1="4" x2="6" y2="6" />
      <line x1="18" y1="18" x2="20" y2="20" />
      <line x1="18" y1="6" x2="20" y2="4" />
      <line x1="4" y1="20" x2="6" y2="18" />
    </>
  ),
  local_fire_department: (
    <path d="M12 2c-2 3-1 5-1 5s-3 2-3 6a4 4 0 0 0 8 0c0-4-3-6-3-6s1-2-1-5z" />
  ),
  location_on: (
    <>
      <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  perm_phone_msg: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3.1-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </>
  ),
  schedule: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </>
  ),
  search_off: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="16" y1="16" x2="21" y2="21" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </>
  ),
  sprint: (
    <>
      <circle cx="8" cy="5" r="2" />
      <path d="M8 7l2 4 4 1" />
      <path d="M10 11l-4 5" />
      <path d="M12 12l5 2" />
      <path d="M9 16l1 6" />
    </>
  ),
  stadium: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <path d="M12 9v4l3 2" />
    </>
  ),
  timer_off: (
    <>
      <circle cx="12" cy="13" r="8" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <path d="M12 9v4l3 2" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </>
  ),
};

export function Icon({ name, className, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("inline-block align-middle shrink-0", className)}
      width="1em"
      height="1em"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {ICONS[name]}
    </svg>
  );
}
