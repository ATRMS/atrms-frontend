"use client"

import type { VariantProps } from "class-variance-authority"

import type { UserAccountStatus, UserListItem } from "@/features/users/types"
import { Badge, badgeVariants } from "@/components/ui/badge"

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

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const userStatusBadgeVariant: Record<UserAccountStatus, BadgeVariant> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  LOCKED: "destructive",
  PENDING: "pending",
}

export function UserStatusBadge({ status }: { status: UserAccountStatus }) {
  return (
    <Badge variant={userStatusBadgeVariant[status]} className="font-normal">
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
