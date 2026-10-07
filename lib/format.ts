import type { ClassCode } from "./types";

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayISO(): string {
  const d = new Date();
  return isoOf(d);
}

export function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return isoOf(dt);
}

export function isValidDateISO(s: string | undefined | null): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
  const t = todayISO();
  const max = addDaysISO(t, 60);
  return s >= t && s <= max;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function humanDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const today = todayISO();
  if (iso === today) return `Today, ${d} ${MONTHS[m - 1]}`;
  if (iso === addDaysISO(today, 1)) return `Tomorrow, ${d} ${MONTHS[m - 1]}`;
  return `${DAYS[dt.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

export function firstName(name: string): string {
  const cleaned = name.replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "").trim();
  return cleaned.split(" ")[0] || name;
}

export function rupee(n: number | null | undefined): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "₹0";
  return `₹${v.toLocaleString("en-IN")}`;
}

export function durText(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function addMinutes(hhmm: string, mins: number): { time: string; nextDay: boolean } {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const day = Math.floor(total / 1440);
  const rem = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(rem / 60)).padStart(2, "0");
  const mm = String(rem % 60).padStart(2, "0");
  return { time: `${hh}:${mm}`, nextDay: day > 0 };
}

export function classLabel(code: ClassCode): string {
  const map: Record<ClassCode, string> = {
    "1A": "AC First",
    "2A": "AC 2 Tier",
    "3A": "AC 3 Tier",
    SL: "Sleeper",
    CC: "Chair Car",
    "2S": "Second Sitting",
  };
  return map[code];
}

export function isPnr(s: string): boolean {
  return /^4\d{9}$/.test(s);
}
