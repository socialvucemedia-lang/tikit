import type { Booking, ClassCode, TrainResult, User } from "./types";
import { createBooking, findUserByPhone, getBooking, login, recentBookingForPhone, searchTrains } from "./mock";
import { parseJourney } from "./nlu";
import { classLabel, humanDate, rupee } from "./format";

export interface IvrState {
  step: "number" | "register" | "menu" | "route" | "trains" | "class" | "count" | "confirm" | "pay" | "done";
  phone: string;
  userId?: string;
  draft: { fromQ?: string; toQ?: string; date?: string; count?: number; classCode?: ClassCode };
  trains: TrainResult[];
  selected?: TrainResult;
  passengerCount: number;
  lastBooking?: Booking;
  ended: boolean;
}

export function initialIvrState(): IvrState {
  return { step: "number", phone: "", draft: {}, trains: [], passengerCount: 1, ended: false };
}

export interface IvrOption {
  key: string;
  label: string;
}

export interface IvrResult {
  say: string;
  expect: "digits" | "speech" | "any";
  options?: IvrOption[];
  booking?: Booking;
  end?: boolean;
}

export function ivrStart(): IvrResult {
  return {
    say: "Welcome to Tikit Railway Booking. This call is assisted by an AI agent. Please enter your 10 digit mobile number registered with IRCTC.",
    expect: "digits",
  };
}

function menu(): IvrResult {
  return {
    say: "Main menu. Press 1 to book a ticket. Press 2 to check PNR status. Press 3 to hear your last ticket. Press 0 to talk to a human agent.",
    expect: "digits",
    options: [
      { key: "1", label: "Book ticket" },
      { key: "2", label: "PNR status" },
      { key: "3", label: "Last ticket" },
      { key: "0", label: "Agent" },
    ],
  };
}

function userFrom(state: IvrState): User | null {
  return state.userId ? findUserByPhone(state.phone) : null;
}

function sayBooking(b: Booking, prefix: string): string {
  const pax = b.passengers.map((p) => `${p.name}, ${p.status}${p.status === "CNF" ? `, coach ${p.coach}, seat ${p.seat}` : ""}`).join(". ");
  return `${prefix} PNR ${b.pnr.split("").join(" ")}. Train ${b.trainNo} ${b.trainName}, from ${b.from.city} to ${b.to.city}, on ${humanDate(b.date)}, departure ${b.dep}. ${pax}. Total fare ${b.total} rupees.`;
}

function askRouteField(state: IvrState): IvrResult {
  state.step = "route";
  if (!state.draft.fromQ)
    return { say: "Which station are you starting from? For example, say Pune.", expect: "speech" };
  if (!state.draft.toQ)
    return { say: `Starting from ${state.draft.fromQ}. Where do you want to go?`, expect: "speech" };
  return { say: "Which date would you like to travel? Say today, tomorrow, or a date like 15 October.", expect: "speech" };
}

function runSearch(state: IvrState): IvrResult {
  const d = state.draft;
  const res = searchTrains(d.fromQ!, d.toQ!, d.date!);
  if (!res.ok || !res.trains.length) {
    state.draft = {};
    return { say: `Sorry, I could not find trains. ${res.ok ? "No trains on this route." : res.error} Let us try again. Which station are you starting from?`, expect: "speech" };
  }
  const list = res.trains.slice(0, 3);
  state.trains = list;
  state.step = "trains";
  const spoken = list.map((t, i) => `Press ${i + 1} for ${t.no} ${t.name}, departing ${t.dep}.`).join(" ");
  return {
    say: `I found ${list.length} trains from ${res.from.city} to ${res.to.city} on ${humanDate(d.date!)}. ${spoken}`,
    expect: "digits",
    options: list.map((t, i) => ({ key: String(i + 1), label: `${t.no} ${t.name} · ${t.dep}` })),
  };
}

function afterTrain(state: IvrState): IvrResult {
  const train = state.selected!;
  if (train.classes.length === 1) {
    state.draft.classCode = train.classes[0].code;
    return askCount(state);
  }
  state.step = "class";
  const spoken = train.classes
    .map((c, i) => `Press ${i + 1} for ${classLabel(c.code)}, fare ${c.fare} rupees, ${c.status === "AVAILABLE" ? `${c.seatsLeft} seats available` : `waitlist ${c.waitlistNo}`}.`)
    .join(" ");
  return {
    say: `Selected ${train.no} ${train.name}. ${spoken}`,
    expect: "digits",
    options: train.classes.map((c, i) => ({ key: String(i + 1), label: `${classLabel(c.code)} · ${rupee(c.fare)}` })),
  };
}

function askCount(state: IvrState): IvrResult {
  state.step = "count";
  const user = userFrom(state);
  const saved = user?.passengers.map((p) => p.name).join(", ");
  return {
    say: `How many passengers? Press a number from 1 to 6.${saved ? ` Your saved passengers are ${saved}.` : ""}`,
    expect: "digits",
    options: ["1", "2", "3", "4"].map((k) => ({ key: k, label: `${k} passenger${k === "1" ? "" : "s"}` })),
  };
}

