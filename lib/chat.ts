import type { Booking, ClassCode, TrainResult, User } from "./types";
import { cancelBooking, createBooking, getBooking, searchTrains } from "./mock";
import { detectIntent, parseJourney } from "./nlu";
import { classLabel, firstName, humanDate, rupee } from "./format";

export interface ChatState {
  stage: "idle" | "trains" | "class" | "passengers" | "confirm" | "done";
  fromQ?: string;
  toQ?: string;
  date?: string;
  count?: number;
  classCode?: ClassCode;
  trains: TrainResult[];
  selected?: TrainResult;
  passengerIds: string[];
  upiId?: string;
}

export function initialChatState(): ChatState {
  return { stage: "idle", trains: [], passengerIds: [] };
}

export interface ChatResult {
  reply: string;
  quickReplies: string[];
  trains?: TrainResult[];
  booking?: Booking;
}

const DEFAULT_UPI = "tikit@upi";

function askNext(state: ChatState): ChatResult {
  if (!state.fromQ) {
    return {
      reply: "Where are you travelling from? You can type a city like Mumbai or Pune.",
      quickReplies: ["Mumbai", "Pune", "Delhi", "Bengaluru"],
    };
  }
  if (!state.toQ) {
    return {
      reply: `Going from ${state.fromQ}. Where to?`,
      quickReplies: ["Pune", "Goa", "Delhi", "Hyderabad"],
    };
  }
  if (!state.date) {
    return {
      reply: "Which date would you like to travel?",
      quickReplies: ["Today", "Tomorrow", "Day after tomorrow"],
    };
  }
  return runSearch(state);
}

function runSearch(state: ChatState): ChatResult {
  const res = searchTrains(state.fromQ!, state.toQ!, state.date!, state.classCode);
  if (!res.ok) {
    return {
      reply: `${res.error} Let's try again where are you travelling from?`,
      quickReplies: ["Mumbai", "Pune", "Delhi"],
    };
  }
  if (!res.trains.length) {
    return { reply: "No trains found for that route on that date. Try another date.", quickReplies: ["Tomorrow", "Day after tomorrow"] };
  }
  const list = res.trains.slice(0, 4);
  state.trains = list;
  state.stage = "trains";
  const lines = list
    .map(
      (t, i) =>
        `${i + 1}. ${t.no} ${t.name} departs ${t.dep}, reaches ${t.arr}${t.nextDay ? " (+1 day)" : ""}`,
    )
    .join("\n");
  return {
    reply: `I found ${list.length} trains from ${res.from.city} to ${res.to.city} on ${humanDate(state.date!)}:\n\n${lines}\n\nWhich one should I book? Tap a number or type the train number.`,
    quickReplies: list.map((_, i) => `Option ${i + 1}`),
    trains: list,
  };
}

function chooseTrain(state: ChatState, text: string): ChatResult {
  const t = text.toLowerCase();
  let idx = -1;
  const digit = t.match(/\b([1-9])\b/);
  if (digit) idx = Number(digit[1]) - 1;
  if (idx < 0 || idx >= state.trains.length) {
    idx = state.trains.findIndex((tr) => t.includes(tr.no) || t.includes(tr.name.toLowerCase()));
  }
  if (idx < 0 || idx >= state.trains.length) {
    return {
      reply: "I didn't catch that. Which train number should I book?",
      quickReplies: state.trains.map((_, i) => `Option ${i + 1}`),
      trains: state.trains,
    };
  }
  const train = state.trains[idx];
  state.selected = train;
  if (train.classes.length === 1) {
    state.classCode = train.classes[0].code;
    return askPassengers(state);
  }
  state.stage = "class";
  const lines = train.classes
    .map((c) => `${c.code === "SL" ? "Sleeper" : c.name} (${c.code}) ${rupee(c.fare)} ${c.status === "AVAILABLE" ? `${c.seatsLeft} seats left` : `WL ${c.waitlistNo}`}`)
    .join("\n");
  return {
    reply: `Got it ${train.no} ${train.name}.\n\n${lines}\n\nWhich class should I book?`,
    quickReplies: train.classes.map((c) => classLabel(c.code)),
  };
}

