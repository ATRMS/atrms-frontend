import { describe, expect, it, vi } from "vitest"

import { applyApiFieldErrors } from "@/lib/form-errors"
import type { ApiError } from "@/types/api"

describe("applyApiFieldErrors", () => {
  it("maps API field errors back to React Hook Form fields", () => {
    const setError = vi.fn()
    const error: ApiError = {
      error: "ValidationError",
      fieldErrors: [
        {
          field: "email",
          message: "Email is already in use",
          messageKey: "validation.Email",
        },
      ],
      message: "Validation failed",
      messageKey: "error.request.invalid",
      code: null,
      path: "/users",
      status: 400,
      timestamp: "2026-05-11T00:00:00.000Z",
      traceId: "trace-3",
    }

    expect(applyApiFieldErrors(error, setError)).toBe(true)

    expect(setError).toHaveBeenCalledWith("email", {
      message: "Email is already in use",
      type: "server",
    })
  })

  it("maps a business message key to a field", () => {
    const setError = vi.fn()
    const error: ApiError = {
      error: "Bad Request",
      fieldErrors: [],
      message: "The current password is wrong",
      messageKey: "auth.password.current-wrong",
      code: null,
      path: "/auth/change-password",
      status: 401,
      timestamp: "2026-11-17T00:00:00.000Z",
      traceId: "trace-4",
    }

    expect(
      applyApiFieldErrors(error, setError, {
        "auth.password.current-wrong": "currentPassword",
      })
    ).toBe(true)
    expect(setError).toHaveBeenCalledWith("currentPassword", {
      message: "The current password is wrong",
      type: "server",
    })
  })

  it("returns false when an error must fall back to an alert", () => {
    const setError = vi.fn()
    const error: ApiError = {
      error: "Conflict",
      fieldErrors: [],
      message: "Someone else changed the record",
      messageKey: null,
      code: "WORKFLOW_CONCURRENT_UPDATE",
      path: "/workflow",
      status: 409,
      timestamp: "2026-11-17T00:00:00.000Z",
      traceId: "trace-5",
    }

    expect(applyApiFieldErrors(error, setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})
