"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, TikitMark } from "./Icons";

const NAV = [
  { href: "/home", label: "Home", icon: "home" as const },
  { href: "/tickets", label: "Tickets", icon: "ticket" as const },
  { href: "/book", label: "Book", icon: "search" as const, fab: true },
  { href: "/chat", label: "Chat", icon: "chat" as const },
  { href: "/ivr", label: "Call", icon: "phone" as const },
];

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-line bg-white/95 backdrop-blur">
      <div className="flex items-end justify-around px-2 pb-2 pt-2">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          if (item.fab) {
            return (
              <Link key={item.href} href={item.href} className="flex w-16 flex-col items-center gap-1">
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/40 transition active:scale-95">
                  <Icon name={item.icon} className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-inkmuted"}`}>{item.label}</span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href} className="flex w-16 flex-col items-center gap-1 py-1">
              <Icon
                name={item.icon}
                className={`h-5 w-5 ${active ? "text-primary" : "text-inkmuted"}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-inkmuted"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  back,
  right,
  showNav = true,
  brand = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
  showNav?: boolean;
  brand?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-[#dfe4f2] md:py-6">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-page md:min-h-[calc(100dvh-3rem)] md:rounded-[2.5rem] md:shadow-2xl md:ring-1 md:ring-black/5">
        {title !== undefined ? (
          <header className="bg-gradient-to-b from-primary to-primary-dark px-5 pb-8 pt-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {back ? (
                  <Link
                    href={back}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    aria-label="Go back"
                  >
                    <Icon name="arrow-left" className="h-4.5 w-4.5" />
                  </Link>
                ) : null}
                {brand ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <TikitMark className="h-6 w-6" />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
                  {subtitle ? <p className="truncate text-xs text-white/75">{subtitle}</p> : null}
                </div>
              </div>
              {right}
            </div>
          </header>
        ) : null}
        <main className={`flex flex-1 flex-col ${title !== undefined ? "relative z-10 -mt-5 rounded-t-[26px] bg-page" : ""}`}>
          <div className="flex-1 px-4 pb-6 pt-5">{children}</div>
          {showNav ? <BottomNav /> : null}
        </main>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: "CNF" | "WL" | "CANCELLED" }) {
  const styles =
    status === "CNF"
      ? "bg-success-soft text-success"
      : status === "WL"
        ? "bg-warn-soft text-warn"
        : "bg-danger-soft text-danger";
  const label = status === "CNF" ? "Confirmed" : status === "WL" ? "Waitlisted" : "Cancelled";
  return <span className={`pill ${styles}`}>{label}</span>;
}
