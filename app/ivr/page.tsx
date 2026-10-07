"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import {
  initialIvrState,
  ivrRespond,
  ivrStart,
  type IvrResult,
  type IvrState,
} from "@/lib/ivr";
import { listSms } from "@/lib/mock";
import { classLabel, humanDate, rupee } from "@/lib/format";
import type { Booking } from "@/lib/types";

interface Line {
  id: number;
  who: "agent" | "caller";
  text: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

let lineSeq = 0;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function IvrPage() {
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [state, setState] = useState<IvrState>(initialIvrState());
  const [result, setResult] = useState<IvrResult | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [buffer, setBuffer] = useState("");
  const [speech, setSpeech] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [smsTick, setSmsTick] = useState(0);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started || ended) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, ended]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines]);

  function speak(text: string) {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[₹•]/g, " rupees ").slice(0, 320));
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    } catch {
      // voice output is best-effort
    }
  }

  function pushLine(who: Line["who"], text: string) {
    setLines((l) => [...l, { id: ++lineSeq, who, text }]);
  }

  function applyResult(r: IvrResult) {
    setResult(r);
    pushLine("agent", r.say);
    speak(r.say);
    if (r.booking) setSmsTick((n) => n + 1);
    if (r.end) setEnded(true);
  }

  function startCall() {
    setStarted(true);
    setEnded(false);
    setSeconds(0);
    setLines([]);
    setBuffer("");
    setState(initialIvrState());
    const r = ivrStart();
    setResult(r);
    pushLine("agent", r.say);
    speak(r.say);
  }

  function hangUp() {
    window.speechSynthesis?.cancel();
    setEnded(true);
    setStarted(false);
    setLines([]);
    setBuffer("");
  }

  function submit(input: { digits?: string; speech?: string }) {
    const label = input.digits ? `[Keypad] ${input.digits.split("").join(" ")}` : input.speech ?? "";
    if (!label) return;
    pushLine("caller", label);
    setBuffer("");
    setSpeech("");
    const { state: next, result: r } = ivrRespond(state, input);
    setState(next);
    applyResult(r);
  }

  function pressKey(k: string) {
    const isOption = result?.expect === "digits" && result.options?.some((o) => o.key === k);
    if (isOption) {
      submit({ digits: k });
      return;
    }
    if (result?.expect === "digits" && (k === "#" || k === "*")) {
      if (k === "#") submit({ digits: buffer });
      return;
    }
    if (buffer.length < 12) setBuffer((b) => b + k);
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const w = window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike; SpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setListening(false);
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript ?? "";
        if (text) setSpeech(text);
      };
      rec.onend = () => setListening(false);
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }

  const sms = listSms();
  const booking: Booking | null = result?.booking ?? state.lastBooking ?? null;

  return (
    <AppShell
      title="Call booking"
      subtitle="Feature phones · AI agent · no internet needed"
      back="/home"
      showNav={false}
    >
      <div className="card overflow-hidden bg-ink text-white">
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Icon name="phone" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold">Tikit Helpline</p>
              <p className="text-[11px] text-white/60">1800 123 4567 · toll free</p>
            </div>
          </div>
          <button
            onClick={() => {
              setVoiceOn((v) => !v);
              window.speechSynthesis?.cancel();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Toggle agent voice"
          >
            <Icon name={voiceOn ? "volume" : "volume-off"} className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-4 mb-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-white/75">
            <span className={`h-2 w-2 rounded-full ${started && !ended ? "bg-success animate-pulse" : "bg-white/30"}`} />
            {ended ? "Call ended" : started ? "AI agent · live" : "Ready to dial"}
          </span>
          <span className="text-[11px] font-bold text-white/75">{fmtDuration(seconds)}</span>
        </div>

        <div className="mx-4 mb-3 h-56 space-y-2.5 overflow-y-auto rounded-2xl bg-black/25 p-3">
          {!started && !ended ? (
            <p className="mt-16 text-center text-xs text-white/50">
              Dial the helpline to start.
              <br />
              Our AI agent verifies your IRCTC number, then books by voice or keypad.
            </p>
          ) : null}
          {lines.map((l) => (
            <div key={l.id} className={`flex ${l.who === "caller" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  l.who === "caller" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white/10 text-white/90"
                }`}
              >
                {l.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {result?.options?.length && !ended ? (
          <div className="mx-4 mb-3 flex flex-wrap gap-2">
            {result.options.map((o) => (
              <button
                key={o.key}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20"
                onClick={() => submit({ digits: o.key })}
              >
                {o.key} · {o.label}
              </button>
            ))}
          </div>
        ) : null}

        {started && !ended ? (
          <div className="px-4 pb-4">
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-[11px] text-white/60">
                {result?.expect === "speech" ? "Say something (or type below)" : "Keypad input"}
              </span>
              <span className="font-mono text-sm font-bold tracking-[0.25em] text-white">{buffer || " "}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => pressKey(k)}
                  className="rounded-xl bg-white/10 py-2.5 text-base font-bold text-white transition hover:bg-white/20 active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                className="flex-1 rounded-xl bg-white/10 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                disabled={!buffer}
                onClick={() => submit({ digits: buffer })}
              >
                Send digits
              </button>
              <button
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                onClick={hangUp}
              >
                End call
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={startListening}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  listening ? "bg-danger text-white pulse-ring" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                aria-label="Speak"
              >
                <Icon name="mic" className="h-5 w-5" />
              </button>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
                placeholder="Speak or type, e.g. Pune to Mumbai tomorrow"
                value={speech}
                onChange={(e) => setSpeech(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && speech.trim() && submit({ speech: speech.trim() })}
              />
              <button
                className="rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                disabled={!speech.trim()}
                onClick={() => submit({ speech: speech.trim() })}
              >
                Say
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            <button className="btn-primary w-full" onClick={startCall}>
              <Icon name="phone" className="h-4 w-4" />
              {ended ? "Call again" : "Call 1800 123 4567"}
            </button>
          </div>
        )}
      </div>

      {booking ? (
        <Link href={`/ticket/${booking.pnr}`} className="card mt-4 block p-4 rise">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Booked over the call</p>
            <span className="pill bg-success-soft text-success">SMS sent</span>
          </div>
          <p className="mt-1 text-xs text-inkmuted">
            PNR {booking.pnr} · {booking.trainNo} {booking.trainName} · {booking.from.city} → {booking.to.city} ·{" "}
            {humanDate(booking.date)} · {classLabel(booking.classCode)} · {rupee(booking.total)}
          </p>
          <p className="mt-2 text-[11px] font-bold text-primary">View e-ticket →</p>
        </Link>
      ) : null}

      <div className="card mt-4 p-4">
        <p className="text-sm font-bold">Try these verified numbers</p>
        <div className="mt-2 space-y-1.5 text-xs text-inkmuted">
          <p>
            <span className="font-bold text-ink">98765 43210</span> Dr. Abhay Patil (3 saved passengers)
          </p>
          <p>
            <span className="font-bold text-ink">91234 56780</span> Meera (2 saved passengers)
          </p>
          <p>Any other number can be registered on the call itself (demo).</p>
        </div>
      </div>

      {sms.length ? (
        <div className="card mt-4 p-4" key={smsTick}>
          <p className="flex items-center gap-2 text-sm font-bold">
            <Icon name="chat" className="h-4 w-4 text-primary" />
            SMS inbox (simulated)
          </p>
          <div className="mt-2 space-y-2">
            {sms.slice(0, 3).map((s, i) => (
              <div key={i} className="rounded-xl bg-[#f8faff] p-3">
                <p className="text-[11px] font-bold text-inkmuted">
                  To {s.to} · {new Date(s.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card mt-4 p-4">
        <p className="text-sm font-bold">How the call flow works</p>
        <ol className="mt-2 space-y-2 text-xs leading-relaxed text-inkmuted">
          <li>
            <span className="font-bold text-ink">1. Caller dials</span> the toll-free Tikit number from any feature
            phone no internet, no app.
          </li>
          <li>
            <span className="font-bold text-ink">2. IRCTC verification</span> the AI agent matches the caller&apos;s
            number against the IRCTC-verified database (dummy here).
          </li>
          <li>
            <span className="font-bold text-ink">3. Voice or keypad</span> the agent understands spoken routes like
            “Pune to Mumbai tomorrow” or plain DTMF keypad input.
          </li>
          <li>
            <span className="font-bold text-ink">4. Saved passengers & UPI</span> books for saved passengers and
            charges the linked UPI mandate.
          </li>
          <li>
            <span className="font-bold text-ink">5. PNR by SMS</span> the e-ticket PNR is read out and SMSed
            instantly.
          </li>
        </ol>
      </div>
    </AppShell>
  );
}
