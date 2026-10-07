import { STATIONS, resolvePlace } from "./data";
import type { ClassCode, Station } from "./types";
import { addDaysISO, hash, isoOf, todayISO } from "./format";

export interface ParsedJourney {
  fromQ?: string;
  toQ?: string;
  date?: string;
  count?: number;
  classCode?: ClassCode;
  pnr?: string;
  upiId?: string;
  phone?: string;
}

export type Intent = "book" | "status" | "cancel" | "greet" | "help" | "unknown";

const ALIASES: Record<string, string> = {
  bombay: "Mumbai",
  mumbai: "Mumbai",
  pune: "Pune",
  delhi: "Delhi",
  goa: "Goa",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  madras: "Chennai",
  chennai: "Chennai",
  hyderabad: "Hyderabad",
  lucknow: "Lucknow",
  jaipur: "Jaipur",
  ahmedabad: "Ahmedabad",
  surat: "Surat",
  nagpur: "Nagpur",
  nashik: "Nashik",
  varanasi: "Varanasi",
  banaras: "Varanasi",
  patna: "Patna",
  bhopal: "Bhopal",
  indore: "Indore",
  agra: "Agra",
  kanpur: "Kanpur",
  kolhapur: "Kolhapur",
  thane: "Thane",
};

const KEYWORDS: string[] = (() => {
  const set = new Set<string>();
  for (const s of STATIONS) {
    set.add(s.code.toLowerCase());
    for (const w of s.city.toLowerCase().split(" ")) if (w.length >= 3) set.add(w);
    for (const w of s.name.toLowerCase().split(" ")) if (w.length >= 4) set.add(w);
  }
  for (const k of Object.keys(ALIASES)) set.add(k);
  ["pune", "mumbai", "delhi", "goa"].forEach((k) => set.add(k));
  return [...set].sort((a, b) => b.length - a.length);
})();

const resolveCache = new Map<string, Station[]>();
function resolveCached(q: string): Station[] {
  const hit = resolveCache.get(q);
  if (hit) return hit;
  const r = resolvePlace(ALIASES[q] ?? q);
  resolveCache.set(q, r);
  return r;
}

interface Match {
  start: number;
  end: number;
  q: string;
  station: Station;
}

