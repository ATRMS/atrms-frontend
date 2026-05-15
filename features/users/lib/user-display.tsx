"use client"

import type { UserAccountStatus, UserListItem } from "@/features/users/types"
import { Badge } from "@/components/ui/badge"

export function formatUserFullName(
  user: Pick<UserListItem, "firstName" | "middleName" | "lastName">
): string {
  return [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
}

export function formatUserStatusLabel(status: UserAccountStatus): string {
  const lower = status.toLowerCase().replaceAll("_", " ")

  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

const userStatusBadgeClassName: Record<UserAccountStatus, string> = {
  ACTIVE:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  INACTIVE: "text-muted-foreground",
  LOCKED: "",
  PENDING:
    "border-amber-500/30 bg-amber-500/15 text-amber-900 dark:text-amber-200",
}

export function UserStatusBadge({ status }: { status: UserAccountStatus }) {
  const variant =
    status === "LOCKED"
      ? "destructive"
      : status === "INACTIVE"
        ? "secondary"
        : "outline"

  return (
    <Badge variant={variant} className={userStatusBadgeClassName[status]}>
      {formatUserStatusLabel(status)}
    </Badge>
  )
}

export function formatRoleLabel(code: string): string {
  if (!code.trim()) return "—"

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ")
}

export function UserRoleBadge({ code }: { code: string }) {
  return (
    <Badge variant="outline" className="font-normal">
      {formatRoleLabel(code)}
    </Badge>
  )
}
