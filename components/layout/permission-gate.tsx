"use client"

import type { ReactNode } from "react"

import type { PermissionCode } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"

export function PermissionGate({
  children,
  fallback = null,
  permission,
}: {
  children: ReactNode
  fallback?: ReactNode
  permission: PermissionCode | string
}) {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (!hasPermission(permission)) {
    return fallback
  }

  return children
}
