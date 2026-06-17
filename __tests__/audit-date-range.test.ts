import { describe, expect, it } from "vitest"

import {
  auditDateRangeExceedsMaxDays,
  defaultAuditDateRange,
} from "@/features/audit-logs/lib/audit-date-range"

describe("auditDateRangeExceedsMaxDays", () => {
  it("allows a 7-day window", () => {
    const { from, to } = defaultAuditDateRange()
    expect(auditDateRangeExceedsMaxDays(from, to)).toBe(false)
  })

  it("rejects ranges longer than 31 days", () => {
    expect(auditDateRangeExceedsMaxDays("2026-01-01", "2026-02-15")).toBe(true)
  })
})
