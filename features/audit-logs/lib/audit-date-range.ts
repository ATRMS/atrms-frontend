import { differenceInCalendarDays, format, subDays } from "date-fns"

export function defaultAuditDateRange(): { from: string; to: string } {
  const to = new Date()
  const from = subDays(to, 6)
  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  }
}

export function auditDateRangeExceedsMaxDays(
  from: string,
  to: string,
  maxDays = 31
): boolean {
  const fromDate = new Date(`${from}T00:00:00`)
  const toDate = new Date(`${to}T00:00:00`)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return true
  }
  return differenceInCalendarDays(toDate, fromDate) > maxDays - 1
}
