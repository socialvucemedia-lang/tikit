export type Lang = "en" | "hi" | "mr";

export type ClassCode = "1A" | "2A" | "3A" | "SL" | "CC" | "2S";

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  berthPref?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  language: Lang;
  verified: boolean;
  passengers: Passenger[];
  createdAt: number;
}

export interface Station {
  code: string;
  name: string;
  city: string;
}

export interface ClassOption {
  code: ClassCode;
  name: string;
  fare: number;
  seatsLeft: number;
  status: "AVAILABLE" | "WL";
  waitlistNo?: number;
}

export interface TrainResult {
  no: string;
  name: string;
  from: Station;
  to: Station;
  dep: string;
  arr: string;
  nextDay: boolean;
  durMins: number;
  date: string;
  classes: ClassOption[];
  tatkal: boolean;
}

export type BookingStatus = "CNF" | "WL" | "CANCELLED";

export interface BookedPassenger extends Passenger {
  coach: string;
  seat: string;
  status: BookingStatus;
}

export interface Booking {
  pnr: string;
  userId: string;
  trainNo: string;
  trainName: string;
  from: Station;
  to: Station;
  date: string;
  dep: string;
  arr: string;
  classCode: ClassCode;
  className: string;
  passengers: BookedPassenger[];
  fare: number;
  convenienceFee: number;
  total: number;
  status: BookingStatus;
  channel: "app" | "chat" | "ivr";
  upiId: string;
  createdAt: number;
  cancelledAt?: number;
}

export interface ChatMessage {
  role: "bot" | "user";
  text: string;
  at: number;
}

export interface ChatDraft {
  from?: Station;
  to?: Station;
  date?: string;
  count?: number;
  classCode?: ClassCode;
  train?: TrainResult;
  passengerIds?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  state: "idle" | "trains" | "class" | "passengers" | "confirm" | "done";
  draft: ChatDraft;
  pendingTrains: TrainResult[];
  history: ChatMessage[];
  updatedAt: number;
}

export interface IvrSession {
  id: string;
  from: string;
  userId?: string;
  step:
    | "number"
    | "welcome"
    | "menu"
    | "route"
    | "trains"
    | "class"
    | "count"
    | "confirm"
    | "pay"
    | "done";
  draft: ChatDraft;
  pendingTrains: TrainResult[];
  transcript: ChatMessage[];
  updatedAt: number;
}

export interface Metrics {
  startedAt: number;
  requests: number;
  errors: number;
  latencySum: number;
  latencyMax: number;
  bookings: { app: number; chat: number; ivr: number };
  byPath: Record<string, number>;
}
