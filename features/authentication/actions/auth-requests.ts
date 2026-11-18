import "server-only"

import type { ApiResponse } from "@/types/api"
import type {
  AuthSessionPayload,
  LoginResponse,
  LanguagesResponse,
  Me,
  RefreshResponse,
} from "@/features/authentication/types"
import {
  applyAccessCookies,
  applyLoginCookies,
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  isAccessTokenStale,
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

async function requestAuthPayload<T>(
  path: string,
  init: RequestInit,
  language?: string
): Promise<T> {
  const base = assertServerApiBaseUrl()

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(language ? { "Accept-Language": language } : {}),
      ...init.headers,
    },
  })

  const json = await parseJson(res)

  if (!res.ok) {
    throw new Error(extractErrorMessage(json))
  }

  return unwrapApiPayload<T>(json as ApiResponse<T> | T)
}

async function selectedLanguage(): Promise<string | undefined> {
  const store = await cookies()
  return store.get("atrms_lang")?.value
}

export async function fetchMe(accessToken: string): Promise<Me> {
  return requestAuthPayload<Me>(apiPaths.auth.me, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function fetchLanguages(
  accessToken: string
): Promise<LanguagesResponse> {
  return requestAuthPayload<LanguagesResponse>(apiPaths.languages, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function changePasswordRequest(
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await requestAuthPayload<null>(apiPaths.auth.changePassword, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await requestAuthPayload<unknown>(
    apiPaths.auth.forgotPassword,
    { method: "POST", body: JSON.stringify({ email }) },
    await selectedLanguage()
  )
}

export async function resetPasswordRequest(payload: {
  userId: string
  token: string
  newPassword: string
}): Promise<void> {
  await requestAuthPayload<unknown>(
    apiPaths.auth.resetPassword,
    { method: "POST", body: JSON.stringify(payload) },
    await selectedLanguage()
  )
}

export async function updateLanguageRequest(
  accessToken: string,
  language: string
): Promise<void> {
  await requestAuthPayload<unknown>(apiPaths.users.language, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ language }),
  })
}

/**
 * Logs in upstream and persists tokens as HttpOnly cookies on the app origin.
 * Returns only user-visible session fields (no tokens).
 */
export async function loginRequest(
  email: string,
  password: string
): Promise<AuthSessionPayload> {
  const auth = await requestAuthPayload<LoginResponse>(
    apiPaths.auth.login,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    await selectedLanguage()
  )

  const store = await cookies()
  applyLoginCookies(store, auth)
  const me = await fetchMe(auth.accessToken)

  return {
    user: {
      ...auth.user,
      fullName: me.user.fullName,
      roleScopes: me.user.roles,
    },
    mustChangePassword: me.user.mustChangePassword,
    permissions: me.permissions,
  }
}

export async function refreshTokensRequest(
  refreshToken: string
): Promise<RefreshResponse> {
  return requestAuthPayload<RefreshResponse>(
    apiPaths.auth.refresh,
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
    await selectedLanguage()
  )
}

export async function logoutUpstreamRequest(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const base = assertServerApiBaseUrl()

  await fetch(`${base}${apiPaths.auth.logout}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
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
      applyAccessCookies(store, auth)
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
  const accessToken = getAccessTokenFromCookies(store)
  const rawUser = store.get("atrms_user")?.value

  if (!accessToken || !rawUser) return null

  try {
    const loginUser = JSON.parse(rawUser) as LoginResponse["user"]
    const me = await fetchMe(accessToken)

    return {
      user: {
        ...loginUser,
        fullName: me.user.fullName,
        roleScopes: me.user.roles,
      },
      mustChangePassword: me.user.mustChangePassword,
      permissions: me.permissions,
    }
  } catch {
    clearAuthCookies(store)
    return null
  }
}