function askConfirm(state: IvrState): IvrResult {
  const train = state.selected!;
  const cls = train.classes.find((c) => c.code === state.draft.classCode)!;
  const total = cls.fare * state.passengerCount;
  state.step = "confirm";
  return {
    say: `Please confirm. ${state.passengerCount} passenger${state.passengerCount > 1 ? "s" : ""}, ${train.no} ${train.name}, ${train.from.city} to ${train.to.city}, ${humanDate(state.draft.date!)}, ${classLabel(cls.code)}, total ${total + Math.min(50, 20 + state.passengerCount * 5)} rupees including convenience fee. Press 1 to confirm and pay. Press 2 to start over.`,
    expect: "digits",
    options: [
      { key: "1", label: "Confirm & pay" },
      { key: "2", label: "Start over" },
    ],
  };
}

function doPayment(state: IvrState): IvrResult {
  const user = userFrom(state)!;
  const train = state.selected!;
  const cls = train.classes.find((c) => c.code === state.draft.classCode)!;
  const saved = user.passengers;
  const passengers = Array.from({ length: state.passengerCount }).map((_, i) => {
    const p = saved[i];
    return p
      ? { name: p.name, age: p.age, gender: p.gender, berthPref: p.berthPref }
      : { name: i === 0 ? user.name : `Guest ${i + 1}`, age: 30, gender: "O" as const, berthPref: "No Preference" };
  });
  const result = createBooking({
    trainNo: train.no,
    fromCode: train.from.code,
    toCode: train.to.code,
    date: state.draft.date!,
    classCode: cls.code,
    passengers,
    channel: "ivr",
    upiId: `${state.phone}@upi`,
    clientRequestId: `ivr-${train.no}-${state.draft.date}-${state.phone}`,
  });
  if (!result.ok) {
    state.step = "menu";
    return { say: `Payment failed. ${result.error} Returning to main menu.`, expect: "digits", options: menu().options };
  }
  state.lastBooking = result.booking;
  state.step = "done";
  return {
    say: `${sayBooking(result.booking, "Payment successful. Ticket confirmed.")} An SMS with your e-ticket has been sent to ${state.phone}. Press 1 to book another ticket. Press 2 to end the call.`,
    expect: "digits",
    booking: result.booking,
    options: [
      { key: "1", label: "Book another" },
      { key: "2", label: "End call" },
    ],
  };
}

