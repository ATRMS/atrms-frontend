import { extractPermissionsFromAccessToken } from "@/features/authentication/lib/access-token-permissions"
import type {
  AuthResponse,
  AuthSessionPayload,
  AuthUser,
} from "@/features/authentication/types"

export const AUTH_COOKIE_ACCESS = "atrms_access"
/** Unix seconds when the access token expires (from API `expiresIn`, not JWT decode). */
export const AUTH_COOKIE_ACCESS_EXP = "atrms_access_exp"
export const AUTH_COOKIE_REFRESH = "atrms_refresh"
export const AUTH_COOKIE_USER = "atrms_user"
export const AUTH_COOKIE_MUST_CHANGE = "atrms_must_change_pw"

/** Refresh cookie lifetime when the API does not send a separate refresh TTL. */
const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

/** Matches `cookies()` from `next/headers` (request + response mutation during Server Actions). */
export type AuthCookieStore = {
  get: (name: string) => { value: string } | undefined
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean
      secure: boolean
      sameSite: "lax" | "strict" | "none"
      path: string
      maxAge: number
    }
  ) => void
  delete: (name: string) => void
}

/** True if access should be rotated using the refresh cookie (skew before wall-clock expiry). */
export function isAccessTokenStale(
  store: Pick<AuthCookieStore, "get">,
  skewMs = 30_000
): boolean {
  const raw = store.get(AUTH_COOKIE_ACCESS_EXP)?.value
  if (!raw) return true

  const expSec = Number(raw)
  if (!Number.isFinite(expSec)) return true

  return Date.now() >= expSec * 1000 - skewMs
}

function cookieOptions(maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production"

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.max(60, Math.floor(maxAgeSeconds)),
  }
}

export function applyAuthCookies(store: AuthCookieStore, auth: AuthResponse) {
  const accessMaxAge = Math.max(60, Math.floor(auth.expiresIn))
  const accessExpiresAtUnix = Math.floor(Date.now() / 1000) + accessMaxAge
  const refreshMaxAge = REFRESH_COOKIE_MAX_AGE_SECONDS

  store.set(AUTH_COOKIE_ACCESS, auth.accessToken, {
    ...cookieOptions(accessMaxAge),
  })

  store.set(AUTH_COOKIE_ACCESS_EXP, String(accessExpiresAtUnix), {
    ...cookieOptions(accessMaxAge),
  })

  store.set(AUTH_COOKIE_REFRESH, auth.refreshToken, {
    ...cookieOptions(refreshMaxAge),
  })

  store.set(AUTH_COOKIE_USER, JSON.stringify(auth.user), {
    ...cookieOptions(refreshMaxAge),
  })

  store.set(AUTH_COOKIE_MUST_CHANGE, auth.mustChangePassword ? "1" : "0", {
    ...cookieOptions(refreshMaxAge),
  })
}

export function clearAuthCookies(store: AuthCookieStore) {
  store.delete(AUTH_COOKIE_ACCESS)
  store.delete(AUTH_COOKIE_ACCESS_EXP)
  store.delete(AUTH_COOKIE_REFRESH)
  store.delete(AUTH_COOKIE_USER)
  store.delete(AUTH_COOKIE_MUST_CHANGE)
}

export function getAccessTokenFromCookies(
  store: Pick<AuthCookieStore, "get">
): string | undefined {
  return store.get(AUTH_COOKIE_ACCESS)?.value
}

export function getRefreshTokenFromCookies(
  store: Pick<AuthCookieStore, "get">
): string | undefined {
  return store.get(AUTH_COOKIE_REFRESH)?.value
}

export function readSessionPayloadFromCookies(
  store: Pick<AuthCookieStore, "get">
): AuthSessionPayload | null {
  const raw = store.get(AUTH_COOKIE_USER)?.value
  const mustChange = store.get(AUTH_COOKIE_MUST_CHANGE)?.value === "1"

  if (!raw) return null

  try {
    const user = JSON.parse(raw) as AuthUser
    const access = getAccessTokenFromCookies(store)
    const permissions = access
      ? extractPermissionsFromAccessToken(access)
      : []

    return { user, mustChangePassword: mustChange, permissions }
  } catch {
    return null
  }
}
