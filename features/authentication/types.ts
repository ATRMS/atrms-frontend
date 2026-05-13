/** Authenticated user returned by the auth API / session (feature-local domain shape). */
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

/** Client-visible auth session shape (tokens live in HttpOnly cookies, not here). */
export type AuthSessionPayload = {
  user: AuthUser
  mustChangePassword: boolean
  /** Permission codes from the access JWT (`permissions`, `authorities`, `scope`, etc.). */
  permissions: string[]
}

/** Login / refresh token exchange payload from the auth API (before cookies). */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  mustChangePassword: boolean
  user: AuthUser
}
