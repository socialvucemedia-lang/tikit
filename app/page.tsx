import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellRingIcon,
  CheckIcon,
  CreditCardIcon,
  MessageSquareTextIcon,
  PhoneCallIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainFrontIcon,
  Undo2Icon,
  UsersIcon,
  WifiOffIcon,
  ZapIcon,
} from "lucide-react";

import { Icon, TikitMark } from "@/components/Icons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ZapIcon,
    title: "6-tap booking flow",
    text: "A guided wizard that finishes a confirmed ticket in under 6 taps, against 30+ on IRCTC.",
  },
  {
    icon: UsersIcon,
    title: "Saved passenger master list",
    text: "Add passengers once. Every later booking auto-fills them, so repeat trips take seconds.",
  },
  {
    icon: SparklesIcon,
    title: "AI chat booking",
    text: "Type “Mumbai to Goa tomorrow” and the assistant finds trains, picks a class and pays.",
  },
  {
    icon: PhoneCallIcon,
    title: "Call booking on feature phones",
    text: "No internet, no app. Call the helpline and the AI agent books by voice or keypad.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Razorpay secure payments",
    text: "UPI, cards and netbanking through Razorpay checkout with server-side signature verification.",
  },
  {
    icon: BadgeCheckIcon,
    title: "IRCTC-verified numbers",
    text: "One OTP links your mobile number, unlocking saved passengers and call booking.",
  },
  {
    icon: BellRingIcon,
    title: "PNR SMS alerts",
    text: "Every confirmation, waitlist and cancellation triggers an instant SMS with the PNR.",
  },
  {
    icon: Undo2Icon,
    title: "Instant refunds",
    text: "Cancel from the ticket screen and the full amount is refunded to your UPI ID.",
  },
  {
    icon: WifiOffIcon,
    title: "Works without internet",
    text: "Voice and DTMF keypad flows keep the same booking engine available on any phone.",
  },
  {
    icon: RefreshCcwIcon,
    title: "Waitlist aware",
    text: "Waitlisted classes are clearly flagged with a position, and refunds are automatic.",
  },
];

const STEPS = [
  { title: "Search route and date", text: "From, destination and date with quick Today / Tomorrow picks." },
  { title: "Pick train and class", text: "Live seats, fares and waitlist positions across Sleeper, AC and Chair Car." },
  { title: "Select saved passengers", text: "Tap a name from your master list, or add a new passenger in seconds." },
  { title: "Pay with Razorpay", text: "UPI, card or netbanking in the Razorpay test checkout." },
  { title: "Get PNR by SMS", text: "The e-ticket with coach and seat lands instantly, ready to download." },
];

const CHANNELS = [
  {
    href: "/home",
    icon: TrainFrontIcon,
    title: "Tikit app",
    text: "The full 6-tap booking experience with saved passengers and live ticket status.",
    cta: "Open the app",
  },
  {
    href: "/chat",
    icon: MessageSquareTextIcon,
    title: "Chat assistant",
    text: "Book, check a PNR or cancel a ticket in a natural language conversation.",
    cta: "Start chatting",
  },
  {
    href: "/ivr",
    icon: PhoneCallIcon,
    title: "Call 1800 123 4567",
    text: "An AI agent verifies your IRCTC number and books over voice or keypad on any phone.",
    cta: "Try the call demo",
  },
];

