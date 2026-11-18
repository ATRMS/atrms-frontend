import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { afterEach, describe, expect, it, vi } from "vitest"

import { apiClient, normaliseError } from "@/lib/api/client"
import { publicEnv } from "@/lib/config/env"
import { useAuthStore } from "@/features/authentication/store/auth-store"

const { getAccessTokenMock, refreshAuthCookiesMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
  refreshAuthCookiesMock: vi.fn(),
}))

vi.mock("@/features/authentication/actions/session.actions", () => ({
  getAccessToken: getAccessTokenMock,
  refreshAuthCookies: refreshAuthCookiesMock,
}))

const originalAdapter = apiClient.defaults.adapter

describe("apiClient", () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter
    useAuthStore.setState({
      user: null,
      mustChangePassword: null,
      permissions: [],
    })
    getAccessTokenMock.mockReset()
    refreshAuthCookiesMock.mockReset()
    vi.restoreAllMocks()
  })

  it("uses the public upstream API URL in the browser", () => {
    expect(apiClient.defaults.baseURL).toBe(publicEnv.apiBaseUrl || undefined)
  })

  it("injects the Authorization header when an access token is present", async () => {
    let capturedConfig: InternalAxiosRequestConfig | undefined
    const adapter: AxiosAdapter = async (config) => {
      capturedConfig = config

      return {
        config,
        data: { status: 200, data: {} },
        headers: {},
        status: 200,
        statusText: "OK",
      } satisfies AxiosResponse
    }

    apiClient.defaults.adapter = adapter
    getAccessTokenMock.mockResolvedValue("token-123")

    await apiClient.get("/secured")

    expect(capturedConfig?.headers.Authorization).toBe("Bearer token-123")
  })

  it("attempts refresh once on 401 and logs out if refresh fails", async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ logout })

    const adapter: AxiosAdapter = async (config) =>
      Promise.reject({
        config,
        isAxiosError: true,
        message: "Unauthorized",
        response: {
          config,
          data: {
            error: "Unauthorized",
            message: "Unauthorized",
            path: "/secured",
            status: 401,
            timestamp: "2026-05-11T00:00:00.000Z",
            traceId: "trace-1",
          },
          headers: {},
          status: 401,
          statusText: "Unauthorized",
        },
      })

    apiClient.defaults.adapter = adapter
    getAccessTokenMock.mockResolvedValue("token-123")
    refreshAuthCookiesMock.mockResolvedValue(false)

    await expect(apiClient.get("/secured")).rejects.toMatchObject({
      status: 401,
    })
    expect(refreshAuthCookiesMock).toHaveBeenCalledTimes(1)
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it("normaliseError converts Axios errors into the ApiError shape", () => {
    const error = normaliseError({
      config: { url: "/regions" },
      isAxiosError: true,
      message: "Request failed",
      response: {
        data: {
          error: "Conflict",
          message: "Region has active tax offices",
          path: "/regions/1",
          status: 409,
          timestamp: "2026-05-11T00:00:00.000Z",
          traceId: "trace-2",
        },
        status: 409,
      },
    })

    expect(error).toMatchObject({
      message: "Region has active tax offices",
      status: 409,
      traceId: "trace-2",
    })
  })
})
