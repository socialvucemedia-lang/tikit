import type {
  BookedPassenger,
  Booking,
  ClassCode,
  ClassOption,
  Passenger,
  Station,
  TrainResult,
  User,
} from "./types";
import { ALL_CLASSES, capacityFor, fareFor, resolvePlace, schedulesFor, stationByCode } from "./data";
import { addMinutes, humanDate, isValidDateISO } from "./format";

const KEY = "tikit:mock:v3";

interface SmsItem {
  to: string;
  text: string;
  at: number;
}

interface MockState {
  currentUserId: string | null;
  users: Record<string, User>;
  bookings: Record<string, Booking>;
  idempotency: Record<string, string>;
  bookedSeats: Record<string, number>;
  waitlist: Record<string, number>;
  sms: SmsItem[];
  seq: number;
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedUser(name: string, phone: string, rows: Array<[string, number, "M" | "F" | "O"]>): User {
  return {
    id: `u_${phone}`,
    name,
    phone,
    language: "en",
    verified: true,
    passengers: rows.map(([pname, age, gender]) => ({
      id: uid("p"),
      name: pname,
      age,
      gender,
      berthPref: gender === "F" ? "Lower" : "No Preference",
    })),
    createdAt: Date.now(),
  };
}

function seed(): MockState {
  const users: Record<string, User> = {};
  for (const u of [
    seedUser("Dr. Abhay Patil", "9876543210", [
      ["Vedant Chalke", 21, "M"],
      ["Nikunj Chandak", 21, "M"],
      ["Shravani Chalke", 20, "F"],
    ]),
    seedUser("Meera Patil", "9123456780", [
      ["Meera Patil", 34, "F"],
      ["Suresh Patil", 41, "M"],
    ]),
  ]) {
    users[u.id] = u;
  }
  return {
    currentUserId: null,
    users,
    bookings: {},
    idempotency: {},
    bookedSeats: {},
    waitlist: {},
    sms: [],
    seq: 1000,
  };
}

function isBooking(v: unknown): v is Booking {
  if (!v || typeof v !== "object") return false;
  const b = v as Record<string, unknown>;
  return (
    typeof b.pnr === "string" &&
    typeof b.trainNo === "string" &&
    typeof b.trainName === "string" &&
    typeof b.fare === "number" &&
    Number.isFinite(b.fare) &&
    typeof b.convenienceFee === "number" &&
    Number.isFinite(b.convenienceFee) &&
    typeof b.total === "number" &&
    Number.isFinite(b.total) &&
    typeof b.date === "string" &&
    typeof b.status === "string" &&
    Array.isArray(b.passengers) &&
    typeof b.from === "object" &&
    b.from !== null &&
    typeof b.to === "object" &&
    b.to !== null
  );
}

let state: MockState | null = null;

function load(): MockState {
  if (state) return state;
  if (typeof window === "undefined") return (state = seed());
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MockState>;
      if (parsed && parsed.users && parsed.bookings) {
        const bookings: Record<string, Booking> = {};
        for (const [k, v] of Object.entries(parsed.bookings)) {
          if (isBooking(v)) bookings[k] = v;
        }
        state = {
          ...seed(),
          ...parsed,
          users: { ...seed().users, ...parsed.users },
          bookings,
          seq: typeof parsed.seq === "number" ? parsed.seq : 1000,
        };
        return state;
      }
    }
  } catch {
    // fall through to a fresh state
  }
  state = seed();
  return state;
}

