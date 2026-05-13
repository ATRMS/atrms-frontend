import "server-only"

import type { ApiResponse } from "@/types/api"
import type {
  AuthResponse,
  AuthSessionPayload,
} from "@/features/authentication/types"
import { extractPermissionsFromAccessToken } from "@/features/authentication/lib/access-token-permissions"
import {
  applyAuthCookies,
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  isAccessTokenStale,
  readSessionPayloadFromCookies,
} from "@/lib/config/cookies"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { assertServerApiBaseUrl } from "@/lib/config/env"
import { cookies } from "next/headers"

function extractErrorMessage(json: unknown): string {
  if (typeof json === "object" && json !== null) {
    const o = json as Record<string, unknown>

    if (typeof o.message === "string") return o.message
    if (typeof o.error === "string") return o.error

    const nested = o.data

    if (typeof nested === "object" && nested !== null) {
      const d = nested as Record<string, unknown>

      if (typeof d.message === "string") return d.message
    }
  }

  return "Request failed"
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function fetchAuthResponse(
  path: string,
  init: RequestInit
): Promise<AuthResponse> {
  const base = assertServerApiBaseUrl()

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  const json = await parseJson(res)

  if (!res.ok) {
    throw new Error(extractErrorMessage(json))
  }

  return unwrapApiPayload<AuthResponse>(
    json as ApiResponse<AuthResponse> | AuthResponse
  )
}

/**
 * Logs in upstream and persists tokens as HttpOnly cookies on the app origin.
 * Returns only user-visible session fields (no tokens).
 */
export async function loginRequest(
  email: string,
  password: string
): Promise<AuthSessionPayload> {
  const auth = await fetchAuthResponse(apiPaths.auth.login, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const store = await cookies()
  applyAuthCookies(store, auth)

  return {
    user: auth.user,
    mustChangePassword: auth.mustChangePassword,
    permissions: extractPermissionsFromAccessToken(auth.accessToken),
  }
}

export async function refreshTokensRequest(
  refreshToken: string
): Promise<AuthResponse> {
  return fetchAuthResponse(apiPaths.auth.refresh, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })
}

export async function logoutUpstreamRequest(
  accessToken: string
): Promise<void> {
  const base = assertServerApiBaseUrl()

  await fetch(`${base}${apiPaths.auth.logout}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  }).catch(() => undefined)
}

/** Ensures cookie jar has a usable access token; refreshes via refresh cookie when needed. */
export async function ensureAuthCookiesValid(): Promise<boolean> {
  const store = await cookies()

  const access = getAccessTokenFromCookies(store)
  const refresh = getRefreshTokenFromCookies(store)

  if (!refresh) {
    clearAuthCookies(store)
    return false
  }

  if (!access || isAccessTokenStale(store)) {
    try {
      const auth = await refreshTokensRequest(refresh)
      applyAuthCookies(store, auth)
    } catch {
      clearAuthCookies(store)
      return false
    }
  }

  return true
}

/** Reads session payload from cookies after ensuring tokens are valid. */
export async function readSessionFromCookieJar(): Promise<AuthSessionPayload | null> {
  const ok = await ensureAuthCookiesValid()
  if (!ok) return null

  const store = await cookies()

  return readSessionPayloadFromCookies(store)
}
