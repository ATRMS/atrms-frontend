import { create } from "zustand"

import {
  getSession,
  logout as logoutAction,
} from "@/features/authentication/actions/session.actions"
import type { AuthSessionPayload } from "@/features/authentication/types"

interface AuthState {
  user: AuthSessionPayload["user"] | null
  mustChangePassword: AuthSessionPayload["mustChangePassword"] | null
  permissions: AuthSessionPayload["permissions"]
  setSession: (session: AuthSessionPayload) => void
  clearSession: () => void
  logout: () => Promise<void>
  hydrateFromSession: () => Promise<boolean>
  hasPermission: (code: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  mustChangePassword: null,
  permissions: [],
  setSession(session) {
    set({
      user: session.user,
      mustChangePassword: session.mustChangePassword,
      permissions: session.permissions,
    })
  },
  clearSession() {
    set({
      user: null,
      mustChangePassword: null,
      permissions: [],
    })
  },
  async logout() {
    await logoutAction().catch(() => undefined)
    get().clearSession()
  },
  async hydrateFromSession() {
    const session = await getSession()

    if (!session) {
      get().clearSession()
      return false
    }

    set({
      user: session.user,
      mustChangePassword: session.mustChangePassword,
      permissions: session.permissions,
    })

    return true
  },
  hasPermission(code: string) {
    const list = get().permissions

    if (list.includes("*")) return true

    return list.includes(code)
  },
}))
