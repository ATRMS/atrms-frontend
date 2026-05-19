/** Calendar year used for “current” vs past fiscal-year locking in the UI. */
export function getCurrentCalendarYear(): number {
  return new Date().getFullYear()
}

export function formatTargetAmountDisplay(
  amount: number,
  currencySymbol: string
): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${currencySymbol}${formatted}`
}

/** Thousands separators while typing (digits only in underlying string). */
export function formatThousandsGrouping(digitsOnly: string): string {
  if (!digitsOnly) return ""
  const n = Number(digitsOnly)
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("en-US")
}
