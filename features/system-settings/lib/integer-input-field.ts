import type { ChangeEvent } from "react"

/** Keeps number fields clearable while editing (empty string), not forced to 0. */
export function integerInputFieldProps(
  value: number | "",
  onChange: (v: number | "") => void
) {
  return {
    value: value === "" ? "" : value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      onChange(raw === "" ? "" : Number.parseInt(raw, 10))
    },
  }
}
