"use server"

import type { AuthSessionPayload } from "@/features/authentication/types"

import {
  changePasswordRequest,
  fetchLanguages,
  forgotPasswordRequest,
  loginRequest,
  logoutUpstreamRequest,
  readSessionFromCookieJar,
  resetPasswordRequest,
  refreshTokensRequest,
  ensureAuthCookiesValid,
  updateLanguageRequest,
} from "@/features/authentication/actions/auth-requests"
import type { LanguagesResponse } from "@/features/authentication/types"
import {
  applyAccessCookies,
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

export async function setPreLoginLanguage(language: string): Promise<void> {
  const allowed = ["en", "ha", "ig", "pcm", "yo"]
  if (!allowed.includes(language)) return

  const store = await cookies()
  store.set("atrms_lang", language, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await forgotPasswordRequest(email.trim())
}

export async function resetPassword(payload: {
  userId: string
  token: string
  newPassword: string
}): Promise<void> {
  await resetPasswordRequest(payload)
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthSessionPayload> {
  const session = await readSessionFromCookieJar()
  const accessToken = await getAccessToken()

  if (!session || !accessToken) {
    throw new Error("Your session has expired. Sign in again.")
  }

  await changePasswordRequest(accessToken, currentPassword, newPassword)
  return loginRequest(session.user.email, newPassword)
}

export async function getLanguages(): Promise<LanguagesResponse> {
  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error("Your session has expired.")
  return fetchLanguages(accessToken)
}

export async function updateLanguage(language: string): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error("Your session has expired.")

  await updateLanguageRequest(accessToken, language)
  await setPreLoginLanguage(language)
}

export async function logout(): Promise<void> {
  const store = await cookies()
  const access = getAccessTokenFromCookies(store)
  const refresh = getRefreshTokenFromCookies(store)

  if (access && refresh) {
    await logoutUpstreamRequest(access, refresh)
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
    applyAccessCookies(store, auth)
    return true
  } catch {
    clearAuthCookies(store)
    return false
  }
}
