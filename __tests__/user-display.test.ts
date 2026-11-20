import { describe, expect, it } from "vitest"

import { formatRoleLabel } from "@/features/users/lib/user-display"

describe("formatRoleLabel", () => {
  it.each([undefined, null, "", "  "])(
    "shows the placeholder for a missing or blank role (%s)",
    (role) => {
      expect(formatRoleLabel(role)).toBe("—")
    }
  )

  it("formats a role code as a readable label", () => {
    expect(formatRoleLabel(" TAX_OFFICER ")).toBe("Tax Officer")
  })
})
