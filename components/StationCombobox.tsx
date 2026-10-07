"use client";

import { MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { STATIONS } from "@/lib/data";

export const CITY_OPTIONS = [...new Set(STATIONS.map((s) => s.city))].sort();

export function StationCombobox({
  value,
  onChange,
  placeholder,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  return (
    <Combobox
      items={CITY_OPTIONS}
      value={value || null}
      onValueChange={(v) => onChange(typeof v === "string" ? v : "")}
      onInputValueChange={(v) => onChange(v)}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear={!!value}
        className={cn("h-11 w-full", className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>No station found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              <MapPinIcon className="text-muted-foreground" />
              <span>{item}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