function chooseClass(state: ChatState, text: string): ChatResult {
  const t = text.toLowerCase();
  const train = state.selected!;
  let idx = -1;
  const digit = t.match(/\b([1-6])\b/);
  if (digit) idx = Number(digit[1]) - 1;
  if (idx < 0 || idx >= train.classes.length) {
    idx = train.classes.findIndex((c) => t.includes(c.code.toLowerCase()) || t.includes(classLabel(c.code).toLowerCase()));
  }
  if (idx < 0 || idx >= train.classes.length) {
    return { reply: "Please pick a class from the list.", quickReplies: train.classes.map((c) => classLabel(c.code)) };
  }
  state.classCode = train.classes[idx].code;
  return askPassengers(state);
}

function askPassengers(state: ChatState): ChatResult {
  state.stage = "passengers";
  return {
    reply: "Who is travelling? Tap a saved passenger, or say “just me”.",
    quickReplies: ["Just me", "Use saved passengers"],
  };
}

function choosePassengers(state: ChatState, text: string, user: User): ChatResult {
  const t = text.toLowerCase();
  const selected = state.selected!;
  const cls = selected.classes.find((c) => c.code === state.classCode)!;
  let count = state.count ?? 1;
  let names: string[] = [];

  if (t.includes("saved") || t.includes("all")) {
    count = Math.min(user.passengers.length || 1, 6);
  } else if (t.includes("just me") || t.includes("me")) {
    count = 1;
  } else {
    const num = t.match(/\b([1-6])\b/);
    if (num) count = Number(num[1]);
  }
  if (state.count) count = state.count;

  if (user.passengers.length >= count && count > 0) {
    names = user.passengers.slice(0, count).map((p) => p.name);
  } else if (user.passengers.length) {
    names = user.passengers.map((p) => p.name);
  } else {
    names = [user.name];
  }
  state.passengerIds = names;
  state.stage = "confirm";
  const total = cls.fare * names.length;
  return {
    reply: `Booking summary:\n${selected.no} ${selected.name}\n${selected.from.city} → ${selected.to.city} · ${humanDate(state.date!)}\nClass: ${classLabel(state.classCode!)}\nPassengers: ${names.join(", ")}\nFare: ${rupee(total)} + ₹${Math.min(50, 20 + names.length * 5)} convenience fee\n\nShall I pay with UPI?`,
    quickReplies: ["Pay with UPI", "Change train", "Cancel"],
  };
}

function pay(state: ChatState, user: User): ChatResult {
  const train = state.selected!;
  const saved = user.passengers;
  const passengers = state.passengerIds.map((name) => {
    const match = saved.find((p) => p.name === name);
    return match
      ? { name: match.name, age: match.age, gender: match.gender, berthPref: match.berthPref }
      : { name, age: 30, gender: "O" as const, berthPref: "No Preference" };
  });
  const result = createBooking({
    trainNo: train.no,
    fromCode: train.from.code,
    toCode: train.to.code,
    date: state.date!,
    classCode: state.classCode!,
    passengers,
    channel: "chat",
    upiId: state.upiId ?? DEFAULT_UPI,
    clientRequestId: `chat-${train.no}-${state.date}-${user.id}`,
  });
  if (!result.ok) {
    return { reply: `Payment could not be completed: ${result.error}`, quickReplies: ["Try again", "Cancel"] };
  }
  state.stage = "done";
  const b = result.booking;
  return {
    reply: `Payment successful. Your ticket is confirmed!\n\nPNR: ${b.pnr}\n${b.trainNo} ${b.trainName}\n${b.from.code} → ${b.to.code} · ${humanDate(b.date)} · ${b.dep}\nCoach ${b.passengers[0]?.coach}, seat ${b.passengers[0]?.seat} (${b.className})\nTotal paid: ${rupee(b.total)}\n\nI've SMSed the e-ticket to ${user.phone}.`,
    quickReplies: ["Book another ticket", "Check PNR"],
    booking: b,
  };
}

