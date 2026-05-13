import { describe, expect, it } from "vitest"

import {
  extractPermissionCodesFromPayload,
  extractPermissionsFromAccessToken,
} from "@/features/authentication/lib/access-token-permissions"

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )

  return `e30.${encoded}.sig`
}

describe("access-token-permissions", () => {
  it("reads permissions array from JWT", () => {
    const token = jwtWithPayload({
      permissions: ["role:read", "user:read"],
    })

    expect(extractPermissionsFromAccessToken(token)).toEqual([
      "role:read",
      "user:read",
    ])
  })

  it("reads Spring-style authorities", () => {
    const token = jwtWithPayload({
      authorities: [{ authority: "SCOPE_read" }, "PLAIN"],
    })

    expect(extractPermissionsFromAccessToken(token)).toContain("SCOPE_read")
    expect(extractPermissionsFromAccessToken(token)).toContain("PLAIN")
  })

  it("returns empty array for malformed token", () => {
    expect(extractPermissionsFromAccessToken("not-a-jwt")).toEqual([])
  })

  it("extractPermissionCodesFromPayload merges shapes", () => {
    expect(
      extractPermissionCodesFromPayload({
        permission: "ONLY_ONE",
        scope: "a b",
      })
    ).toEqual(expect.arrayContaining(["ONLY_ONE", "a", "b"]))
  })
})
