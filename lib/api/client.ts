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
import { publicEnv } from "@/lib/config/env"
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
    return responseData
  }

  return {
    ...fallbackApiError,
    status: error.response?.status ?? 0,
    error: error.code ?? "HttpError",
    message: error.message || fallbackApiError.message,
    path: error.config?.url ?? "",
  }
}

export const apiClient = axios.create({
  baseURL: publicEnv.apiBaseUrl || undefined,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(normaliseError(error))
  }
)

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "error" in value &&
    "message" in value
  )
}