export function chatRespond(
  state: ChatState,
  text: string,
  user: User,
): { state: ChatState; result: ChatResult } {
  const clean = text.trim();
  const intent = detectIntent(clean);
  const parsed = parseJourney(clean);

  if (intent === "cancel" && parsed.pnr) {
    const b = getBooking(parsed.pnr);
    if (!b) return { state, result: { reply: `I couldn't find PNR ${parsed.pnr}.`, quickReplies: ["Book a ticket", "Help"] } };
    if (b.userId !== user.id)
      return { state, result: { reply: `PNR ${parsed.pnr} is not linked to your account.`, quickReplies: ["Help"] } };
    if (b.status === "CANCELLED")
      return { state, result: { reply: `PNR ${b.pnr} is already cancelled.`, quickReplies: ["Book a ticket"] } };
    cancelBooking(b.pnr);
    return {
      state: { ...state, stage: "idle" },
      result: { reply: `PNR ${b.pnr} cancelled. ₹${b.total} will be refunded to ${b.upiId} within 2 days.`, quickReplies: ["Book a ticket"] },
    };
  }

  if ((intent === "status" || parsed.pnr) && parsed.pnr) {
    const b = getBooking(parsed.pnr);
    if (!b) return { state, result: { reply: `I couldn't find PNR ${parsed.pnr}.`, quickReplies: ["Book a ticket", "Help"] } };
    const pax = b.passengers.map((p) => `${p.name}: ${p.status}${p.status === "CNF" ? ` (${p.coach}/${p.seat})` : ""}`).join("\n");
    return {
      state: { ...state, stage: "idle" },
      result: {
        reply: `PNR ${b.pnr} ${b.status}\n${b.trainNo} ${b.trainName}\n${b.from.city} → ${b.to.city} · ${humanDate(b.date)} · departs ${b.dep}\n${pax}`,
        quickReplies: ["Book a ticket", "Cancel this ticket"],
      },
    };
  }

  if (intent === "greet" && state.stage === "idle") {
    return {
      state,
      result: {
        reply: `Namaste ${firstName(user.name)}! I can book a train ticket for you in a few messages, check a PNR, or cancel a ticket. Where would you like to travel?`,
        quickReplies: ["Book Mumbai to Pune", "Check PNR", "Help"],
      },
    };
  }

  if (intent === "help") {
    return {
      state,
      result: {
        reply: "I can:\n1. Book a ticket tell me route and date (e.g. “Mumbai to Goa tomorrow”)\n2. Check PNR type your 10-digit PNR\n3. Cancel a ticket “cancel PNR 4xxxxxxxxx”\n4. Use your saved passengers and one-tap UPI.",
        quickReplies: ["Book a ticket", "Check PNR"],
      },
    };
  }

  const next: ChatState = { ...state };

  if (state.stage === "trains") {
    return { state: next, result: chooseTrain(next, clean) };
  }
  if (state.stage === "class") {
    return { state: next, result: chooseClass(next, clean) };
  }
  if (state.stage === "passengers") {
    return { state: next, result: choosePassengers(next, clean, user) };
  }
  if (state.stage === "confirm") {
    const t = clean.toLowerCase();
    if (parsed.upiId) next.upiId = parsed.upiId;
    if (/\b(pay|upi|yes|confirm|ok|proceed|book)\b/.test(t) || t === "1") {
      return { state: next, result: pay(next, user) };
    }
    if (/\b(change|cancel|no)\b/.test(t)) {
      return { state: initialChatState(), result: { reply: "No problem. Where would you like to travel?", quickReplies: ["Mumbai to Pune", "Delhi to Jaipur"] } };
    }
    return { state: next, result: { reply: "Say “pay” to confirm the UPI payment.", quickReplies: ["Pay with UPI", "Cancel"] } };
  }

  if (state.stage === "done") {
    if (clean.toLowerCase().includes("book")) {
      return { state: initialChatState(), result: askNext(initialChatState()) };
    }
  }

  if (parsed.fromQ) next.fromQ = parsed.fromQ;
  if (parsed.toQ) next.toQ = parsed.toQ;
  if (parsed.date) next.date = parsed.date;
  if (parsed.count) next.count = parsed.count;
  if (parsed.classCode) next.classCode = parsed.classCode;
  if (parsed.upiId) next.upiId = parsed.upiId;

  if (next.fromQ && next.toQ && next.date) {
    return { state: next, result: runSearch(next) };
  }
  if (next.fromQ || next.toQ || next.date) {
    return { state: next, result: askNext(next) };
  }

  return {
    state: next,
    result: {
      reply: "Tell me where you want to go, for example “Book Pune to Mumbai tomorrow”.",
      quickReplies: ["Mumbai to Pune today", "Delhi to Jaipur tomorrow", "Help"],
    },
  };
}
