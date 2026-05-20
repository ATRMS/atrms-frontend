"use client"

import { IsoDatePicker } from "@/components/shared/iso-date-picker"

export function IncorporationDatePicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string | undefined
  onChange: (next: string) => void
  invalid: boolean
}) {
  return (
    <IsoDatePicker
      id={id}
      value={value}
      onChange={onChange}
      invalid={invalid}
      placeholder="Pick incorporation date"
      disableFuture
    />
  )
}
