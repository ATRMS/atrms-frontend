import { describe, expect, it } from "vitest"

import {
  getAllowedTaxpayerStatusTransitions,
  taxpayerStatusChangeRequiresReason,
} from "@/features/taxpayers/lib/taxpayer-status-transitions"

describe("getAllowedTaxpayerStatusTransitions", () => {
  it("allows ACTIVE → INACTIVE, BLACKLISTED, DECEASED", () => {
    expect(getAllowedTaxpayerStatusTransitions("ACTIVE")).toEqual([
      "INACTIVE",
      "BLACKLISTED",
      "DECEASED",
    ])
  })

  it("allows INACTIVE → ACTIVE, BLACKLISTED", () => {
    expect(getAllowedTaxpayerStatusTransitions("INACTIVE")).toEqual([
      "ACTIVE",
      "BLACKLISTED",
    ])
  })

  it("allows no transitions from BLACKLISTED or DECEASED", () => {
    expect(getAllowedTaxpayerStatusTransitions("BLACKLISTED")).toEqual([])
    expect(getAllowedTaxpayerStatusTransitions("DECEASED")).toEqual([])
  })
})

describe("taxpayerStatusChangeRequiresReason", () => {
  it("requires reason for BLACKLISTED and DECEASED only", () => {
    expect(taxpayerStatusChangeRequiresReason("BLACKLISTED")).toBe(true)
    expect(taxpayerStatusChangeRequiresReason("DECEASED")).toBe(true)
    expect(taxpayerStatusChangeRequiresReason("ACTIVE")).toBe(false)
    expect(taxpayerStatusChangeRequiresReason("INACTIVE")).toBe(false)
  })
})
