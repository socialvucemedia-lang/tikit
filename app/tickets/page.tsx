"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BookingCard } from "@/components/BookingCard";
import { Icon } from "@/components/Icons";
import { currentUser, listBookings } from "@/lib/mock";
import { isPnr } from "@/lib/format";
import type { Booking, User } from "@/lib/types";

type Tab = "upcoming" | "cancelled" | "all";

export default function TicketsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [pnr, setPnr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(currentUser());
    setBookings(listBookings());
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "cancelled") return bookings.filter((b) => b.status === "CANCELLED");
    if (tab === "upcoming") return bookings.filter((b) => b.status !== "CANCELLED");
    return bookings;
  }, [bookings, tab]);

  function openPnr() {
    if (isPnr(pnr.trim())) router.push(`/ticket/${pnr.trim()}`);
  }

  return (
    <AppShell title="My tickets" subtitle={user ? `${user.phone} · ${bookings.length} bookings` : "All your PNRs in one place"} brand>
      <div className="card p-4">
        <label className="label">Check any PNR</label>
        <div className="mt-1 flex gap-2">
          <input
            className="input"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit PNR"
            value={pnr}
            onChange={(e) => setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={(e) => e.key === "Enter" && openPnr()}
          />
          <button className="btn-primary px-4" onClick={openPnr} disabled={!isPnr(pnr.trim())}>
            <Icon name="search" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {(["upcoming", "cancelled", "all"] as Tab[]).map((t) => (
          <button key={t} className={`chip capitalize ${tab === t ? "chip-active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {!ready ? null : !user ? (
          <div className="card p-6 text-center">
            <p className="text-sm font-bold">Log in to see your tickets</p>
            <Link href="/login?next=/tickets" className="btn-primary mt-3 w-full">
              Log in
            </Link>
          </div>
        ) : filtered.length ? (
          filtered.map((b) => <BookingCard key={b.pnr} booking={b} />)
        ) : (
          <div className="card p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon name="ticket" className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-bold">No {tab !== "all" ? tab : ""} tickets yet</p>
            <p className="mt-1 text-xs text-inkmuted">Your first trip is 6 taps away.</p>
            <Link href="/book" className="btn-primary mt-4 w-full">
              Book a ticket
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
