"use client";

import type { ClassCode, TrainResult } from "@/lib/types";
import { classLabel, durText, rupee } from "@/lib/format";
import { Icon } from "./Icons";

export function TrainCard({
  train,
  onPick,
  activeClass,
}: {
  train: TrainResult;
  onPick?: (cls: ClassCode) => void;
  activeClass?: ClassCode;
}) {
  return (
    <div className="card rise p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name="train" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">
                {train.no} · {train.name}
              </p>
              <p className="text-[11px] text-inkmuted">
                {train.from.name} → {train.to.name}
              </p>
            </div>
          </div>
        </div>
        {train.tatkal ? (
          <span className="pill shrink-0 bg-brand/10 text-brand">Tatkal</span>
        ) : (
          <span className="pill shrink-0 bg-success-soft text-success">Daily</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f8faff] px-3 py-2.5">
        <div>
          <p className="text-sm font-bold leading-none">{train.dep}</p>
          <p className="mt-1 text-[10px] text-inkmuted">{train.from.code}</p>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-[10px] font-semibold text-inkmuted">{durText(train.durMins)}</span>
          <span className="flex w-full items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-px flex-1 bg-line" />
            <Icon name="train" className="h-3 w-3 text-inkmuted" />
            <span className="h-px flex-1 bg-line" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] text-inkmuted">Direct</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold leading-none">{train.arr}</p>
          <p className="mt-1 text-[10px] text-inkmuted">
            {train.to.code}
            {train.nextDay ? " +1d" : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {train.classes.map((c) => {
          const active = activeClass === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onPick?.(c.code)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                active ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary"
              }`}
            >
              <span className={`block text-[11px] font-bold ${active ? "text-white/80" : "text-inkmuted"}`}>
                {c.code}
              </span>
              <span className="block text-sm font-bold">{rupee(c.fare)}</span>
              <span
                className={`block text-[10px] font-semibold ${
                  active ? "text-white/85" : c.status === "AVAILABLE" ? "text-success" : "text-warn"
                }`}
              >
                {c.status === "AVAILABLE" ? `${c.seatsLeft} left` : `WL ${c.waitlistNo}`}
              </span>
            </button>
          );
        })}
      </div>
      {activeClass ? (
        <p className="mt-1 text-[11px] font-semibold text-primary">
          Selected: {classLabel(activeClass)}
        </p>
      ) : (
        <p className="mt-1 text-[11px] text-inkmuted">Tap a class to select this train</p>
      )}
    </div>
  );
}
