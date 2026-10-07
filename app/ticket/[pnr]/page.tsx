"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell, StatusPill } from "@/components/AppShell";
import { TicketQr } from "@/components/TicketCard";
import { Icon } from "@/components/Icons";
import { cancelBooking, getBooking } from "@/lib/mock";
import { classLabel, humanDate, rupee } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default function TicketPage() {
  const params = useParams<{ pnr: string }>();
  const pnr = (params?.pnr ?? "").toString();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBooking(getBooking(pnr));
    setReady(true);
  }, [pnr]);

  function download() {
    if (!booking) return;
    const b = booking;
    const lines = [
      "TIKIT E-TICKET",
      "==============",
      `PNR: ${b.pnr}`,
      `Status: ${b.status}`,
      `Train: ${b.trainNo} ${b.trainName}`,
      `Route: ${b.from.name} (${b.from.code}) -> ${b.to.name} (${b.to.code})`,
      `Date: ${humanDate(b.date)}  Departure: ${b.dep}  Arrival: ${b.arr}`,
      `Class: ${b.className} (${b.classCode})`,
      "",
      "Passengers:",
      ...b.passengers.map(
        (p) => `  ${p.name} | ${p.age} | ${p.gender} | ${p.status} | Coach ${p.coach} | Seat ${p.seat}`,
      ),
      "",
      `Fare: ${rupee(b.fare)}  Convenience fee: ${rupee(b.convenienceFee)}  Total: ${rupee(b.total)}`,
      `Paid via UPI: ${b.upiId}`,
      "",
      "Demo prototype - not a real ticket.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tikit-${b.pnr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function cancel() {
    if (!booking) return;
    if (!window.confirm("Cancel this ticket and get a full demo refund?")) return;
    const updated = cancelBooking(booking.pnr);
    if (updated) {
      setBooking({ ...updated });
      setMessage(`Ticket cancelled. ${rupee(updated.total)} refund initiated to ${updated.upiId}.`);
    }
  }

  if (!ready) return null;

  if (!booking) {
    return (
      <AppShell title="Ticket" subtitle={pnr} back="/tickets" showNav={false}>
        <div className="card p-6 text-center">
          <p className="text-sm font-bold">No ticket found for PNR {pnr}</p>
          <p className="mt-1 text-xs text-inkmuted">Check the number, or book a new ticket.</p>
          <Link href="/book" className="btn-primary mt-4 w-full">
            Book a ticket
          </Link>
        </div>
      </AppShell>
    );
  }

  const b = booking;
  const cancelled = b.status === "CANCELLED";

  return (
    <AppShell title="E-Ticket" subtitle={`PNR ${b.pnr}`} back="/tickets" showNav={false}>
      {message ? (
        <p className="mb-3 rounded-xl bg-success-soft px-3 py-2 text-xs font-semibold text-success">{message}</p>
      ) : null}

      <div className="card rise overflow-hidden">
        <div className="bg-gradient-to-b from-primary to-primary-dark px-5 pb-10 pt-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Boarding pass</p>
            <StatusPill status={b.status} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-black">{b.from.code}</p>
              <p className="text-[11px] text-white/75">{b.from.city}</p>
              <p className="mt-1 text-sm font-bold">{b.dep}</p>
            </div>
            <div className="flex flex-col items-center pb-4">
              <Icon name="train" className="h-4 w-4 text-white/70" />
              <span className="mt-1 h-px w-16 bg-white/40" />
              <span className="mt-1 text-[10px] text-white/70">{humanDate(b.date)}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{b.to.code}</p>
              <p className="text-[11px] text-white/75">{b.to.city}</p>
              <p className="mt-1 text-sm font-bold">
                {b.arr}
                {b.arr < b.dep ? " +1d" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="-mt-6 rounded-t-[22px] bg-white px-5 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">
                {b.trainNo} · {b.trainName}
              </p>
              <p className="text-[11px] text-inkmuted">
                {b.className} ({b.classCode}) · {humanDate(b.date)}
              </p>
            </div>
            <span className="pill bg-primary-soft text-primary">{classLabel(b.classCode)}</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.9fr] bg-[#f8faff] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-inkmuted">
              <span>Passenger</span>
              <span>Coach</span>
              <span>Seat</span>
              <span className="text-right">Status</span>
            </div>
            {b.passengers.map((p) => (
              <div key={p.id} className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.9fr] items-center px-3 py-2.5 text-xs">
                <span className="truncate font-semibold">
                  {p.name}
                  <span className="block text-[10px] font-normal text-inkmuted">
                    {p.age} yrs · {p.gender}
                  </span>
                </span>
                <span className="font-bold">{p.coach}</span>
                <span className="font-bold">{p.seat}</span>
                <span className="text-right">
                  <StatusPill status={p.status} />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-inkmuted">Fare</span>
              <span className="font-semibold">{rupee(b.fare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-inkmuted">Convenience fee</span>
              <span className="font-semibold">{rupee(b.convenienceFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Total {cancelled ? "(refunded)" : "paid"}</span>
              <span className="text-primary">{rupee(b.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-inkmuted">Paid via UPI</span>
              <span className="font-semibold">{b.upiId}</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#f8faff] p-3">
            <TicketQr booking={b} />
          </div>

          <p className="mt-3 text-center text-[11px] text-inkmuted">
            {b.channel === "ivr"
              ? "Booked over the phone with the Tikit AI agent"
              : b.channel === "chat"
                ? "Booked via the Tikit chat assistant"
                : "Booked in the Tikit app"}{" "}
            · SMS alert sent
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button className="btn-primary w-full" onClick={download}>
          <Icon name="download" className="h-4 w-4" />
          Download e-ticket
        </button>
        {!cancelled ? (
          <button className="btn-outline w-full text-danger hover:border-danger hover:text-danger" onClick={cancel}>
            <Icon name="x" className="h-4 w-4" />
            Cancel ticket · instant refund
          </button>
        ) : (
          <div className="card p-4 text-center text-xs text-inkmuted">
            Refund of {rupee(b.total)} initiated to {b.upiId}
          </div>
        )}
      </div>
    </AppShell>
  );
}
