"use client";

import Link from "next/link";
import type { Booking } from "@/lib/types";
import { classLabel, humanDate, rupee } from "@/lib/format";
import { Icon } from "./Icons";
import { StatusPill } from "./AppShell";

export function Barcode({ value, className = "" }: { value: string; className?: string }) {
  const bars: Array<{ w: number; dark: boolean }> = [];
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    bars.push({ w: (code % 3) + 1, dark: true });
    bars.push({ w: (code % 2) + 1, dark: false });
  }
  return (
    <div className={`barcode ${className}`} aria-label={`Barcode ${value}`}>
      {bars.map((b, i) => (
        <span key={i} style={{ width: `${b.w * 2}px`, background: b.dark ? "#0d1b4c" : "transparent" }} />
      ))}
    </div>
  );
}

export function TicketCard({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const b = booking;
  const first = b.passengers[0];
  return (
    <Link
      href={`/ticket/${b.pnr}`}
      className="card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(13,27,76,0.45)]"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold">
              {b.from.city} <span className="text-inkmuted">→</span> {b.to.city}
            </p>
            <StatusPill status={b.status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-inkmuted">
            {b.trainNo} {b.trainName} · {classLabel(b.classCode)}
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
          {b.pnr}
        </span>
      </div>

      <div className="mx-4 border-t border-dashed border-line" />

      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <Icon name="calendar" className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-bold leading-none">{b.dep}</p>
            <p className="mt-1 text-[10px] text-inkmuted">{humanDate(b.date)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-1 text-inkmuted">
          <span className="h-px flex-1 bg-line" />
          <Icon name="train" className="h-3.5 w-3.5" />
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="text-right">
          <p className="text-sm font-bold leading-none">{b.arr}</p>
          <p className="mt-1 text-[10px] text-inkmuted">{b.to.code}</p>
        </div>
      </div>

      {!compact ? (
        <div className="flex items-center justify-between border-t border-line bg-[#f8faff] px-4 py-2.5 text-xs">
          <span className="text-inkmuted">
            {first ? `${first.name}${b.passengers.length > 1 ? ` +${b.passengers.length - 1}` : ""}` : ""}
            {first && first.status === "CNF" ? ` · ${first.coach}/${first.seat}` : ""}
          </span>
          <span className="font-bold text-ink">{rupee(b.total)}</span>
        </div>
      ) : null}
    </Link>
  );
}
