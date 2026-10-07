"use client";

import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { humanDate, isoOf } from "@/lib/format";

export function DatePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const [y, m, d] = value.split("-").map(Number);
  const selected = new Date(y, (m ?? 1) - 1, d ?? 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date();
  max.setDate(max.getDate() + 60);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-11 w-full justify-start gap-2 rounded-xl px-3 font-medium", className)}
          />
        }
      >
        <CalendarIcon className="text-muted-foreground" />
        {humanDate(value)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(day) => day && onChange(isoOf(day))}
          disabled={{ before: today, after: max }}
        />
      </PopoverContent>
    </Popover>
  );
}
