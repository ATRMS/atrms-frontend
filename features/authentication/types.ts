/** Authenticated user returned by the auth API / session (feature-local domain shape). */
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export type ScopeType = "STATE" | "REGION" | "OFFICE"

export interface MeRole {
  id: string
  code: string
  name: string
  scopeType: ScopeType
  scopeId: string | null
}

export interface Me {
  user: {
    id: string
    email: string
    fullName: string
    roles: MeRole[]
    taxOffice: { id: string; name: string } | null
    status: string
    mustChangePassword: boolean
  }
  tenant: { id: string; name: string }
  permissions: string[]
}

/** Client-visible auth session shape (tokens live in HttpOnly cookies, not here). */
export type AuthSessionPayload = {
  user: AuthUser & { fullName: string; roleScopes: MeRole[] }
  mustChangePassword: boolean
  permissions: string[]
}

/** Login / refresh token exchange payload from the auth API (before cookies). */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  mustChangePassword: boolean
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface Language {
  code: string
  name: string
  nativeName: string
}

export interface LanguagesResponse {
  defaultLanguage: string
  languages: Language[]
}
