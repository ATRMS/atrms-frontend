import { describe, expect, it } from "vitest"

import { phoneSchema } from "@/lib/schemas"

describe("common schemas", () => {
  it("rejects invalid phone numbers", () => {
    expect(phoneSchema.safeParse("12345").success).toBe(false)
    expect(phoneSchema.safeParse("+2348012345678").success).toBe(true)
  })
})
