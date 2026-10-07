"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  CreditCardIcon,
  Loader2Icon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainFrontIcon,
  TriangleAlertIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StationCombobox } from "@/components/StationCombobox";
import { DatePicker } from "@/components/DatePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { addPassenger, createBooking, currentUser, removePassenger, searchTrains } from "@/lib/mock";
import {
  createRazorpayOrder,
  loadRazorpayCheckout,
  openRazorpay,
  verifyRazorpayPayment,
} from "@/lib/razorpay";
import { addDaysISO, classLabel, firstName, humanDate, isValidDateISO, rupee, todayISO } from "@/lib/format";
import type { Booking, ClassCode, Passenger, TrainResult, User } from "@/lib/types";

const STEP_TITLES = ["Route & date", "Pick train & class", "Saved passengers", "One-tap UPI", "Ticket confirmed"];

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

function BookInner() {
  const params = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(0);
  const [taps, setTaps] = useState(0);

  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [date, setDate] = useState(
    params.get("date") && isValidDateISO(params.get("date")!) ? params.get("date")! : todayISO(),
  );
  const [pax, setPax] = useState(Math.min(6, Math.max(1, Number(params.get("pax") ?? 1) || 1)));
  const [cls, setCls] = useState<string>((params.get("cls") as ClassCode) ?? "any");

  const [results, setResults] = useState<TrainResult[] | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainResult | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassCode | null>(null);
  const [selectedPax, setSelectedPax] = useState<string[]>([]);
  const [upiId, setUpiId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [npName, setNpName] = useState("");
  const [npAge, setNpAge] = useState("");
  const [npGender, setNpGender] = useState<"M" | "F" | "O">("M");
  const autoRan = useRef(false);

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    if (u && !upiId) setUpiId(`${firstName(u.name).toLowerCase()}@upi`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    const f = params.get("from");
    const t = params.get("to");
    if (f && t) runSearch(f, t, date, cls === "any" ? undefined : (cls as ClassCode), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fare =
    selectedClass && selectedTrain
      ? (selectedTrain.classes.find((c) => c.code === selectedClass)?.fare ?? 0) * selectedPax.length
      : 0;
  const fee = Math.min(50, 20 + selectedPax.length * 5);
  const nextPath = `/book?${params.toString()}`;
  const selectedClassOption = selectedTrain?.classes.find((c) => c.code === selectedClass);

  function fail(message: string) {
    toast.add({ title: "Could not continue", description: message, type: "error" });
  }

  function runSearch(
    f = from,
    t = to,
    d = date,
    c = cls === "any" ? undefined : (cls as ClassCode),
    countTap = true,
  ) {
    if (!f.trim() || !t.trim()) {
      fail("Please enter both origin and destination.");
      return;
    }
    setBusy(true);
    if (countTap) setTaps((n) => n + 1);
    setTimeout(() => {
      const res = searchTrains(f.trim(), t.trim(), d, c);
      setBusy(false);
      if (!res.ok) {
        fail(res.error);
        return;
      }
      setResults(res.trains);
      setSelectedTrain(null);
      setSelectedClass(null);
      setStep(1);
    }, 450);
  }

  function pickClass(train: TrainResult, code: ClassCode) {
    setSelectedTrain(train);
    setSelectedClass(code);
    setTaps((n) => n + 1);
  }

  function goPassengers() {
    if (!selectedTrain || !selectedClass) return;
    const saved = user?.passengers ?? [];
    setSelectedPax(saved.slice(0, pax).map((p) => p.id));
    setTaps((n) => n + 1);
    setStep(2);
  }

  function togglePax(id: string) {
    setSelectedPax((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 6) return cur;
      return [...cur, id];
    });
  }

  function addNewPassenger() {
    if (!user) return;
    const age = Number(npAge);
    if (!npName.trim() || !age || age < 1 || age > 120) {
      fail("Enter passenger name and a valid age.");
      return;
    }
    const p = addPassenger({ name: npName.trim(), age, gender: npGender, berthPref: "No Preference" });
    setSelectedPax((cur) => (cur.length < 6 ? [...cur, p.id] : cur));
    setUser({ ...user, passengers: [...user.passengers, p] });
    setNpName("");
    setNpAge("");
    setAddOpen(false);
    toast.add({ title: "Passenger saved", description: `${p.name} added to your master list.`, type: "success" });
  }

  function deleteSaved(passengerId: string) {
    removePassenger(passengerId);
    if (user) setUser({ ...user, passengers: user.passengers.filter((p) => p.id !== passengerId) });
    setSelectedPax((cur) => cur.filter((x) => x !== passengerId));
  }

  function goPay() {
    if (!selectedPax.length) {
      fail("Select at least one passenger.");
      return;
    }
    setTaps((n) => n + 1);
    setStep(3);
  }

  function completeBooking(clientRequestId: string) {
    if (!user || !selectedTrain || !selectedClass) return;
    const passengers = selectedPax
      .map((id) => user.passengers.find((p) => p.id === id))
      .filter((p): p is Passenger => !!p)
      .map((p) => ({ name: p.name, age: p.age, gender: p.gender, berthPref: p.berthPref }));
    const res = createBooking({
      trainNo: selectedTrain.no,
      fromCode: selectedTrain.from.code,
      toCode: selectedTrain.to.code,
      date,
      classCode: selectedClass,
      passengers,
      channel: "app",
      upiId: upiId.trim(),
      clientRequestId,
    });
    setBusy(false);
    if (!res.ok) {
      fail(res.error);
      return;
    }
    setBooking(res.booking);
    setStep(4);
    toast.add({
      title: `PNR ${res.booking.pnr}`,
      description: `Payment of ${rupee(res.booking.total)} successful. E-ticket SMSed to ${user.phone}.`,
      type: "success",
    });
  }

  async function payWithRazorpay() {
    if (!user || !selectedTrain || !selectedClass) return;
    setBusy(true);
    try {
      const order = await createRazorpayOrder(
        Math.round((fare + fee) * 100),
        `tikit_${Date.now()}`,
        {
          route: `${selectedTrain.from.code}-${selectedTrain.to.code}`,
          train: `${selectedTrain.no} ${selectedTrain.name}`,
          date,
        },
      );
      const loaded = await loadRazorpayCheckout();
      if (!loaded) throw new Error("Could not load the Razorpay checkout. Check your connection.");
      openRazorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Tikit",
        description: `${selectedTrain.no} ${selectedTrain.name} · ${classLabel(selectedClass)}`,
        prefill: { name: user.name, contact: `+91${user.phone}` },
        notes: { route: `${selectedTrain.from.code}-${selectedTrain.to.code}`, date },
        theme: { color: "#2a4fe4" },
        handler: async (response) => {
          const verified = await verifyRazorpayPayment(response);
          if (!verified) {
            setBusy(false);
            fail("Payment signature verification failed. No ticket was issued.");
            return;
          }
          setTaps((n) => n + 1);
          completeBooking(`rzp-${response.razorpay_payment_id}`);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
    } catch (err) {
      setBusy(false);
      fail(err instanceof Error ? err.message : "Payment could not be started.");
    }
  }

  function payDemo() {
    if (!user || !selectedTrain || !selectedClass) return;
    setBusy(true);
    setTaps((n) => n + 1);
    setTimeout(() => completeBooking(`app-${selectedTrain.no}-${date}-${selectedPax.join(",")}`), 700);
  }

  return (
    <AppShell
      title={step === 4 ? "Booking confirmed" : "Book ticket"}
      subtitle={`${STEP_TITLES[step]} · taps used ${taps}/6`}
      back={step === 0 ? "/home" : undefined}
      showNav={step === 4}
    >
      <div className="mb-4 space-y-2">
        <Progress value={((step + 1) / 5) * 100} />
        <div className="flex items-center justify-between text-[11px] font-semibold text-inkmuted">
          <span>Step {step + 1} of 5</span>
          <span>{Math.min(6, taps)}/6 taps</span>
        </div>
      </div>

      {step > 0 && step < 4 ? (
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-primary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeftIcon /> Back
        </Button>
      ) : null}

      {step === 0 ? (
        <Card className="rise">
          <CardContent className="space-y-3">
            <div className="relative">
              <div className="space-y-2 pr-11">
                <label className="sr-only" htmlFor="from">
                  From
                </label>
                <StationCombobox
                  id="from"
                  value={from}
                  onChange={setFrom}
                  placeholder="From city or station"
                  className="h-12 rounded-xl"
                />
                <label className="sr-only" htmlFor="to">
                  To
                </label>
                <StationCombobox
                  id="to"
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
                <ArrowRightIcon className="rotate-90" />
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
              <Select items={PAX_ITEMS} value={String(pax)} onValueChange={(v) => setPax(Number(v ?? 1))}>
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
              <Select
                items={CLASS_ITEMS}
                value={cls}
                onValueChange={(v) => setCls(typeof v === "string" ? v : "any")}
              >
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

            <Button className="h-11 w-full rounded-xl text-sm" onClick={() => runSearch()} disabled={busy}>
              {busy ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
              {busy ? "Searching trains…" : "Search trains"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <Card size="sm">
            <CardContent className="flex items-center justify-between gap-2 py-0">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <MapPinIcon className="size-4 text-primary" />
                <span>
                  {from} → {to}
                </span>
                <span className="text-muted-foreground">· {humanDate(date)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                Edit
              </Button>
            </CardContent>
          </Card>

          {results?.length ? (
            results.map((t) => (
              <Card key={t.no} className="rise">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <TrainFrontIcon className="size-4.5" />
                      </span>
                      <div>
                        <CardTitle className="text-sm">
                          {t.no} · {t.name}
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          {t.from.name} → {t.to.name}
                        </CardDescription>
                      </div>
                    </div>
                    {t.tatkal ? <Badge variant="secondary">Tatkal</Badge> : <Badge variant="outline">Daily</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-bold leading-none">{t.dep}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{t.from.code}</p>
                    </div>
                    <div className="flex flex-1 flex-col items-center">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {Math.floor(t.durMins / 60)}h {String(t.durMins % 60).padStart(2, "0")}m
                      </span>
                      <span className="flex w-full items-center gap-1">
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span className="h-px flex-1 bg-border" />
                        <TrainFrontIcon className="size-3 text-muted-foreground" />
                        <span className="h-px flex-1 bg-border" />
                        <span className="size-1.5 rounded-full bg-primary" />
                      </span>
                      <span className="text-[10px] text-muted-foreground">Direct</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold leading-none">{t.arr}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {t.to.code}
                        {t.nextDay ? " +1d" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {t.classes.map((c) => {
                      const active = selectedTrain?.no === t.no && selectedClass === c.code;
                      return (
                        <Button
                          key={c.code}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className="h-auto shrink-0 flex-col items-start gap-0.5 rounded-xl px-3 py-2"
                          onClick={() => pickClass(t, c.code)}
                        >
                          <span className="text-[11px] font-bold opacity-80">{c.code}</span>
                          <span className="text-sm font-bold">{rupee(c.fare)}</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              active
                                ? "text-primary-foreground/85"
                                : c.status === "AVAILABLE"
                                  ? "text-success"
                                  : "text-warn"
                            }`}
                          >
                            {c.status === "AVAILABLE" ? `${c.seatsLeft} left` : `WL ${c.waitlistNo}`}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm font-bold">No trains on this route</p>
                <p className="mt-1 text-xs text-muted-foreground">Try another date or a nearby city.</p>
              </CardContent>
            </Card>
          )}

          <Button className="h-11 w-full rounded-xl text-sm" disabled={!selectedTrain || !selectedClass} onClick={goPassengers}>
            Continue with {selectedClass ? classLabel(selectedClass) : "selected class"}
            <ArrowRightIcon />
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Saved passengers</span>
                <span className="text-[11px] font-semibold text-muted-foreground">{selectedPax.length} selected</span>
              </CardTitle>
              <CardDescription>Master list synced with your IRCTC-verified number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {user?.passengers.length ? (
                user.passengers.map((p) => {
                  const on = selectedPax.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                    >
                      <Checkbox checked={on} onCheckedChange={() => togglePax(p.id)} aria-label={`Select ${p.name}`} />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.age} yrs · {p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Other"} ·{" "}
                          {p.berthPref}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSaved(p.id)}
                        aria-label={`Remove ${p.name}`}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">
                  No saved passengers yet. Add one below it is reused for one-tap booking next time.
                </p>
              )}
            </CardContent>
          </Card>

          {user ? (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                render={<Button variant="outline" className="h-11 w-full rounded-xl" />}
              >
                <PlusIcon />
                Add new passenger
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add passenger</DialogTitle>
                  <DialogDescription>Saved to your master list for future bookings.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="np-name">Full name</Label>
                    <Input id="np-name" value={npName} onChange={(e) => setNpName(e.target.value)} placeholder="Name as on ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-age">Age</Label>
                    <Input
                      id="np-age"
                      inputMode="numeric"
                      value={npAge}
                      onChange={(e) => setNpAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      items={{ M: "Male", F: "Female", O: "Other" }}
                      value={npGender}
                      onValueChange={(v) => setNpGender((v as "M" | "F" | "O") ?? "M")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addNewPassenger}>Save passenger</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Alert>
              <UserRoundIcon />
              <AlertTitle>Log in to use saved passengers</AlertTitle>
              <AlertDescription>
                Dummy login with any number OTP 123456.
                <Link
                  href={`/login?next=${encodeURIComponent(nextPath)}`}
                  className={buttonVariants({ size: "sm", className: "mt-2 w-full" })}
                >
                  Log in
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Button className="h-11 w-full rounded-xl text-sm" onClick={goPay} disabled={!selectedPax.length}>
            Continue to payment
            <ArrowRightIcon />
          </Button>
        </div>
      ) : null}

      {step === 3 && selectedTrain && selectedClass ? (
        <div className="space-y-3">
          <Card className="overflow-hidden pt-0">
            <div className="bg-primary px-4 py-4 text-primary-foreground">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Journey</p>
              <p className="mt-1 text-lg font-bold">
                {selectedTrain.from.city} → {selectedTrain.to.city}
              </p>
              <p className="text-xs opacity-80">
                {humanDate(date)} · {selectedTrain.no} {selectedTrain.name}
              </p>
            </div>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class</span>
                <span className="font-semibold">{classLabel(selectedClass)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure</span>
                <span className="font-semibold">
                  {selectedTrain.dep} · {selectedTrain.from.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arrival</span>
                <span className="font-semibold">
                  {selectedTrain.arr}
                  {selectedTrain.nextDay ? " (+1d)" : ""} · {selectedTrain.to.code}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="shrink-0 text-muted-foreground">Passengers</span>
                <span className="text-right font-semibold">
                  {selectedPax
                    .map((id) => user?.passengers.find((p) => p.id === id)?.name ?? "")
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Fare ({selectedPax.length} × {rupee(selectedClassOption?.fare ?? 0)})
                </span>
                <span className="font-semibold">{rupee(fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Convenience fee</span>
                <span className="font-semibold">{rupee(fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total payable</span>
                <span className="text-primary">{rupee(fare + fee)}</span>
              </div>
            </CardContent>
          </Card>

          {selectedClassOption?.status === "WL" ? (
            <Alert>
              <TriangleAlertIcon className="text-warn" />
              <AlertTitle>Waitlisted class (WL {selectedClassOption.waitlistNo})</AlertTitle>
              <AlertDescription>
                You can still book refund is automatic if the ticket is not confirmed.
              </AlertDescription>
            </Alert>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="size-4 text-success" />
                Secure payment · Razorpay
              </CardTitle>
              <CardDescription>UPI, cards and netbanking in the Razorpay test checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="upi">UPI ID (refund destination)</Label>
              <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" />
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <BadgeCheckIcon className="size-3.5 text-success" />
                Instant refunds on cancellation go back to this UPI ID.
              </p>
            </CardContent>
          </Card>

          {user ? (
            <div className="space-y-2">
              <Button
                className="h-11 w-full rounded-xl text-sm"
                onClick={payWithRazorpay}
                disabled={busy || !upiId.trim()}
              >
                {busy ? <Loader2Icon className="animate-spin" /> : <CreditCardIcon />}
                {busy ? "Opening secure checkout…" : `Pay ${rupee(fare + fee)} with Razorpay`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={payDemo}
                disabled={busy}
              >
                Skip gateway · demo payment
              </Button>
            </div>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className={buttonVariants({ className: "h-11 w-full rounded-xl text-sm" })}
            >
              <UserRoundIcon />
              Log in to pay
            </Link>
          )}
        </div>
      ) : null}

      {step === 4 && booking ? (
        <div className="space-y-4">
          <Card className="rise overflow-hidden pt-0">
            <div className="bg-primary px-5 py-6 text-center text-primary-foreground">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/15 pulse-ring">
                <CheckIcon className="size-7" strokeWidth={2.6} />
              </span>
              <p className="mt-3 text-lg font-bold">
                Ticket {booking.status === "CNF" ? "confirmed" : "waitlisted"}
              </p>
              <p className="text-xs opacity-80">
                {booking.trainNo} {booking.trainName} · {classLabel(booking.classCode)}
              </p>
            </div>
            <CardContent className="space-y-4 text-center">
              <div>
                <p className="label">PNR number</p>
                <p className="mt-1 text-2xl font-black tracking-[0.15em]">{booking.pnr}</p>
                <p className="mt-1 text-xs text-muted-foreground">SMS sent to {user?.phone} · e-ticket ready</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="label">Departure</p>
                  <p className="mt-1 text-sm font-bold">{booking.dep}</p>
                  <p className="text-[11px] text-muted-foreground">{booking.from.name}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="label">Arrival</p>
                  <p className="mt-1 text-sm font-bold">{booking.arr}</p>
                  <p className="text-[11px] text-muted-foreground">{booking.to.name}</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-left">
                <p className="label">Passengers</p>
                {booking.passengers.map((p) => (
                  <p key={p.id} className="mt-1 text-sm font-semibold">
                    {p.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {p.status === "CNF" ? `${p.coach}/${p.seat}` : p.seat}
                    </span>
                  </p>
                ))}
              </div>
              <p className="text-sm font-bold text-primary">Total paid {rupee(booking.total)}</p>
            </CardContent>
          </Card>

          <Link
            href={`/ticket/${booking.pnr}`}
            className={buttonVariants({ className: "h-11 w-full rounded-xl text-sm" })}
          >
            <TicketIcon />
            View e-ticket
          </Link>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl text-sm"
            onClick={() => {
              setStep(0);
              setTaps(0);
              setBooking(null);
              setSelectedTrain(null);
              setSelectedClass(null);
              setSelectedPax([]);
              setResults(null);
            }}
          >
            Book another ticket
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookInner />
    </Suspense>
  );
}
