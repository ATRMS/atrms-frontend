"use client"

import { differenceInCalendarDays, format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseIsoDate(value: string | undefined | null): Date | undefined {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return undefined
  const d = parse(trimmed, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

export type IsoDatePickerProps = {
  id: string
  /** RHF may pass `undefined` briefly before defaults hydrate. */
  value: string | undefined
  onChange: (next: string) => void
  invalid: boolean
  /** Label when no date is selected. */
  placeholder: string
  /** When set, dates after “today” (calendar day) cannot be chosen. */
  disableFuture?: boolean
}

export function IsoDatePicker({
  id,
  value,
  onChange,
  invalid,
  placeholder,
  disableFuture = false,
}: IsoDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground"
          )}
          aria-invalid={invalid}
        >
          <CalendarIcon
            data-icon="inline-start"
            className="size-4 shrink-0 opacity-60"
          />
          {selected ? format(selected, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("")
              return
            }
            onChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
          disabled={
            disableFuture
              ? (date) => differenceInCalendarDays(date, new Date()) > 0
              : undefined
          }
          captionLayout="dropdown"
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