function findMatches(text: string): Match[] {
  const out: Match[] = [];
  const lower = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ")} `;
  for (const kw of KEYWORDS) {
    const needle = ` ${kw} `;
    let idx = lower.indexOf(needle);
    while (idx !== -1) {
      const start = idx + 1;
      const end = start + kw.length;
      const near = out.find((m) => Math.abs(m.start - start) < kw.length && Math.abs(m.end - end) < kw.length);
      if (!near) {
        const station = resolveCached(kw)[0];
        if (station) out.push({ start, end, q: kw, station });
      }
      idx = lower.indexOf(needle, idx + 1);
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function parseDate(text: string): string | undefined {
  const t = text.toLowerCase();
  const today = todayISO();
  if (/\b(today|aaj|ajj)\b/.test(t)) return today;
  if (/\b(tomorrow|kal|udya|agle din)\b/.test(t)) return addDaysISO(today, 1);
  if (/\b(day after|parso|parson)\b/.test(t)) return addDaysISO(today, 2);

  const wd = t.match(new RegExp(`\\b(${WEEKDAYS.join("|")})(s|day)?\\b`));
  if (wd) {
    const target = WEEKDAYS.indexOf(wd[1]);
    if (target >= 0) {
      const [y, m, d] = today.split("-").map(Number);
      const cur = new Date(y, m - 1, d).getDay();
      const diff = (target - cur + 7) % 7;
      return addDaysISO(today, diff);
    }
  }

  const iso = t.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  const dm = t.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (dm) {
    const year = dm[3] ? (dm[3].length === 2 ? `20${dm[3]}` : dm[3]) : today.slice(0, 4);
    const cand = `${year}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`;
    if (cand >= today) return cand;
  }

  const dmName = t.match(/\b(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  const nameDm = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})\b/);
  const day = dmName ? Number(dmName[1]) : nameDm ? Number(nameDm[2]) : null;
  const mon = dmName ? MONTHS.indexOf(dmName[1]) : nameDm ? MONTHS.indexOf(nameDm[1]) : -1;
  if (day && mon >= 0 && day >= 1 && day <= 31) {
    const cand = `${today.slice(0, 4)}-${String(mon + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (cand >= today) return cand;
    return `${today.slice(0, 4) + 1}-${String(mon + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return undefined;
}

function parseCount(text: string): number | undefined {
  const t = text.toLowerCase();
  const patterns = [
    /(\d{1,2})\s*(?:passengers?|people|persons?|tickets?|adults?|seats?|log|jan|bandar|प्रवासी)\b/,
    /\bfor\s+(\d{1,2})\b/,
    /\bwe\s+are\s+(\d{1,2})\b/,
    /(\d{1,2})\s*(?:friends?|colleagues?|guests?|members?)\b/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1) return Math.min(6, n);
    }
  }
  if (/\b(me and my wife|me and my husband|myself and my wife|wife ke saath|husband ke saath)\b/.test(t)) return 2;
  if (/\b(family|parivar)\b/.test(t)) return 4;
  if (/\b(alone|solo|only me|akela)\b/.test(t)) return 1;
  return undefined;
}

function parseClass(text: string): ClassCode | undefined {
  const t = text.toLowerCase();
  if (/\b(1a|first ac|first class|1st ac|प्रथम श्रेणी)\b/.test(t)) return "1A";
  if (/\b(2a|second ac|2 tier|2nd ac|द्वितीय श्रेणी)\b/.test(t)) return "2A";
  if (/\b(3a|third ac|3 tier|3rd ac|थर्ड एसी)\b/.test(t)) return "3A";
  if (/\b(sleeper|sl)\b/.test(t)) return "SL";
  if (/\b(chair car|cc|shatabdi)\b/.test(t)) return "CC";
  if (/\b(second sitting|2s|general|जनरल)\b/.test(t)) return "2S";
  return undefined;
}

export function parseJourney(text: string): ParsedJourney {
  const out: ParsedJourney = {};
  const t = text.toLowerCase();

  const matches = findMatches(text);
  if (matches.length) {
    let fromMatch: Match | undefined;
    let toMatch: Match | undefined;
    for (const m of matches) {
      const before = t.slice(Math.max(0, m.start - 14), m.start);
      if (/\b(from|se|स [से])\s*$/.test(before)) fromMatch = fromMatch ?? m;
      else if (/\b(to|tak|ko|जाना|for)\s*$/.test(before)) toMatch = toMatch ?? m;
    }
    if (fromMatch && !toMatch) toMatch = matches.find((m) => m !== fromMatch && m.start > fromMatch!.start);
    if (toMatch && !fromMatch) fromMatch = matches.find((m) => m !== toMatch && m.start < toMatch!.start);
    if (!fromMatch && !toMatch) {
      const pair = matches.slice(0, 2);
      if (pair.length === 2) {
        fromMatch = pair[0];
        toMatch = pair[1];
      } else {
        const before = t.slice(Math.max(0, matches[0].start - 16), matches[0].start);
        if (/\b(to|tak|ko)\s*$/.test(before)) toMatch = matches[0];
        else fromMatch = matches[0];
      }
    }
    if (fromMatch) out.fromQ = fromMatch.station.city;
    if (toMatch && toMatch !== fromMatch) out.toQ = toMatch.station.city;
  }

  out.date = parseDate(text);
  out.count = parseCount(text);
  out.classCode = parseClass(text);
  const pnr = text.match(/\b(4\d{9})\b/) ?? text.match(/\bpnr\D{0,10}(\d{10})\b/i);
  if (pnr) out.pnr = pnr[1];
  const upi = text.match(/\b[\w.\-]{2,}@[a-zA-Z]{2,}\b/);
  if (upi) out.upiId = upi[0];
  const phone = text.match(/\b[6-9]\d{9}\b/);
  if (phone && !out.pnr) out.phone = phone[0];
  return out;
}

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(cancel|kataar|radd|refund)\b/.test(t)) return "cancel";
  if (/\b(pnr|status|kahan|where is|check)\b/.test(t) && /\b(pnr|status)\b/.test(t)) return "status";
  if (/\b(book|ticket|reserve|travel|jana|jaana|chahiye|chalu)\b/.test(t)) return "book";
  if (/^\s*(hi|hello|hey|namaste|namaskar|hola|salaam)\b/.test(t)) return "greet";
  if (/\b(help|menu|what can|kya kar)\b/.test(t)) return "help";
  return "unknown";
}

export function seededPick<T>(items: T[], seed: string, n: number): T[] {
  const scored = items.map((item) => ({ item, score: hash(`${seed}:${JSON.stringify(item).length}:${String(item)}`) }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, n).map((s) => s.item);
}

export function startOfToday(): string {
  return isoOf(new Date());
}
