import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"

import {
  getAccessToken,
  refreshAuthCookies,
} from "@/features/authentication/actions/session.actions"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { publicEnv, serverEnv } from "@/lib/config/env"
import type { ApiError } from "@/types/api"

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const fallbackApiError: ApiError = {
  status: 0,
  error: "NetworkError",
  message: "Unable to reach the server. Please try again.",
  timestamp: new Date().toISOString(),
  path: "",
  traceId: "",
  code: null,
  messageKey: null,
  fieldErrors: [],
}

export function normaliseError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      ...fallbackApiError,
      error: "UnexpectedError",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    }
  }

  const responseData = error.response?.data

  if (isApiError(responseData)) {
    return {
      ...fallbackApiError,
      ...responseData,
      status: responseData.status,
      message: responseData.message,
      code: responseData.code ?? null,
      messageKey: responseData.messageKey ?? null,
      fieldErrors: Array.isArray(responseData.fieldErrors)
        ? responseData.fieldErrors
        : [],
    }
  }

  return {
    ...fallbackApiError,
    status: error.response?.status ?? 0,
    error: error.code ?? "HttpError",
    message: error.message || fallbackApiError.message,
    path: error.config?.url ?? "",
  }
}

function resolveApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return serverEnv.apiBaseUrl || publicEnv.apiBaseUrl
  }

  return publicEnv.apiBaseUrl
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl() || undefined,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken()

  if (token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set("Authorization", `Bearer ${token}`)
    config.headers = headers
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined
    const hasResponseBody =
      error.response?.data !== undefined &&
      error.response?.data !== null &&
      error.response?.data !== ""

    if (error.response?.status === 403 && !hasResponseBody) {
      await useAuthStore.getState().logout()

      if (typeof window !== "undefined") {
        const next = `${window.location.pathname}${window.location.search}`
        window.location.href = `/login?next=${encodeURIComponent(next)}`
      }

      return Promise.reject(normaliseError(error))
    }

    if (error.response?.status === 401 && config && !config._retry) {
      config._retry = true

      try {
        const rotated = await refreshAuthCookies()

        if (!rotated) {
          throw new Error("Refresh failed")
        }

        return apiClient(config)
      } catch {
        await useAuthStore.getState().logout()

        if (typeof window !== "undefined") {
          const next = `${window.location.pathname}${window.location.search}`
          window.location.href = `/login?next=${encodeURIComponent(next)}`
        }
      }
    }

    return Promise.reject(normaliseError(error))
  }
)

function isApiError(
  value: unknown
): value is Partial<ApiError> & Pick<ApiError, "status" | "message"> {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value
  )
}