function save() {
  if (!state || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full/unavailable mock still works in memory
  }
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const simulateLatency = () => sleep(220 + Math.random() * 380);

export function resetMock() {
  state = seed();
  save();
}

export function currentUser(): User | null {
  const s = load();
  return s.currentUserId ? s.users[s.currentUserId] ?? null : null;
}

export function findUserByPhone(phone: string): User | null {
  const s = load();
  return Object.values(s.users).find((u) => u.phone === phone) ?? null;
}

export function login(phone: string, name?: string, language?: User["language"]): User {
  const s = load();
  const existing = findUserByPhone(phone);
  if (existing) {
    if (name) existing.name = name;
    if (language) existing.language = language;
    existing.verified = true;
    s.currentUserId = existing.id;
    save();
    return existing;
  }
  const user: User = {
    id: uid("u"),
    name: name?.trim() || `Passenger ${phone.slice(-4)}`,
    phone,
    language: language ?? "en",
    verified: true,
    passengers: [],
    createdAt: Date.now(),
  };
  s.users[user.id] = user;
  s.currentUserId = user.id;
  save();
  return user;
}

export function logout() {
  const s = load();
  s.currentUserId = null;
  save();
}

export function updateLanguage(language: User["language"]) {
  const user = currentUser();
  if (!user) return;
  user.language = language;
  save();
}

export function addPassenger(p: Omit<Passenger, "id">): Passenger {
  const user = currentUser();
  const s = load();
  if (!user) throw new Error("Not logged in");
  const passenger: Passenger = { ...p, id: uid("p") };
  s.users[user.id].passengers.push(passenger);
  save();
  return passenger;
}

export function removePassenger(passengerId: string) {
  const user = currentUser();
  const s = load();
  if (!user) return;
  s.users[user.id].passengers = s.users[user.id].passengers.filter((p) => p.id !== passengerId);
  save();
}

export type SearchResult =
  | { ok: true; trains: TrainResult[]; from: Station; to: Station }
  | { ok: false; error: string; from?: Station; to?: Station };

export function searchTrains(fromQuery: string, toQuery: string, date: string, cls?: ClassCode): SearchResult {
  const from = resolvePlace(fromQuery);
  const to = resolvePlace(toQuery);
  if (!from.length) return { ok: false, error: `We couldn't find "${fromQuery}". Try a city like Pune or Mumbai.` };
  if (!to.length) return { ok: false, error: `We couldn't find "${toQuery}". Try a city like Delhi or Goa.` };
  if (from[0].code === to[0].code) return { ok: false, error: "Origin and destination must be different.", from: from[0], to: to[0] };
  if (!isValidDateISO(date)) return { ok: false, error: "Pick a travel date within the next 60 days.", from: from[0], to: to[0] };

  const s = load();
  const scheds = schedulesFor(from, to);
  const trains: TrainResult[] = scheds.map((sc) => {
    const codes = Object.keys(sc.fares) as ClassCode[];
    const ordered = (["1A", "2A", "3A", "CC", "SL", "2S"] as ClassCode[]).filter((c) => codes.includes(c));
    const classOptions: ClassOption[] = ordered
      .filter((c) => !cls || c === cls)
      .map((c) => {
        const key = `${sc.no}|${date}|${c}`;
        const capacity = capacityFor(sc.no, date, c);
        const booked = s.bookedSeats[key] ?? 0;
        const left = Math.max(0, capacity - booked);
        const wl = s.waitlist[key] ?? 0;
        return {
          code: c,
          name: ALL_CLASSES[c],
          fare: fareFor(sc, c),
          seatsLeft: left,
          status: left > 0 ? ("AVAILABLE" as const) : ("WL" as const),
          waitlistNo: left > 0 ? undefined : wl + 1,
        };
      });
    const { time: arr, nextDay } = addMinutes(sc.dep, sc.durMins);
    return {
      no: sc.no,
      name: sc.name,
      from: sc.from,
      to: sc.to,
      dep: sc.dep,
      arr,
      nextDay,
      durMins: sc.durMins,
      date,
      classes: classOptions,
      tatkal: sc.tatkal,
    };
  });
  return { ok: true, trains, from: from[0], to: to[0] };
}

const COACH_PREFIX: Record<ClassCode, string> = { "1A": "H", "2A": "A", "3A": "B", SL: "S", CC: "C", "2S": "D" };

function makePnr(s: MockState): string {
  for (let i = 0; i < 25; i++) {
    const pnr = `4${Math.floor(100000000 + Math.random() * 899999999)}`;
    if (!s.bookings[pnr]) return pnr;
  }
  return `4${String(Date.now()).slice(-9)}`;
}

export interface BookingInput {
  trainNo: string;
  fromCode: string;
  toCode: string;
  date: string;
  classCode: ClassCode;
  passengers: Array<Pick<Passenger, "name" | "age" | "gender" | "berthPref">>;
  channel: Booking["channel"];
  upiId: string;
  clientRequestId?: string;
}

export type BookingResult = { ok: true; booking: Booking; duplicate?: boolean } | { ok: false; error: string };

export function createBooking(input: BookingInput): BookingResult {
  const s = load();
  const user = currentUser();
  if (!user) return { ok: false, error: "Please log in first." };

  if (!user.verified) return { ok: false, error: "Your IRCTC number is not verified yet." };

  if (input.clientRequestId) {
    const existing = s.idempotency[`${user.id}|${input.clientRequestId}`];
    if (existing && s.bookings[existing]) return { ok: true, booking: s.bookings[existing], duplicate: true };
  }

  const from = stationByCode(input.fromCode);
  const to = stationByCode(input.toCode);
  if (!from || !to) return { ok: false, error: "Unknown station. Please search again." };
  if (from.code === to.code) return { ok: false, error: "Origin and destination must differ." };
  if (!isValidDateISO(input.date)) return { ok: false, error: "Please pick a date within the next 60 days." };
  if (!input.passengers.length || input.passengers.length > 6)
    return { ok: false, error: "Select between 1 and 6 passengers." };
  if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(input.upiId))
    return { ok: false, error: "Enter a valid UPI ID (e.g. name@upi)." };

  const sched = schedulesFor([from], [to]).find((sc) => sc.no === input.trainNo);
  if (!sched) return { ok: false, error: "This train doesn't run on the selected route/date." };

  const key = `${sched.no}|${input.date}|${input.classCode}`;
  const capacity = capacityFor(sched.no, input.date, input.classCode);
  const booked = s.bookedSeats[key] ?? 0;
  const left = Math.max(0, capacity - booked);
  const paxCount = input.passengers.length;
  const isCnf = left >= paxCount;
  const waitlistNo = isCnf ? 0 : (s.waitlist[key] ?? 0) + 1;

  const passengers: BookedPassenger[] = input.passengers.map((p, i) => {
    const seatIdx = booked + i;
    const coachNo = Math.floor(seatIdx / 72) + 1;
    const seatNo = (seatIdx % 72) + 1;
    return {
      id: uid("p"),
      name: p.name,
      age: p.age,
      gender: p.gender,
      berthPref: p.berthPref,
      coach: isCnf ? `${COACH_PREFIX[input.classCode]}${coachNo}` : "--",
      seat: isCnf ? `${seatNo}` : `WL${waitlistNo + i}`,
      status: isCnf ? "CNF" : "WL",
    };
  });

  const fare = fareFor(sched, input.classCode) * paxCount;
  const convenienceFee = Math.min(50, 20 + paxCount * 5);
  const { time: arr } = addMinutes(sched.dep, sched.durMins);

  const booking: Booking = {
    pnr: makePnr(s),
    userId: user.id,
    trainNo: sched.no,
    trainName: sched.name,
    from: sched.from,
    to: sched.to,
    date: input.date,
    dep: sched.dep,
    arr,
    classCode: input.classCode,
    className: ALL_CLASSES[input.classCode],
    passengers,
    fare,
    convenienceFee,
    total: fare + convenienceFee,
    status: isCnf ? "CNF" : "WL",
    channel: input.channel,
    upiId: input.upiId,
    createdAt: Date.now(),
  };

  s.bookings[booking.pnr] = booking;
  if (isCnf) s.bookedSeats[key] = booked + paxCount;
  else s.waitlist[key] = waitlistNo + paxCount - 1;
  if (input.clientRequestId) s.idempotency[`${user.id}|${input.clientRequestId}`] = booking.pnr;
  s.seq += 1;
  queueSms(
    user.phone,
    `Tikit: ${booking.status} ${booking.from.code}→${booking.to.code} on ${humanDate(booking.date)} ${booking.dep}. PNR ${booking.pnr}. Total ₹${booking.total}.`,
  );
  save();
  return { ok: true, booking };
}

