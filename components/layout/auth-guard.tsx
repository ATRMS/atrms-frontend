"use client"

import { type ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuthStore } from "@/features/authentication/store/auth-store"

export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword)
  const hydrateFromSession = useAuthStore((state) => state.hydrateFromSession)
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const ok = await hydrateFromSession()

        if (!ok && isMounted) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        } else if (
          ok &&
          isMounted &&
          useAuthStore.getState().mustChangePassword
        ) {
          router.replace("/change-password")
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [hydrateFromSession, pathname, router])

  if (isCheckingSession) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Restoring your session...
      </div>
    )
  }

  if (!user || mustChangePassword) {
    return null
  }

  return children
}
