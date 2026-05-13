/**
 * Upstream REST paths relative to the API base URL (see `lib/config/env`).
 * Add route segments here—avoid scattering URL fragments across callers.
 */
export const apiPaths = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
} as const
