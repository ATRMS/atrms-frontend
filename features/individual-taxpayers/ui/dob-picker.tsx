"use client"

import { IsoDatePicker } from "@/components/shared/iso-date-picker"

export function DobPicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  /** RHF may pass `undefined` briefly before defaults hydrate. */
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
      placeholder="Pick date of birth"
    />
  )
}