export function ivrRespond(
  state: IvrState,
  input: { digits?: string; speech?: string },
): { state: IvrState; result: IvrResult } {
  const digits = (input.digits ?? "").replace(/\D/g, "").slice(0, 12);
  const speech = (input.speech ?? "").trim();
  const next = { ...state, draft: { ...state.draft } };

  switch (state.step) {
    case "number": {
      const phone = digits.length === 10 ? digits : speech.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return { state: next, result: { say: "That does not look like a valid mobile number. Please enter a 10 digit number.", expect: "digits" } };
      }
      next.phone = phone;
      const user = findUserByPhone(phone);
      if (!user) {
        next.step = "register";
        return {
          state: next,
          result: {
            say: `The number ${phone.split("").join(" ")} is not linked with IRCTC. Press 1 to register this number now, or press 2 to enter a different number.`,
            expect: "digits",
            options: [
              { key: "1", label: "Register this number" },
              { key: "2", label: "Try another number" },
            ],
          },
        };
      }
      next.userId = user.id;
      next.step = "menu";
      return {
        state: next,
        result: {
          say: `Number verified with IRCTC. Welcome ${user.name}. ${menu().say}`,
          expect: "digits",
          options: menu().options,
        },
      };
    }

    case "register": {
      if (digits === "2") {
        next.step = "number";
        next.phone = "";
        return { state: next, result: { say: "Please enter your 10 digit mobile number.", expect: "digits" } };
      }
      if (digits === "1" || digits === "") {
        const user = login(next.phone, `Caller ${next.phone.slice(-4)}`);
        next.userId = user.id;
        next.step = "menu";
        return {
          state: next,
          result: {
            say: `Registration complete. This number is now IRCTC verified for the demo. ${menu().say}`,
            expect: "digits",
            options: menu().options,
          },
        };
      }
      return { state: next, result: { say: "Press 1 to register, or 2 to try another number.", expect: "digits" } };
    }

    case "menu": {
      if (digits === "1") {
        next.step = "route";
        next.draft = {};
        return {
          state: next,
          result: { say: "Let's book a ticket. Tell me your route. For example, say Pune to Mumbai tomorrow.", expect: "speech" },
        };
      }
      if (digits === "2") {
        return {
          state: next,
          result: { say: "Please say or enter your 10 digit PNR number.", expect: "any" },
        };
      }
      if (digits === "3") {
        const b = recentBookingForPhone(next.phone);
        next.step = "done";
        return b
          ? {
              state: next,
              result: {
                say: `${sayBooking(b, "Your last ticket.")} Press 1 to book another ticket. Press 2 to end the call.`,
                expect: "digits",
                booking: b,
                options: [
                  { key: "1", label: "Book another" },
                  { key: "2", label: "End call" },
                ],
              },
            }
          : { state: next, result: { say: `No tickets found for ${next.phone}. ${menu().say}`, expect: "digits", options: menu().options } };
      }
      if (digits === "0") {
        next.step = "done";
        return {
          state: next,
          result: {
            say: "Connecting you to a human agent. Agent Ramesh: Hello, I am taking over this call. I can see your booking screen. This is a demo handover. Press 2 to end the call.",
            expect: "digits",
            options: [{ key: "2", label: "End call" }],
          },
        };
      }
      return { state: next, result: { say: menu().say, expect: "digits", options: menu().options } };
    }

    case "route": {
      if (digits && digits.length === 10) {
        const b = getBooking(digits);
        if (b) {
          next.step = "done";
          return {
            state: next,
            result: { say: sayBooking(b, "PNR found."), expect: "digits", booking: b, options: menu().options },
          };
        }
      }
      const parsed = parseJourney(speech || digits);
      if (parsed.fromQ) next.draft.fromQ = parsed.fromQ;
      if (parsed.toQ) next.draft.toQ = parsed.toQ;
      if (parsed.date) next.draft.date = parsed.date;
      if (parsed.count) next.draft.count = parsed.count;
      if (parsed.classCode) next.draft.classCode = parsed.classCode;

      if (next.draft.fromQ && next.draft.toQ && next.draft.date) {
        return { state: next, result: runSearch(next) };
      }
      return { state: next, result: askRouteField(next) };
    }

    case "trains": {
      const idx = Number(digits) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= state.trains.length) {
        return { state: next, result: { say: "Please press the number of the train you want.", expect: "digits", options: state.trains.map((t, i) => ({ key: String(i + 1), label: `${t.no} ${t.name}` })) } };
      }
      next.selected = state.trains[idx];
      return { state: next, result: afterTrain(next) };
    }

    case "class": {
      const idx = Number(digits) - 1;
      const train = state.selected!;
      if (Number.isNaN(idx) || idx < 0 || idx >= train.classes.length) {
        return { state: next, result: { say: "Please press the number of the class you want.", expect: "digits", options: train.classes.map((c, i) => ({ key: String(i + 1), label: classLabel(c.code) })) } };
      }
      next.draft.classCode = train.classes[idx].code;
      return { state: next, result: askCount(next) };
    }

    case "count": {
      const n = Number(digits);
      if (Number.isNaN(n) || n < 1 || n > 6) {
        return { state: next, result: { say: "Please press a number between 1 and 6.", expect: "digits", options: ["1", "2", "3", "4", "5", "6"].map((k) => ({ key: k, label: k })) } };
      }
      next.passengerCount = n;
      return { state: next, result: askConfirm(next) };
    }

    case "confirm": {
      if (digits === "2") {
        next.step = "menu";
        next.draft = {};
        next.selected = undefined;
        next.trains = [];
        return { state: next, result: { say: `Starting over. ${menu().say}`, expect: "digits", options: menu().options } };
      }
      if (digits === "1") {
        next.step = "pay";
        const train = next.selected!;
        const cls = train.classes.find((c) => c.code === next.draft.classCode)!;
        const total = cls.fare * next.passengerCount + Math.min(50, 20 + next.passengerCount * 5);
        return {
          state: next,
          result: {
            say: `Press 1 to pay ${total} rupees from the UPI account linked to ${next.phone}. Press 2 to cancel.`,
            expect: "digits",
            options: [
              { key: "1", label: "Pay now" },
              { key: "2", label: "Cancel" },
            ],
          },
        };
      }
      return { state: next, result: { say: "Press 1 to confirm, or 2 to start over.", expect: "digits" } };
    }

    case "pay": {
      if (digits === "2") {
        next.step = "menu";
        return { state: next, result: { say: `Payment cancelled. ${menu().say}`, expect: "digits", options: menu().options } };
      }
      if (digits === "1") {
        return { state: next, result: doPayment(next) };
      }
      return { state: next, result: { say: "Press 1 to pay, or 2 to cancel.", expect: "digits" } };
    }

    case "done": {
      if (digits === "2") {
        return { state: { ...next, ended: true }, result: { say: "Thank you for calling Tikit. Happy journey. Goodbye.", expect: "any", end: true } };
      }
      next.step = "menu";
      next.draft = {};
      next.selected = undefined;
      next.trains = [];
      return { state: next, result: { say: menu().say, expect: "digits", options: menu().options } };
    }

    default:
      return { state: next, result: { say: menu().say, expect: "digits", options: menu().options } };
  }
}
