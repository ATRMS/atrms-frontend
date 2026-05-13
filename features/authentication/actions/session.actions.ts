"use server"

import type { AuthSessionPayload } from "@/features/authentication/types"

import {
  loginRequest,
  logoutUpstreamRequest,
  readSessionFromCookieJar,
  refreshTokensRequest,
  ensureAuthCookiesValid,
} from "@/features/authentication/actions/auth-requests"
import {
  applyAuthCookies,
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "@/lib/config/cookies"
import { cookies } from "next/headers"

export async function login(
  email: string,
  password: string
): Promise<AuthSessionPayload> {
  const trimmed = email.trim()

  if (!trimmed || !password) {
    throw new Error("Email and password are required.")
  }

  return loginRequest(trimmed, password)
}

export async function logout(): Promise<void> {
  const store = await cookies()
  const access = getAccessTokenFromCookies(store)

  if (access) {
    await logoutUpstreamRequest(access)
  }

  clearAuthCookies(store)
}

export async function getSession(): Promise<AuthSessionPayload | null> {
  return readSessionFromCookieJar()
}

/** HttpOnly access token for Axios `Authorization` (may refresh cookies first). */
export async function getAccessToken(): Promise<string | null> {
  const ok = await ensureAuthCookiesValid()
  if (!ok) return null

  const store = await cookies()

  return getAccessTokenFromCookies(store) ?? null
}

/** Force refresh rotation (e.g. after upstream `401`). */
export async function refreshAuthCookies(): Promise<boolean> {
  const store = await cookies()
  const refresh = getRefreshTokenFromCookies(store)

  if (!refresh) {
    clearAuthCookies(store)
    return false
  }

  try {
    const auth = await refreshTokensRequest(refresh)
    applyAuthCookies(store, auth)
    return true
  } catch {
    clearAuthCookies(store)
    return false
  }
}
