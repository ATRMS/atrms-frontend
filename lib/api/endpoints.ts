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
  users: {
    collection: "/users",
    detail: (id: string) =>
      `/users/${encodeURIComponent(id)}` as const,
    resetPassword: (id: string) =>
      `/users/${encodeURIComponent(id)}/reset-password` as const,
    status: (id: string) =>
      `/users/${encodeURIComponent(id)}/status` as const,
    transfers: (id: string) =>
      `/users/${encodeURIComponent(id)}/transfers` as const,
  },
  roles: {
    collection: "/roles",
    detail: (id: string) =>
      `/roles/${encodeURIComponent(id)}` as const,
    permissions: (id: string) =>
      `/roles/${encodeURIComponent(id)}/permissions` as const,
  },
  permissions: {
    collection: "/permissions",
  },
  masterData: {
    taxOffices: "/master-data/tax-offices",
  },
} as const
