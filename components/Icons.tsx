import type { ReactNode, SVGProps } from "react";

type IconName =
  | "home"
  | "search"
  | "ticket"
  | "chat"
  | "phone"
  | "train"
  | "calendar"
  | "swap"
  | "user"
  | "arrow-right"
  | "arrow-left"
  | "clock"
  | "star"
  | "mic"
  | "volume"
  | "volume-off"
  | "download"
  | "check"
  | "x"
  | "plus"
  | "trash"
  | "sparkles"
  | "shield"
  | "chevron-right"
  | "wifi-off"
  | "refresh"
  | "pin"
  | "call-out";

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5V9Z" />
      <path d="M13 7v10" strokeDasharray="2 3" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />,
  phone: (
    <path d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  ),
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14M9 3v8m6-8v8M8 21l-2 0m10 0 2 0M9 17l-2 4m8-4 2 4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4m8-4v4M3 10h18" />
    </>
  ),
  swap: <path d="M7 4 3 8l4 4M3 8h14a4 4 0 0 1 0 8h-2M17 20l4-4-4-4" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M19 12H5m6 6-6-6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  volume: <path d="M4 10v4h4l5 4V6L8 10H4Zm12.5-2.5a7 7 0 0 1 0 9M19 5a11 11 0 0 1 0 14" />,
  "volume-off": <path d="M4 10v4h4l5 4V6L8 10H4Zm12 1 4 4m0-4-4 4" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />,
  check: <path d="m5 13 4 4L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13M10 11v6m4-6v6" />,
  sparkles: <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3Zm7 10 .9 2.3 2.1.9-2.1.9L19 19.4l-.9-2.3-2.1-.9 2.1-.9L19 13ZM5 14l.7 1.8 1.6.7-1.6.7L5 19l-.7-1.8-1.6-.7 1.6-.7L5 14Z" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-2.5 9 2 2 4-4" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "wifi-off": <path d="M2 8a15 15 0 0 1 6-3.4M22 8a15 15 0 0 0-9.5-3.9M5.5 12.5a10 10 0 0 1 3-1.6m7 1.6a10 10 0 0 0-1.5-1M9 16.5a5 5 0 0 1 5-.6M12 20h.01M3 3l18 18" />,
  refresh: <path d="M20 11a8 8 0 0 0-14-4L4 9m0-5v5h5m-5 4a8 8 0 0 0 14 4l2-2m0 5v-5h-5" />,
  pin: (
    <>
      <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  "call-out": <path d="M15 5h4m0 0v4m0-4-5 5M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />,
};

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.8,
  ...rest
}: { name: IconName; className?: string; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export function TikitMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden="true">
      <rect x="0" y="0" width="320" height="320" rx="76" fill="currentColor" opacity="0.12" />
      <rect x="45" y="95" width="230" height="150" rx="24" fill="currentColor" opacity="0.18" />
      <line x1="160" y1="112" x2="160" y2="228" stroke="currentColor" strokeWidth="6" strokeDasharray="12 12" opacity="0.55" />
      <path d="M 192 172 L 216 196 L 262 142" fill="none" stroke="#FF7A00" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy="95" r="12" fill="currentColor" />
      <circle cx="160" cy="245" r="12" fill="currentColor" />
    </svg>
  );
}
