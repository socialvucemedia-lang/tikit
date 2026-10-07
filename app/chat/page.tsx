"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell, StatusPill } from "@/components/AppShell";
import { Icon, TikitMark } from "@/components/Icons";
import { TrainCard } from "@/components/TrainCard";
import { chatRespond, initialChatState, type ChatState } from "@/lib/chat";
import { currentUser, login } from "@/lib/mock";
import { classLabel, firstName, humanDate, rupee } from "@/lib/format";
import type { Booking, TrainResult, User } from "@/lib/types";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  trains?: TrainResult[];
  booking?: Booking;
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<ChatState>(initialChatState());
  const [quick, setQuick] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    setReady(true);
    if (u) {
      setMessages([
        {
          id: nextId(),
          role: "bot",
          text: `Namaste ${firstName(u.name)}! I'm the Tikit assistant. I can book a train ticket, check a PNR, or cancel a ticket. Try “Book Mumbai to Goa tomorrow” or tap a suggestion below.`,
        },
      ]);
      setQuick(["Mumbai to Pune today", "Delhi to Jaipur tomorrow", "Check PNR", "Help"]);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean || !user || typing) return;
    setMessages((m) => [...m, { id: nextId(), role: "user", text: clean }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { state: next, result } = chatRespond(state, clean, user);
      setState(next);
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "bot", text: result.reply, trains: result.trains, booking: result.booking },
      ]);
      setQuick(result.quickReplies);
      setTyping(false);
    }, 550);
  }

  function demoLogin() {
    const u = login("9876543210", "Dr. Abhay Patil");
    setUser(u);
    setMessages([
      {
        id: nextId(),
        role: "bot",
        text: `Namaste ${firstName(u.name)}! I'm the Tikit assistant. I can book a train ticket, check a PNR, or cancel a ticket. Where would you like to travel?`,
      },
    ]);
    setQuick(["Mumbai to Pune today", "Delhi to Jaipur tomorrow", "Check PNR", "Help"]);
  }

  return (
    <AppShell
      title="Tikit Assistant"
      subtitle={user ? "Chat booking · saved passengers · UPI" : "Log in to chat-book"}
      back="/home"
      showNav={false}
      right={
        user ? (
          <button
            onClick={() => {
              setMessages([
                { id: nextId(), role: "bot", text: "Fresh start! Where would you like to travel?" },
              ]);
              setState(initialChatState());
              setQuick(["Mumbai to Pune today", "Check PNR", "Help"]);
            }}
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            New chat
          </button>
        ) : null
      }
    >
      {!ready ? null : !user ? (
        <div className="card p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <TikitMark className="h-8 w-8" />
          </span>
          <p className="mt-3 text-sm font-bold">Log in to book by chat</p>
          <p className="mt-1 text-xs text-inkmuted">
            The assistant uses your saved passengers and IRCTC-verified number. Demo login works instantly.
          </p>
          <button className="btn-primary mt-4 w-full" onClick={demoLogin}>
            Continue with demo account
          </button>
          <Link href="/login?next=/chat" className="btn-outline mt-2 w-full">
            Use another number
          </Link>
        </div>
      ) : (
        <>
          <div className="flex min-h-[52vh] flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] ${m.role === "user" ? "order-1" : ""}`}>
                  {m.role === "bot" ? (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-inkmuted">
                      <TikitMark className="h-4 w-4 text-primary" />
                      Tikit AI
                    </div>
                  ) : null}
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-line bg-white text-ink"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.trains?.length ? (
                    <div className="mt-2 space-y-2">
                      {m.trains.map((t, i) => (
                        <TrainCard key={t.no} train={t} onPick={() => send(`Option ${i + 1}`)} />
                      ))}
                    </div>
                  ) : null}

                  {m.booking ? (
                    <Link href={`/ticket/${m.booking.pnr}`} className="card mt-2 block p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">
                          {m.booking.from.city} → {m.booking.to.city}
                        </span>
                        <StatusPill status={m.booking.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-inkmuted">
                        PNR {m.booking.pnr} · {classLabel(m.booking.classCode)} · {humanDate(m.booking.date)} ·{" "}
                        {rupee(m.booking.total)}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-primary">View e-ticket →</p>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}

            {typing ? (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 w-fit">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {quick.length ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quick.map((q) => (
                <button key={q} className="chip shrink-0" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          ) : null}

          <div className="sticky bottom-0 mt-3 flex items-center gap-2 bg-page pt-2">
            <input
              className="input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <button
              className="btn-primary h-12 w-12 shrink-0 rounded-full p-0"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              <Icon name="arrow-right" className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
