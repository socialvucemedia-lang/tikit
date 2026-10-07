import type { ClassCode, Station } from "./types";
import { hash, humanDate } from "./format";

export const STATIONS: Station[] = [
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai" },
  { code: "DR", name: "Dadar", city: "Mumbai" },
  { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai" },
  { code: "TNA", name: "Thane", city: "Thane" },
  { code: "KYN", name: "Kalyan Junction", city: "Kalyan" },
  { code: "PUNE", name: "Pune Junction", city: "Pune" },
  { code: "KOP", name: "Kolhapur", city: "Kolhapur" },
  { code: "NK", name: "Nashik Road", city: "Nashik" },
  { code: "NGP", name: "Nagpur Junction", city: "Nagpur" },
  { code: "SUR", name: "Surat", city: "Surat" },
  { code: "BRC", name: "Vadodara Junction", city: "Vadodara" },
  { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad" },
  { code: "MAO", name: "Madgaon Junction", city: "Goa" },
  { code: "NDLS", name: "New Delhi", city: "Delhi" },
  { code: "AGC", name: "Agra Cantt", city: "Agra" },
  { code: "JP", name: "Jaipur Junction", city: "Jaipur" },
  { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur" },
  { code: "BSB", name: "Varanasi Junction", city: "Varanasi" },
  { code: "PNBE", name: "Patna Junction", city: "Patna" },
  { code: "SC", name: "Secunderabad Junction", city: "Hyderabad" },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad" },
  { code: "SBC", name: "KSR Bengaluru City", city: "Bengaluru" },
  { code: "MAS", name: "Chennai Central", city: "Chennai" },
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal" },
  { code: "INDB", name: "Indore Junction", city: "Indore" },
];

const ALIASES: Record<string, string> = {
  bombay: "Mumbai",
  mumbai: "Mumbai",
  pune: "Pune",
  poona: "Pune",
  delhi: "Delhi",
  "new delhi": "Delhi",
  ncr: "Delhi",
  goa: "Goa",
  panaji: "Goa",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  blr: "Bengaluru",
  madras: "Chennai",
  chennai: "Chennai",
  hyderabad: "Hyderabad",
  secunderabad: "Hyderabad",
  vizag: "Visakhapatnam",
  lucknow: "Lucknow",
  jaipur: "Jaipur",
  ahmedabad: "Ahmedabad",
  amdavad: "Ahmedabad",
  surat: "Surat",
  nagpur: "Nagpur",
  nashik: "Nashik",
  varanasi: "Varanasi",
  banaras: "Varanasi",
  kashi: "Varanasi",
  patna: "Patna",
  bhopal: "Bhopal",
  indore: "Indore",
  agra: "Agra",
  kanpur: "Kanpur",
  kolhapur: "Kolhapur",
  thane: "Thane",
  kalyan: "Kalyan",
};

const adhoc = new Map<string, Station>();

export function normalizePlace(q: string): string {
  return q.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

export function resolvePlace(q: string): Station[] {
  if (!q) return [];
  const n = normalizePlace(q);
  if (!n) return [];

  const exactCode = STATIONS.filter((s) => s.code.toLowerCase() === n || s.code.toLowerCase() === q.trim().toLowerCase());
  if (exactCode.length) return exactCode;

  const cityKey = ALIASES[n] ?? q.trim();
  const byAlias = STATIONS.filter((s) => s.city.toLowerCase() === cityKey.toLowerCase());
  if (byAlias.length) return byAlias;

  const byCity = STATIONS.filter((s) => s.city.toLowerCase() === n);
  if (byCity.length) return byCity;

  const byName = STATIONS.filter(
    (s) => s.name.toLowerCase().startsWith(n) || s.name.toLowerCase().includes(` ${n}`),
  );
  if (byName.length) return byName;

  const byPartial = STATIONS.filter((s) => s.city.toLowerCase().startsWith(n) || s.name.toLowerCase().split(" ")[0].startsWith(n));
  if (byPartial.length) return byPartial;

  if (n.length >= 3) {
    const cached = adhoc.get(n);
    if (cached) return [cached];
    const title = q.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    const base = title.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3) || "TKT";
    let code = base;
    let i = 2;
    while (STATIONS.some((s) => s.code === code) || [...adhoc.values()].some((s) => s.code === code)) {
      code = `${base}${i}`;
      i++;
    }
    const st: Station = { code, name: title, city: title };
    adhoc.set(n, st);
    return [st];
  }
  return [];
}

export const ALL_CLASSES: Record<ClassCode, string> = {
  "1A": "AC First Class",
  "2A": "AC 2 Tier",
  "3A": "AC 3 Tier",
  SL: "Sleeper",
  CC: "AC Chair Car",
  "2S": "Second Sitting",
};

interface TrainTemplate {
  no: string;
  name: string;
  from: string;
  to: string;
  dep: string;
  durMins: number;
  tatkal?: boolean;
  fares: Partial<Record<ClassCode, number>>;
}

const T: TrainTemplate[] = [
  { no: "12123", name: "Deccan Queen", from: "CSMT", to: "PUNE", dep: "17:10", durMins: 195, fares: { CC: 310, "2S": 150 } },
  { no: "11007", name: "Deccan Express", from: "CSMT", to: "PUNE", dep: "06:40", durMins: 225, fares: { CC: 290, "2S": 140 } },
  { no: "12127", name: "Intercity Express", from: "CSMT", to: "PUNE", dep: "06:10", durMins: 205, tatkal: true, fares: { CC: 280, "2S": 135, SL: 240 } },
  { no: "12125", name: "Pragati Express", from: "CSMT", to: "PUNE", dep: "15:25", durMins: 210, fares: { CC: 300, "2S": 145 } },
  { no: "12951", name: "Mumbai Rajdhani", from: "CSMT", to: "NDLS", dep: "17:00", durMins: 932, fares: { "1A": 4620, "2A": 2650, "3A": 1890 } },
  { no: "12953", name: "August Kranti Rajdhani", from: "CSMT", to: "NDLS", dep: "17:40", durMins: 975, fares: { "1A": 4520, "2A": 2590, "3A": 1850 } },
  { no: "12137", name: "Punjab Mail", from: "CSMT", to: "NDLS", dep: "19:35", durMins: 1125, tatkal: true, fares: { SL: 785, "3A": 1760, "2A": 2480, "1A": 4210 } },
  { no: "10103", name: "Mandovi Express", from: "CSMT", to: "MAO", dep: "07:10", durMins: 715, fares: { CC: 620, "2S": 320, SL: 410 } },
  { no: "10111", name: "Konkan Kanya Express", from: "CSMT", to: "MAO", dep: "23:05", durMins: 695, tatkal: true, fares: { "2A": 1180, "3A": 860, SL: 410, "2S": 300 } },
  { no: "12105", name: "Vidarbha Express", from: "CSMT", to: "NGP", dep: "19:20", durMins: 695, fares: { "1A": 1980, "2A": 1150, "3A": 820, SL: 450 } },
  { no: "12289", name: "Nagpur Duronto", from: "CSMT", to: "NGP", dep: "20:15", durMins: 645, fares: { "2A": 1310, "3A": 920, SL: 470 } },
  { no: "17057", name: "Devagiri Express", from: "CSMT", to: "SC", dep: "21:10", durMins: 1055, tatkal: true, fares: { SL: 505, "3A": 1120, "2A": 1560 } },
  { no: "12615", name: "Grand Trunk Express", from: "CSMT", to: "MAS", dep: "19:15", durMins: 1675, fares: { "1A": 3120, "2A": 1840, "3A": 1290, SL: 620 } },
  { no: "11301", name: "Udyan Express", from: "CSMT", to: "SBC", dep: "08:10", durMins: 1440, fares: { "2A": 1980, "3A": 1380, SL: 660 } },
  { no: "12702", name: "Hussain Sagar Express", from: "HYB", to: "CSMT", dep: "14:55", durMins: 1020, fares: { "2A": 1520, "3A": 1090, SL: 500 } },
  { no: "12129", name: "Azad Hind Express", from: "PUNE", to: "NGP", dep: "23:30", durMins: 945, tatkal: true, fares: { "2A": 1490, "3A": 1060, SL: 480 } },
  { no: "12163", name: "Dadar Chennai Express", from: "DR", to: "MAS", dep: "18:25", durMins: 1660, fares: { "2A": 1860, "3A": 1300, SL: 625 } },
  { no: "12925", name: "Paschim Express", from: "SUR", to: "NDLS", dep: "20:00", durMins: 1530, fares: { "2A": 1720, "3A": 1210, SL: 590 } },
  { no: "12915", name: "Ashram Express", from: "ADI", to: "NDLS", dep: "05:45", durMins: 1015, tatkal: true, fares: { SL: 545, "3A": 1130, "2A": 1580 } },
  { no: "12002", name: "Bhopal Shatabdi", from: "NDLS", to: "BPL", dep: "06:00", durMins: 480, fares: { CC: 915, "2S": 480 } },
  { no: "12050", name: "Gatimaan Express", from: "NDLS", to: "AGC", dep: "08:10", durMins: 100, fares: { CC: 560, "2S": 300 } },
  { no: "12985", name: "Jaipur Superfast", from: "NDLS", to: "JP", dep: "06:05", durMins: 280, tatkal: true, fares: { CC: 520, "2S": 260, SL: 440 } },
  { no: "12004", name: "Lucknow Shatabdi", from: "NDLS", to: "LKO", dep: "06:10", durMins: 355, fares: { CC: 690, "2S": 360 } },
  { no: "12559", name: "Shiv Ganga Express", from: "NDLS", to: "BSB", dep: "20:00", durMins: 720, fares: { SL: 480, "3A": 980, "2A": 1380 } },
  { no: "12309", name: "Rajendra Nagar Rajdhani", from: "NDLS", to: "PNBE", dep: "20:05", durMins: 800, fares: { "1A": 3450, "2A": 1990, "3A": 1430 } },
  { no: "12621", name: "Tamil Nadu Express", from: "NDLS", to: "MAS", dep: "22:30", durMins: 2070, tatkal: true, fares: { "1A": 4280, "2A": 2460, "3A": 1720, SL: 840 } },
  { no: "12723", name: "Telangana Express", from: "NDLS", to: "SC", dep: "15:55", durMins: 1620, fares: { "2A": 2030, "3A": 1440, SL: 700 } },
  { no: "12627", name: "Karnataka Express", from: "SBC", to: "NDLS", dep: "19:20", durMins: 2475, fares: { "2A": 2280, "3A": 1600, SL: 780 } },
  { no: "12007", name: "Mysuru Shatabdi", from: "MAS", to: "SBC", dep: "06:00", durMins: 300, fares: { CC: 650, "2S": 340 } },
  { no: "12603", name: "Hyderabad Express", from: "MAS", to: "HYB", dep: "14:20", durMins: 840, tatkal: true, fares: { SL: 460, "3A": 930, "2A": 1300 } },
  { no: "12009", name: "Shatabdi Express", from: "CSMT", to: "ADI", dep: "06:25", durMins: 400, fares: { CC: 1045, "2S": 540 } },
  { no: "12487", name: "Seemanchal Express", from: "NDLS", to: "PNBE", dep: "23:55", durMins: 1195, fares: { SL: 560, "3A": 1110, "2A": 1560 } },
];

interface Sched {
  no: string;
  name: string;
  from: Station;
  to: Station;
  dep: string;
  durMins: number;
  tatkal: boolean;
  fares: Partial<Record<ClassCode, number>>;
  generic: boolean;
}

const byCode = new Map(STATIONS.map((s) => [s.code, s]));

function templateToSched(t: TrainTemplate): Sched | null {
  const from = byCode.get(t.from);
  const to = byCode.get(t.to);
  if (!from || !to) return null;
  return { no: t.no, name: t.name, from, to, dep: t.dep, durMins: t.durMins, tatkal: !!t.tatkal, fares: t.fares, generic: false };
}

function reverseSched(t: TrainTemplate): Sched | null {
  const from = byCode.get(t.to);
  const to = byCode.get(t.from);
  if (!from || !to) return null;
  const no = String(parseInt(t.no, 10) + 1);
  return { no, name: t.name, from, to, dep: t.dep, durMins: t.durMins, tatkal: !!t.tatkal, fares: t.fares, generic: false };
}

function genericScheds(from: Station, to: Station): Sched[] {
  const h = hash(`${from.code}-${to.code}`);
  const durs = [300 + (h % 480), 540 + ((h >> 3) % 600), 720 + ((h >> 6) % 540)];
  const deps = ["06:15", "14:30", "21:45"];
  const names = ["Superfast Express", "Jan Shatabdi Express", "Tikit Express"];
  const bases = [320 + (h % 260), 420 + ((h >> 5) % 340), 300 + ((h >> 9) % 240)];
  return deps.map((dep, i) => {
    const no = String(12_000 + ((h + i * 977) % 8_000));
    const base = bases[i];
    return {
      no,
      name: `${names[i]}`,
      from,
      to,
      dep,
      durMins: durs[i],
      tatkal: i === 1,
      fares: {
        SL: base,
        "3A": Math.round(base * 1.55),
        "2A": Math.round(base * 2.1),
        "1A": Math.round(base * 3.3),
        "2S": Math.round(base * 0.55),
      },
      generic: true,
    };
  });
}

export interface ScheduleMatch {
  no: string;
  name: string;
  from: Station;
  to: Station;
  dep: string;
  durMins: number;
  tatkal: boolean;
  fares: Partial<Record<ClassCode, number>>;
}

export function schedulesFor(from: Station[], to: Station[]): ScheduleMatch[] {
  const fromCodes = new Set(from.map((s) => s.code));
  const toCodes = new Set(to.map((s) => s.code));
  const out: ScheduleMatch[] = [];
  for (const t of T) {
    const dirs = [templateToSched(t), reverseSched(t)];
    for (const s of dirs) {
      if (s && fromCodes.has(s.from.code) && toCodes.has(s.to.code) && s.from.code !== s.to.code) {
        out.push(s);
      }
    }
  }
  const seen = new Set(out.map((s) => s.no));
  if (!out.length) {
    for (const f of from.slice(0, 2)) {
      for (const t of to.slice(0, 2)) {
        for (const g of genericScheds(f, t)) {
          if (!seen.has(g.no)) {
            seen.add(g.no);
            out.push(g);
          }
        }
      }
    }
  }
  return out.sort((a, b) => a.dep.localeCompare(b.dep));
}

export function stationByCode(code: string): Station | undefined {
  return byCode.get(code) ?? [...adhoc.values()].find((s) => s.code === code);
}

export function capacityFor(no: string, date: string, cls: ClassCode): number {
  const h = hash(`${no}|${date}|${cls}`);
  if (h % 4 === 0) return 0;
  return 6 + (h % 120);
}

export function baseFare(cls: ClassCode, fares: Partial<Record<ClassCode, number>>): number {
  const direct = fares[cls];
  if (direct) return direct;
  const keys = Object.keys(fares) as ClassCode[];
  const ratios: Record<ClassCode, number> = { "1A": 3.3, "2A": 2.1, "3A": 1.55, SL: 1, CC: 1.15, "2S": 0.55 };
  if (!keys.length) return 300;
  const ref = keys[0];
  const refFare = fares[ref]!;
  const est = Math.round(refFare * (ratios[cls] / ratios[ref]));
  return est;
}

export function fareFor(s: { fares: Partial<Record<ClassCode, number>> }, cls: ClassCode): number {
  return baseFare(cls, s.fares);
}

export function searchLabel(from: Station[], to: Station[], date: string): string {
  const f = from[0];
  const t = to[0];
  if (!f || !t) return "";
  return `${f.city} → ${t.city} · ${humanDate(date)}`;
}