const TECH = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui + Base UI",
  "Razorpay Checkout",
];

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[300px]">
      <div className="overflow-hidden rounded-[2.5rem] border border-line bg-white shadow-2xl">
        <div className="bg-gradient-to-b from-primary to-primary-dark px-5 pb-9 pt-6 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-white/15">
              <TikitMark className="size-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold">Hi, Abhay</p>
              <p className="text-[11px] text-white/75">Where are you going?</p>
            </div>
          </div>
        </div>
        <div className="-mt-6 space-y-2.5 rounded-t-[22px] bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs text-inkmuted">
            <Icon name="pin" className="size-3.5 text-primary" />
            Mumbai
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs text-inkmuted">
            <Icon name="pin" className="size-3.5 text-primary" />
            Goa
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white">Today</span>
            <span className="rounded-full border border-line px-3 py-1 text-[10px] font-semibold text-inkmuted">
              Tomorrow
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-inkmuted">
            <span className="rounded-xl border border-line px-3 py-2">1 passenger</span>
            <span className="rounded-xl border border-line px-3 py-2">Any class</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white">
            <Icon name="search" className="size-3.5" />
            Search trains
          </div>
        </div>
        <div className="border-t border-line bg-page p-4">
          <p className="mb-2 text-[11px] font-bold text-ink">Active ticket</p>
          <div className="rounded-2xl border border-line bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-ink">Mumbai to Goa</p>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold text-success">
                Confirmed
              </span>
            </div>
            <p className="mt-1 text-[10px] text-inkmuted">10103 Mandovi Express · Sleeper</p>
            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-inkmuted">
              <span>07:10</span>
              <span className="font-mono tracking-wider text-primary">PNR 4689825627</span>
              <span>19:05</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 -top-3 rounded-2xl bg-ink px-3 py-2 text-[10px] font-bold text-white shadow-lg">
        6 taps
      </div>
      <div className="absolute -left-5 bottom-24 rounded-2xl bg-white px-3 py-2 text-[10px] font-bold text-primary shadow-lg ring-1 ring-line">
        Paid via Razorpay
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-white">
              <TikitMark className="size-5" />
            </span>
            <span className="text-lg font-black tracking-tight">tikit</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-inkmuted md:flex">
            <a href="#features" className="transition hover:text-ink">
              Features
            </a>
            <a href="#how" className="transition hover:text-ink">
              How it works
            </a>
            <a href="#channels" className="transition hover:text-ink">
              Channels
            </a>
            <a href="#payments" className="transition hover:text-ink">
              Payments
            </a>
            <Link href="/presentation" className="transition hover:text-ink">
              Presentation
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
              Log in
            </Link>
            <Link href="/home" className={buttonVariants({ size: "sm" })}>
              Open app
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <TrainFrontIcon />
              Under 6 taps vs IRCTC 30+
            </Badge>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Railway booking for the common man
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-inkmuted">
              Tikit books confirmed train tickets in under 6 taps, through an app, an AI chat assistant, or a phone
              call on any feature phone. Saved passengers, Razorpay payments and instant PNR alerts are built in.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/home" className={buttonVariants({ className: "h-11 rounded-xl px-5 text-sm" })}>
                <TicketIcon />
                Book a ticket
              </Link>
              <Link
                href="/chat"
                className={buttonVariants({ variant: "outline", className: "h-11 rounded-xl px-5 text-sm" })}
              >
                <SparklesIcon />
                Try the AI agent
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-inkmuted">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-success" />
                Works on feature phones
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-success" />
                Razorpay test checkout
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-success" />
                Instant refunds
              </span>
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            ["6", "taps to book"],
            ["3", "booking channels"],
            ["100%", "refund on cancel"],
            ["24x7", "AI call agent"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-black text-primary">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-inkmuted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight">Everything inside Tikit</h2>
          <p className="mt-3 text-sm leading-relaxed text-inkmuted">
            One booking engine powers the app, the chat assistant and the phone helpline, so the experience stays the
            same on every device.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="h-full">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <CardTitle className="mt-2 text-base">{f.title}</CardTitle>
                <CardDescription className="leading-relaxed">{f.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight">The 6-tap flow</h2>
            <p className="mt-3 text-sm leading-relaxed text-inkmuted">
              From opening the app to holding a PNR, every step is designed for first-time internet users.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-line bg-background p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-bold">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-inkmuted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="channels" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight">Book however you can</h2>
          <p className="mt-3 text-sm leading-relaxed text-inkmuted">
            Smartphone, chat window or a basic feature phone, the same IRCTC-verified number follows you.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <Card key={c.title} className="h-full">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-ink text-white">
                  <c.icon className="size-5" />
                </span>
                <CardTitle className="mt-2 text-lg">{c.title}</CardTitle>
                <CardDescription className="leading-relaxed">{c.text}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={c.href} className={buttonVariants({ className: "h-10 w-full rounded-xl text-sm" })}>
                  {c.cta}
                  <ArrowRightIcon />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="payments" className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Payments you can trust</h2>
            <p className="mt-3 text-sm leading-relaxed text-inkmuted">
              The payment step is a real Razorpay checkout in test mode. Orders are created on the server and every
              payment signature is verified before a ticket is issued.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {[
                "UPI, cards and netbanking in the Razorpay dialog",
                "Server-side order creation keeps keys off the client",
                "HMAC signature verification before booking",
                "Full refund to your UPI ID on cancellation",
              ].map((t) => (
                <p key={t} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{t}</span>
                </p>
              ))}
            </div>
          </div>
          <Card className="bg-background">
            <CardHeader>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
                <CreditCardIcon className="size-5" />
              </span>
              <CardTitle className="mt-2 text-lg">Razorpay test checkout</CardTitle>
              <CardDescription>
                Open the booking flow and pay with any Razorpay test method. No real money moves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/book" className={buttonVariants({ variant: "outline", className: "h-10 w-full rounded-xl text-sm" })}>
                Try a live payment
                <ArrowRightIcon />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-inkmuted">Built with</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {TECH.map((t) => (
            <Badge key={t} variant="outline" className="rounded-full px-3 py-1.5 text-xs">
              {t}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <h2 className="text-3xl font-black tracking-tight">Your next train ticket is 6 taps away</h2>
            <p className="max-w-xl text-sm text-white/80">
              Open the app, chat with the agent, or call the helpline. The demo account already has saved passengers
              and an IRCTC-verified number.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/home"
                className={buttonVariants({
                  className: "h-11 rounded-xl bg-white px-5 text-sm text-primary hover:bg-white/90",
                })}
              >
                <TicketIcon />
                Open the app
              </Link>
              <Link
                href="/ivr"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 rounded-xl border-white/40 bg-transparent px-5 text-sm text-white hover:bg-white/10 hover:text-white",
                })}
              >
                <PhoneCallIcon />
                Call 1800 123 4567
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white">
              <TikitMark className="size-4" />
            </span>
            <span className="font-black tracking-tight">tikit</span>
            <span className="ml-2 text-xs text-inkmuted">Railway booking, simplified</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-inkmuted">
            <Link href="/home" className="transition hover:text-ink">
              App
            </Link>
            <Link href="/chat" className="transition hover:text-ink">
              Chat
            </Link>
            <Link href="/ivr" className="transition hover:text-ink">
              Call
            </Link>
            <Link href="/tickets" className="transition hover:text-ink">
              Tickets
            </Link>
            <Link href="/login" className="transition hover:text-ink">
              Log in
            </Link>
            <Link href="/presentation" className="transition hover:text-ink">
              Presentation
            </Link>
          </nav>
          <p className="text-[11px] text-inkmuted">Demo prototype. Payments run in Razorpay test mode.</p>
        </div>
      </footer>
    </div>
  );
}
