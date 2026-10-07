"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeftIcon,
  ChevronRightIcon,
  LogInIcon,
  PhoneCallIcon,
  SearchIcon,
  SparklesIcon,
  TrainFrontIcon,
  UserRoundIcon,
  WifiOffIcon,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BookingCard } from "@/components/BookingCard";
import { StationCombobox } from "@/components/StationCombobox";
import { DatePicker } from "@/components/DatePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currentUser, listBookings, logout } from "@/lib/mock";
import { addDaysISO, firstName, todayISO } from "@/lib/format";
import type { Booking, User } from "@/lib/types";

const POPULAR: Array<[string, string]> = [
  ["Mumbai", "Pune"],
  ["Mumbai", "Goa"],
  ["Delhi", "Jaipur"],
  ["Mumbai", "Delhi"],
  ["Bengaluru", "Chennai"],
];

const PAX_ITEMS: Record<string, string> = {
  "1": "1 passenger",
  "2": "2 passengers",
  "3": "3 passengers",
  "4": "4 passengers",
  "5": "5 passengers",
  "6": "6 passengers",
};

const CLASS_ITEMS: Record<string, string> = {
  any: "Any class",
  SL: "Sleeper (SL)",
  "3A": "AC 3 Tier (3A)",
  "2A": "AC 2 Tier (2A)",
  "1A": "AC First (1A)",
  CC: "Chair Car (CC)",
  "2S": "Second Sitting (2S)",
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<Booking | null>(null);
  const [ready, setReady] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(todayISO());
  const [pax, setPax] = useState("1");
  const [cls, setCls] = useState("any");

  useEffect(() => {
    setUser(currentUser());
    setActive(listBookings().find((b) => b.status !== "CANCELLED") ?? null);
    setReady(true);
  }, []);

  function search() {
    if (!from.trim() || !to.trim()) return;
    const params = new URLSearchParams({ from: from.trim(), to: to.trim(), date, pax });
    if (cls !== "any") params.set("cls", cls);
    router.push(`/book?${params.toString()}`);
  }

  function goPopular(f: string, t: string) {
    router.push(`/book?${new URLSearchParams({ from: f, to: t, date: todayISO(), pax: "1" })}`);
  }

  function signOut() {
    logout();
    setUser(null);
    setActive(null);
  }

  return (
    <AppShell
      title={ready && user ? `Hi, ${firstName(user.name)}` : "Tikit"}
      subtitle={ready && user ? "Where are you going?" : "Railway booking, simplified"}
      brand
      right={
        ready ? (
          user ? (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white"
              onClick={signOut}
            >
              Sign out
            </Button>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                size: "sm",
                className: "rounded-full bg-white text-primary hover:bg-white/90",
              })}
            >
              Log in
            </Link>
          )
        ) : null
      }
    >
      <Card className="-mt-7 rise">
        <CardContent className="space-y-3">
          <div className="relative">
            <div className="space-y-2 pr-11">
              <label className="sr-only" htmlFor="home-from">
                From
              </label>
              <StationCombobox
                id="home-from"
                value={from}
                onChange={setFrom}
                placeholder="From city or station"
                className="h-12 rounded-xl"
              />
              <label className="sr-only" htmlFor="home-to">
                To
              </label>
              <StationCombobox
                id="home-to"
                value={to}
                onChange={setTo}
                placeholder="To destination"
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label="Swap stations"
            >
              <ArrowRightLeftIcon />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={date === todayISO() ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setDate(todayISO())}
            >
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              variant={date === addDaysISO(todayISO(), 1) ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setDate(addDaysISO(todayISO(), 1))}
            >
              Tomorrow
            </Button>
            <div className="min-w-0 flex-1">
              <DatePicker value={date} onChange={setDate} className="h-9 justify-center text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select items={PAX_ITEMS} value={pax} onValueChange={(v) => setPax(v ?? "1")}>
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAX_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select items={CLASS_ITEMS} value={cls} onValueChange={(v) => setCls(v ?? "any")}>
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLASS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="h-11 w-full rounded-xl text-sm"
            onClick={search}
            disabled={!from.trim() || !to.trim()}
          >
            <SearchIcon />
            Search trains
          </Button>
        </CardContent>
      </Card>

      {!ready ? null : !user ? (
        <Alert className="mt-4">
          <UserRoundIcon />
          <AlertTitle>Log in to book in 6 taps</AlertTitle>
          <AlertDescription>
            Dummy login with any mobile number. Demo OTP: 123456
            <Link
              href="/login"
              className={buttonVariants({ size: "sm", className: "mt-2 w-full" })}
            >
              <LogInIcon />
              Log in
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {active ? (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Active ticket</h2>
            <Link href="/tickets" className="text-xs font-bold text-primary">
              See all
            </Link>
          </div>
          <BookingCard booking={active} />
        </section>
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/chat">
          <Card size="sm" className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
            <CardContent className="space-y-2">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <SparklesIcon className="size-5" />
              </span>
              <p className="text-sm font-bold">Chat &amp; book</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                AI assistant books for you in a few messages
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ivr">
          <Card size="sm" className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
            <CardContent className="space-y-2">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-ink text-white">
                <PhoneCallIcon className="size-5" />
              </span>
              <p className="text-sm font-bold">Call 1800 123</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                No internet? AI agent books on your verified number
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>

      <Card className="mt-4 gap-0 overflow-hidden pt-0">
        <div className="flex items-center gap-3 bg-primary p-4 text-primary-foreground">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <WifiOffIcon className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">Works on feature phones</p>
            <p className="text-[11px] text-white/80">
              Call the Tikit number, our AI agent verifies your IRCTC-linked number and books by voice or keypad.
            </p>
          </div>
        </div>
        <Link href="/ivr" className="flex items-center justify-between px-4 py-3 text-xs font-bold text-primary">
          Try the call demo
          <ChevronRightIcon className="size-4" />
        </Link>
      </Card>

      <section className="mt-5">
        <h2 className="text-[15px] font-bold">Popular routes</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {POPULAR.map(([f, t]) => (
            <Button
              key={`${f}-${t}`}
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => goPopular(f, t)}
            >
              <TrainFrontIcon className="text-primary" />
              {f} → {t}
            </Button>
          ))}
        </div>
      </section>

    </AppShell>
  );
}
