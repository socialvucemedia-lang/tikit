/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellRingIcon,
  CheckIcon,
  CreditCardIcon,
  KeyRoundIcon,
  MessageSquareTextIcon,
  PhoneCallIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainFrontIcon,
  TriangleAlertIcon,
  Undo2Icon,
  UsersIcon,
  WifiOffIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";

import { TikitMark } from "@/components/Icons";

function Slide({
  children,
  className = "",
  page,
}: {
  children: React.ReactNode;
  className?: string;
  page: number;
}) {
  return (
    <section className={`slide ${className}`}>
      <div className="flex h-full w-full flex-col px-14 py-10">{children}</div>
      <span className="slide-page">{String(page).padStart(2, "0")}</span>
    </section>
  );
}

function SlideHead({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <header className="mb-6">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">{kicker}</p>
      <h2 className="mt-2 text-[34px] font-black leading-tight tracking-tight text-ink">{title}</h2>
      {text ? <p className="mt-2 max-w-4xl text-sm leading-relaxed text-inkmuted">{text}</p> : null}
    </header>
  );
}

function Shot({
  src,
  caption,
  height = 430,
}: {
  src: string;
  caption: string;
  height?: number;
}) {
  return (
    <figure className="flex flex-col items-center">
      <div className="overflow-hidden rounded-[30px] border-[6px] border-ink/10 bg-white shadow-[0_24px_60px_-30px_rgba(13,27,76,0.55)]">
        <img src={`/presentation/${src}.png`} alt={caption} style={{ height, width: "auto" }} />
      </div>
      <figcaption className="mt-3 max-w-[260px] text-center text-xs font-semibold text-inkmuted">{caption}</figcaption>
    </figure>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
      <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
      <span>{children}</span>
    </p>
  );
}

function FlowBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-white p-3 shadow-sm">
      <p className="text-xs font-black text-ink">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-inkmuted">{text}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span className="flex w-6 shrink-0 items-center justify-center text-primary">
      <ArrowRightIcon className="size-4" />
    </span>
  );
}

function FixRow({
  n,
  issue,
  cause,
  fix,
}: {
  n: string;
  issue: string;
  cause: string;
  fix: string;
}) {
  return (
    <div className="grid grid-cols-[44px_1.1fr_1fr_1.2fr] items-start gap-4 rounded-2xl border border-line bg-white px-4 py-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-danger-soft text-xs font-black text-danger">
        {n}
      </span>
      <p className="text-sm font-bold leading-snug text-ink">{issue}</p>
      <p className="text-xs leading-snug text-inkmuted">{cause}</p>
      <p className="text-xs leading-snug text-ink">
        <span className="font-bold text-success">Fix: </span>
        {fix}
      </p>
    </div>
  );
}

