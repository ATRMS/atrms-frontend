import { describe, expect, it, vi } from "vitest"

import { applyApiFieldErrors } from "@/lib/form-errors"
import type { ApiError } from "@/types/api"

describe("applyApiFieldErrors", () => {
  it("maps API field errors back to React Hook Form fields", () => {
    const setError = vi.fn()
    const error: ApiError = {
      error: "ValidationError",
      fieldErrors: {
        email: ["Email is already in use"],
      },
      message: "Validation failed",
      path: "/users",
      status: 400,
      timestamp: "2026-05-11T00:00:00.000Z",
      traceId: "trace-3",
    }

    applyApiFieldErrors(error, setError)

    expect(setError).toHaveBeenCalledWith("email", {
      message: "Email is already in use",
      type: "server",
    })
  })
})
