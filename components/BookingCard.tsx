"use client";

import Link from "next/link";
import { CalendarIcon, TrainFrontIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { classLabel, humanDate, rupee } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function StatusBadge({ status }: { status: Booking["status"] }) {
  const map = {
    CNF: { label: "Confirmed", className: "bg-success-soft text-success" },
    WL: { label: "Waitlisted", className: "bg-warn-soft text-warn" },
    CANCELLED: { label: "Cancelled", className: "bg-danger-soft text-danger" },
  } as const;
  const s = map[status];
  return <Badge className={`border-transparent ${s.className}`}>{s.label}</Badge>;
}

export function BookingCard({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const b = booking;
  const first = b.passengers[0];
  return (
    <Link href={`/ticket/${b.pnr}`} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:ring-primary/30">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrainFrontIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {b.from.city} <span className="text-muted-foreground">→</span> {b.to.city}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {b.trainNo} {b.trainName} · {classLabel(b.classCode)}
                </p>
              </div>
            </div>
            <StatusBadge status={b.status} />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-3.5 text-primary" />
              <div>
                <p className="text-xs font-bold leading-none">{b.dep}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{humanDate(b.date)}</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
              {b.pnr}
            </Badge>
            <div className="text-right">
              <p className="text-xs font-bold leading-none">{b.arr}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {b.to.code}
                {b.arr < b.dep ? " +1d" : ""}
              </p>
            </div>
          </div>

          {!compact ? (
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-[11px]">
              <span className="truncate text-muted-foreground">
                {first ? `${first.name}${b.passengers.length > 1 ? ` +${b.passengers.length - 1}` : ""}` : ""}
                {first && first.status === "CNF" ? ` · ${first.coach}/${first.seat}` : ""}
              </span>
              <span className="font-bold">{rupee(b.total)}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