export function getBooking(pnr: string): Booking | null {
  return load().bookings[pnr.trim().toUpperCase()] ?? null;
}

export function listBookings(): Booking[] {
  const s = load();
  const user = currentUser();
  if (!user) return [];
  return Object.values(s.bookings)
    .filter((b) => b.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function latestBooking(): Booking | null {
  return listBookings()[0] ?? null;
}

export function cancelBooking(pnr: string): Booking | null {
  const s = load();
  const user = currentUser();
  const b = s.bookings[pnr];
  if (!b || !user || b.userId !== user.id || b.status === "CANCELLED") return null;
  if (b.status === "CNF") {
    const key = `${b.trainNo}|${b.date}|${b.classCode}`;
    s.bookedSeats[key] = Math.max(0, (s.bookedSeats[key] ?? 0) - b.passengers.length);
  }
  b.status = "CANCELLED";
  b.cancelledAt = Date.now();
  queueSms(user.phone, `Tikit: PNR ${b.pnr} cancelled. Full refund of ₹${b.total} initiated to ${b.upiId}.`);
  save();
  return b;
}

export function queueSms(to: string, text: string) {
  const s = load();
  s.sms.unshift({ to, text, at: Date.now() });
  while (s.sms.length > 40) s.sms.pop();
  save();
}

export function listSms(): SmsItem[] {
  return load().sms;
}

export function recentBookingForPhone(phone: string): Booking | null {
  const s = load();
  const user = findUserByPhone(phone);
  if (!user) return null;
  return (
    Object.values(s.bookings)
      .filter((b) => b.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
  );
}