export default function PresentationPage() {
  return (
    <div className="presentation-root">
      <style
        dangerouslySetInnerHTML={{
          __html: `
@page { size: 13.333in 7.5in; margin: 0; }
html, body { margin: 0; padding: 0; background: #dfe4f2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.presentation-root { font-family: var(--font-sans); }
.slide { position: relative; width: 1280px; height: 720px; overflow: hidden; background-color: #ffffff; color: #0d1b4c; }
.slide-page { position: absolute; right: 40px; bottom: 24px; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #a7b0c8; }
@media screen {
  .presentation-root { padding: 28px 0 60px; }
  .slide { margin: 0 auto 28px; border-radius: 18px; box-shadow: 0 24px 60px -30px rgba(13,27,76,0.5); }
  .no-print { display: block; }
}
@media print {
  html, body { background: #ffffff; }
  .presentation-root { padding: 0; }
  .slide { margin: 0; border-radius: 0; box-shadow: none; page-break-after: always; break-after: page; }
  .slide:last-of-type { page-break-after: auto; break-after: auto; }
  .no-print { display: none !important; }
}
`,
        }}
      />

      <div className="no-print mx-auto mb-6 flex w-[1280px] items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-white">
            <TikitMark className="size-5" />
          </span>
          <div>
            <p className="text-sm font-black">Tikit presentation</p>
            <p className="text-[11px] text-inkmuted">15 slides, print ready. Use the button to export the PDF.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink">
            Back to landing
          </Link>
          <a
            href="/presentation/tikit-presentation.pdf"
            download
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* 1. Title */}
      <Slide page={1} className="bg-gradient-to-br from-primary to-primary-dark">
        <div className="grid h-full grid-cols-[1.2fr_0.8fr] items-center gap-10 text-white">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <TikitMark className="size-7 text-white" />
              </span>
              <span className="text-3xl font-black tracking-tight">tikit</span>
            </div>
            <h1 className="mt-8 text-[46px] font-black leading-[1.08] tracking-tight">
              Railway booking for the common man
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              Book confirmed train tickets in under 6 taps through the app, an AI chat assistant, or a phone call on any
              feature phone.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/15 px-3 py-1.5">6 taps vs IRCTC 30+</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">App + Chat + Call</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Razorpay test checkout</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">IRCTC verified numbers</span>
            </div>
            <p className="mt-10 text-xs font-semibold text-white/70">
              Entrepreneurship Development Lab · Group Tap 2 Track (A3) · Working prototype
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-[240px] overflow-hidden rounded-[34px] border-[6px] border-white/20 shadow-2xl">
              <img src="/presentation/home.png" alt="Tikit app home" className="w-full" />
            </div>
          </div>
        </div>
      </Slide>

      {/* 2. Problem */}
      <Slide page={2}>
        <SlideHead
          kicker="01 · Problem"
          title="Booking a train ticket is still hard for the common man"
          text="IRCTC works, but the experience excludes the people who need it most: first time internet users, daily commuters and feature phone owners."
        />
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: ZapIcon,
              title: "30+ taps to book one ticket",
              text: "85% of our 30 survey respondents said the IRCTC flow takes too many steps, averaging 25 to 30 taps per booking.",
            },
            {
              icon: TriangleAlertIcon,
              title: "Sessions and payments fail",
              text: "Login timeouts, failed payments and re-entered passenger details force users to start the journey again.",
            },
            {
              icon: WifiOffIcon,
              title: "Feature phone users are left out",
              text: "No internet and no app means no booking. Counters and agents are the only fallback, and they cost time and money.",
            },
            {
              icon: UsersIcon,
              title: "Passenger details retyped every trip",
              text: "No practical master list for the common user, so every booking starts from a blank form.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-line bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-danger-soft text-danger">
                <c.icon className="size-5" />
              </span>
              <p className="mt-3 text-base font-black text-ink">{c.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-inkmuted">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-2xl bg-ink px-6 py-4 text-white">
          <div>
            <p className="text-2xl font-black">85%</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">said too many steps</p>
          </div>
          <div>
            <p className="text-2xl font-black">78%</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">want a 6-tap app</p>
          </div>
          <div>
            <p className="text-2xl font-black">2 crore+</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">daily rail travellers</p>
          </div>
        </div>
      </Slide>

      {/* 3. Solution */}
      <Slide page={3}>
        <SlideHead
          kicker="02 · Solution"
          title="One booking engine, three ways to reach it"
          text="Tikit wraps the same verified booking flow into the app, a chat assistant and a phone helpline, so the channel does not decide who gets a ticket."
        />
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: TrainFrontIcon,
              title: "Tikit app",
              text: "A guided 6-tap wizard with saved stations, saved passengers and one-tap UPI.",
              href: "/home",
            },
            {
              icon: MessageSquareTextIcon,
              title: "AI chat assistant",
              text: "Type a route in plain language. The bot finds trains, picks a class and pays.",
              href: "/chat",
            },
            {
              icon: PhoneCallIcon,
              title: "Call 1800 123 4567",
              text: "An AI agent verifies the IRCTC number and books by voice or keypad on any phone.",
              href: "/ivr",
            },
          ].map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-line bg-white p-5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
                <c.icon className="size-5" />
              </span>
              <p className="mt-3 text-lg font-black text-ink">{c.title}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-inkmuted">{c.text}</p>
              <p className="mt-3 text-xs font-bold text-primary">{c.href}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-2 rounded-2xl border border-line bg-[#f8faff] p-5">
          <Note>Under 6 taps from open to PNR</Note>
          <Note>Saved passenger master list</Note>
          <Note>IRCTC verified mobile number</Note>
          <Note>Razorpay payments with signature verification</Note>
          <Note>Instant refunds to the UPI ID</Note>
          <Note>PNR and waitlist alerts by SMS</Note>
        </div>
      </Slide>

      {/* 4. Workflow */}
      <Slide page={4}>
        <SlideHead
          kicker="03 · Workflow"
          title="End to end ticket booking flow"
          text="Every channel lands on the same engine: search, select, pay, confirm. The store keeps the PNR, seats, waitlist position and refund state."
        />
        <div className="flex items-stretch gap-1.5">
          <FlowBox title="1. Login" text="Mobile number + OTP. Number becomes IRCTC verified." />
          <FlowArrow />
          <FlowBox title="2. Route" text="From, destination and date with quick Today / Tomorrow." />
          <FlowArrow />
          <FlowBox title="3. Train" text="Trains with live seats, fares and waitlist positions." />
          <FlowArrow />
          <FlowBox title="4. Passengers" text="Pick from the saved master list or add new." />
          <FlowArrow />
          <FlowBox title="5. Pay" text="Razorpay checkout: UPI, card or netbanking." />
          <FlowArrow />
          <FlowBox title="6. PNR" text="Confirmed or WL ticket, SMS alert, refund ready." />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            {
              title: "App channel",
              text: "6 taps, progress bar and tap counter visible to the user.",
            },
            {
              title: "Chat channel",
              text: "Natural language to the same search and booking functions.",
            },
            {
              title: "Call channel",
              text: "Voice or DTMF drives the identical state machine.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-ink p-4 text-white">
              <p className="text-sm font-black">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">{c.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-line bg-white px-5 py-3 text-xs font-semibold text-inkmuted">
          Reliability: idempotency keys prevent duplicate tickets on retries, availability is deterministic per train,
          date and class, and every persisted booking is shape validated before render.
        </p>
      </Slide>

      {/* 5. Screens: home and login */}
      <Slide page={5}>
        <SlideHead kicker="04 · Screens" title="Home and verified login" />
        <div className="grid flex-1 grid-cols-[1fr_1fr_1.1fr] items-center gap-8">
          <Shot src="home-loggedout" caption="Home: greeting, station search, date picks and popular routes." />
          <Shot src="login" caption="Dummy OTP login. Any number works, demo OTP 123456." />
          <div className="space-y-3">
            <Note>Searchable station combobox replaces the native browser dropdown.</Note>
            <Note>Today and Tomorrow chips keep the common case one tap away.</Note>
            <Note>Passengers and class defaults are remembered per booking.</Note>
            <Note>Verified number unlocks saved passengers and call booking.</Note>
          </div>
        </div>
      </Slide>

      {/* 6. Screens: route and trains */}
      <Slide page={6}>
        <SlideHead kicker="04 · Screens" title="Route search and train selection" />
        <div className="grid flex-1 grid-cols-[1fr_1fr_1.1fr] items-center gap-8">
          <Shot src="book-route" caption="Step 1: from, destination, date, passengers and class." />
          <Shot src="book-trains" caption="Step 2: trains with class chips, fares and waitlist positions." />
          <div className="space-y-3">
            <Note>Swap button flips origin and destination in one tap.</Note>
            <Note>Every class chip shows fare, seats left, or the WL position.</Note>
            <Note>Waitlisted classes are highlighted in amber before payment.</Note>
            <Note>Continue is enabled only after a class is picked.</Note>
          </div>
        </div>
      </Slide>

      {/* 7. Screens: passengers and payment */}
      <Slide page={7}>
        <SlideHead kicker="04 · Screens" title="Saved passengers and Razorpay payment" />
        <div className="grid flex-1 grid-cols-[1fr_1fr_1.1fr] items-center gap-8">
          <Shot src="book-passengers" caption="Step 3: master passenger list with checkboxes and add dialog." />
          <Shot src="book-payment" caption="Step 4: fare breakdown, waitlist alert and secure Razorpay pay." />
          <div className="space-y-3">
            <Note>Passengers are auto-selected up to the requested count.</Note>
            <Note>Waitlist bookings carry a clear refund promise.</Note>
            <Note>UPI ID is collected as the refund destination.</Note>
            <Note>Demo payment fallback keeps the flow testable without the gateway.</Note>
          </div>
        </div>
      </Slide>

      {/* 8. Screens: success and ticket */}
      <Slide page={8}>
        <SlideHead kicker="04 · Screens" title="Confirmation and e-ticket" />
        <div className="grid flex-1 grid-cols-[1fr_1fr_1.1fr] items-center gap-8">
          <Shot src="book-success" caption="Step 5: PNR, coach and seat for each passenger." />
          <Shot src="ticket" caption="E-ticket with boarding pass layout, barcode and download." />
          <div className="space-y-3">
            <Note>PNR, coach and seat assigned at booking time.</Note>
            <Note>SMS alert with the e-ticket is queued to the verified number.</Note>
            <Note>Cancel issues a full refund to the saved UPI ID.</Note>
            <Note>Downloadable ticket for offline travel.</Note>
          </div>
        </div>
      </Slide>

      {/* 9. IVR page */}
      <Slide page={9}>
        <SlideHead
          kicker="05 · IVR channel"
          title="Call booking for feature phones"
          text="No internet and no app. The caller dials the toll free number and the AI agent books the ticket on the IRCTC verified number."
        />
        <div className="grid flex-1 grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="space-y-2.5">
            {[
              ["Dial 1800 123 4567", "Toll free, works on any feature phone. Call recording notice."],
              ["Enter the mobile number", "Keypad entry of the 10 digit number, or spoken digits."],
              ["IRCTC verification", "The agent matches the number against the verified database."],
              ["Main menu", "1 book ticket, 2 PNR status, 3 last ticket, 0 human agent."],
              ["Speak the route", "For example: Pune to Mumbai tomorrow. DTMF keypad also works."],
              ["Select and confirm", "Train and class by number, passenger count from the saved list."],
              ["UPI mandate payment", "One key press charges the linked UPI account."],
              ["PNR read out and SMS", "The agent reads the PNR and texts the e-ticket."],
            ].map(([t, d], i) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{t}</p>
                  <p className="text-xs leading-snug text-inkmuted">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <Shot src="ivr-menu" caption="AI agent live: menu after the verified number." height={400} />
            <Shot src="ivr-booked" caption="Payment success, PNR read out and SMS queued." height={400} />
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-ink px-5 py-3 text-xs font-semibold text-white/85">
          Telephony ready: the agent is a webhook that receives From, Digits, SpeechResult and CallSid, and returns the
          next prompt. The same API can be pointed at Twilio, Exotel or any IVR provider.
        </p>
      </Slide>

      {/* 10. Chatbot page */}
      <Slide page={10}>
        <SlideHead
          kicker="06 · Chat channel"
          title="AI chat that books real tickets"
          text="The assistant understands routes, dates, classes and counts in plain language, including common Hinglish words, then drives the same booking engine."
        />
        <div className="grid flex-1 grid-cols-[0.95fr_1.05fr] gap-8">
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-black text-ink">Language understanding</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-inkmuted">
                <li>Route extraction: “Mumbai to Goa”, “Pune se Mumbai tak”</li>
                <li>Dates: today, tomorrow, day after, weekdays, 15 Oct, 15/10</li>
                <li>Counts: “2 passengers”, “me and my wife”, “family of 4”</li>
                <li>Classes: sleeper, 3A, 2A, first AC, chair car, second sitting</li>
                <li>Intents: book, PNR status, cancel, help, greeting</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-black text-ink">Conversation state machine</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-ink">
                {["idle", "route", "trains", "class", "passengers", "confirm", "pay", "done"].map((s) => (
                  <span key={s} className="rounded-full bg-primary-soft px-2.5 py-1 text-primary">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-inkmuted">
                Quick reply chips let users answer without typing. The PNR card links straight to the e-ticket.
              </p>
            </div>
            <div className="rounded-2xl bg-ink p-4 text-white">
              <p className="text-sm font-black">Same engine, same store</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Chat bookings carry channel = chat, so analytics and refunds behave exactly like app bookings.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Shot src="chat-trains" caption="Train options rendered inside the chat with class chips." height={400} />
            <Shot src="chat-booked" caption="Payment success with PNR card and e-ticket link." height={400} />
          </div>
        </div>
      </Slide>

      {/* 11. Payments */}
      <Slide page={11}>
        <SlideHead
          kicker="07 · Payments"
          title="Real Razorpay checkout with server side verification"
          text="The payment step is not a mock dialog. Orders are created on the server and the signature is verified before a ticket exists."
        />
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-3">
            {[
              ["1. Client requests an order", "POST /api/razorpay/order with the amount in paise."],
              ["2. Server creates the order", "Basic auth with the key secret calls the Razorpay Orders API."],
              ["3. Checkout opens", "Razorpay dialog for UPI, cards and netbanking in test mode."],
              ["4. Handler verifies", "POST /api/razorpay/verify checks the HMAC SHA256 signature."],
              ["5. Ticket is created", "Only a verified payment creates the booking and PNR."],
            ].map(([t, d], i) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{t}</p>
                  <p className="text-xs leading-snug text-inkmuted">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl bg-ink p-6 text-white">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheckIcon className="size-6" />
            </span>
            <p className="text-lg font-black">Keys never touch the client</p>
            <ul className="space-y-2 text-xs leading-relaxed text-white/80">
              <li className="flex gap-2">
                <KeyRoundIcon className="mt-0.5 size-3.5 shrink-0" />
                Key secret lives in server environment variables only.
              </li>
              <li className="flex gap-2">
                <CreditCardIcon className="mt-0.5 size-3.5 shrink-0" />
                Amount is validated server side before the order is created.
              </li>
              <li className="flex gap-2">
                <BadgeCheckIcon className="mt-0.5 size-3.5 shrink-0" />
                Invalid signatures return verified false and no ticket is issued.
              </li>
              <li className="flex gap-2">
                <Undo2Icon className="mt-0.5 size-3.5 shrink-0" />
                Cancellation refunds to the UPI ID collected on the pay screen.
              </li>
            </ul>
            <p className="rounded-xl bg-white/10 px-3 py-2 text-[11px] font-semibold">
              Demo note: payments run in Razorpay test mode. No real money moves.
            </p>
          </div>
        </div>
      </Slide>

      {/* 12. Issues and fixes part 1 */}
      <Slide page={12}>
        <SlideHead
          kicker="08 · Issues and fixes"
          title="What broke while building, and how we fixed it"
          text="Every issue below was found in real testing of the booking flow and resolved in the prototype."
        />
        <div className="space-y-3">
          <FixRow
            n="1"
            issue="Native dropdown looked cheap and inconsistent"
            cause="Browser datalist autocomplete ignored the app theme"
            fix="Replaced with a shadcn Combobox: searchable, themed station picker."
          />
          <FixRow
            n="2"
            issue="Class chips disappeared for some routes"
            cause="Auto search passed the string any as a class filter, matching nothing"
            fix="Filter now applies only real class codes; any means no filter."
          />
          <FixRow
            n="3"
            issue="Ticket page crashed on older saved bookings"
            cause="Persisted data from an earlier schema had a null total"
            fix="Versioned storage key, booking shape validation and safe number formatting."
          />
          <FixRow
            n="4"
            issue="Waitlist was never visible in the demo"
            cause="Deterministic availability almost always had seats left"
            fix="Sold out class and date combos now show WL with a live position."
          />
        </div>
      </Slide>

      {/* 13. Issues and fixes part 2 */}
      <Slide page={13}>
        <SlideHead kicker="08 · Issues and fixes" title="Reliability, security and layout fixes" />
        <div className="space-y-3">
          <FixRow
            n="5"
            issue="Duplicate tickets on retry"
            cause="Repeated pay taps could create two bookings"
            fix="clientRequestId idempotency returns the same PNR for the same request."
          />
          <FixRow
            n="6"
            issue="Razorpay secret could leak to the client"
            cause="Checkout needs a server order and signature check"
            fix="Order and verify routes keep the secret server side and validate HMAC."
          />
          <FixRow
            n="7"
            issue="Booking screen looked unbalanced"
            cause="Stacked labels and an oversized date button broke the grid"
            fix="Rebuilt with the reference layout: swap on the right, compact date row, full width CTA."
          />
          <FixRow
            n="8"
            issue="State growth and malformed data could crash screens"
            cause="Unbounded collections and unvalidated persisted state"
            fix="Bounded maps with eviction, defensive parsing and error safe rendering."
          />
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-[#f8faff] px-5 py-4">
          <WrenchIcon className="size-5 text-primary" />
          <p className="text-sm text-ink">
            Result: the booking flow now completes end to end on all three channels, with no crashes across repeated
            bookings, retries and cancelled tickets.
          </p>
        </div>
      </Slide>

      {/* 14. Architecture */}
      <Slide page={14}>
        <SlideHead
          kicker="09 · Architecture"
          title="How the prototype is put together"
          text="A single Next.js application serves the UI, the AI agents and the payment API, backed by a deterministic in-memory store."
        />
        <div className="grid grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="space-y-3">
            {[
              ["Next.js 16 App Router", "App, chat, call, ticket and presentation routes. Server routes for Razorpay."],
              ["Booking engine", "searchTrains, createBooking, cancelBooking with seat, waitlist and refund logic."],
              ["Channel adapters", "chatRespond and ivrRespond parse language and DTMF into the same engine."],
              ["Store", "Users, passengers, bookings, idempotency keys, availability and SMS outbox."],
              ["UI kit", "shadcn/ui on Base UI with a Tikit theme: cards, combobox, calendar, select, dialogs, toasts."],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <span className="mt-0.5 flex size-6 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CheckIcon className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{t}</p>
                  <p className="text-xs leading-snug text-inkmuted">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-2xl bg-ink p-6 text-white">
            <p className="text-sm font-black uppercase tracking-wider text-white/60">Stack</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16",
                "React 19",
                "TypeScript",
                "Tailwind CSS v4",
                "shadcn/ui",
                "Base UI",
                "Razorpay",
                "Playwright",
              ].map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 space-y-2 text-xs leading-relaxed text-white/80">
              <p className="flex gap-2">
                <SparklesIcon className="mt-0.5 size-3.5 shrink-0" />
                Deterministic data keeps demos and screenshots reproducible.
              </p>
              <p className="flex gap-2">
                <BellRingIcon className="mt-0.5 size-3.5 shrink-0" />
                SMS outbox simulates PNR and refund notifications.
              </p>
              <p className="flex gap-2">
                <RefreshCcwIcon className="mt-0.5 size-3.5 shrink-0" />
                Screenshots in this deck were captured with Playwright from the running app.
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* 15. Closing */}
      <Slide page={15} className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
            <TikitMark className="size-8 text-white" />
          </span>
          <h2 className="mt-6 text-[40px] font-black leading-tight tracking-tight">Your next ticket is 6 taps away</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
            The prototype is live in this repository. Open the app, chat with the agent, or try the call demo with the
            verified demo number 98765 43210.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold">
            {[
              ["/home", "Open the app"],
              ["/chat", "Chat assistant"],
              ["/ivr", "Call demo"],
              ["/presentation", "Presentation"],
            ].map(([href, label]) => (
              <span key={href} className="rounded-2xl bg-white/15 px-5 py-3">
                {label} · {href}
              </span>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-2 text-xs font-semibold text-white/70">
            <TicketIcon className="size-4" />
            Tikit · Railway booking, simplified · Tap 2 Track (A3)
          </div>
        </div>
      </Slide>
    </div>
  );
}
