"use client"

import {
  EyeIcon,
  LockOpenIcon,
  PencilLineIcon,
  UserCheckIcon,
  UserRoundXIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { UserListItem } from "@/features/users/types"
import { formatUserFullName } from "@/features/users/lib/user-display"
import { EditUserSheet } from "@/features/users/ui/edit-user-sheet"
import { UserActivateConfirmAlert } from "@/features/users/ui/user-activate-confirm-alert"
import { UserDeactivateConfirmAlert } from "@/features/users/ui/user-deactivate-confirm-alert"
import { UserUnlockConfirmAlert } from "@/features/users/ui/user-unlock-confirm-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function UserRowActions({ user }: { user: UserListItem }) {
  const router = useRouter()
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)

  const canRead = useAuthStore((s) => s.hasPermission(PermissionCodes.userRead))
  const canUpdate = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.userUpdate)
  )

  const subjectLabel =
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
    user.staffId ||
    user.email

  const fullName = formatUserFullName(user)

  const showDeactivate =
    user.status === "ACTIVE" || user.status === "PENDING"
  const showActivate =
    user.status === "INACTIVE" || user.status === "PENDING"
  const showUnlock = user.status === "LOCKED"

  const primaryItems = []

  if (canRead) {
    primaryItems.push({
      id: "view",
      label: "View",
      icon: EyeIcon,
      onSelect: () => router.push(`/admin/users/${user.id}`),
    })
  }

  if (canUpdate) {
    primaryItems.push({
      id: "edit",
      label: "Edit",
      icon: PencilLineIcon,
      onSelect: () => setEditSheetOpen(true),
    })
  }

  const lifecycleItems = []

  if (canUpdate && showDeactivate) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: UserRoundXIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canUpdate && showActivate) {
    lifecycleItems.push({
      id: "activate",
      label: "Activate",
      icon: UserCheckIcon,
      onSelect: () => setActivateOpen(true),
    })
  }

  if (canUpdate && showUnlock) {
    lifecycleItems.push({
      id: "unlock",
      label: "Unlock",
      icon: LockOpenIcon,
      onSelect: () => setUnlockOpen(true),
    })
  }

  const groups = []

  if (primaryItems.length > 0) {
    groups.push({ id: "primary", items: primaryItems })
  }

  if (lifecycleItems.length > 0) {
    groups.push({ id: "lifecycle", items: lifecycleItems })
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={subjectLabel}
        menuTitle={user.email}
        groups={groups}
      />
      {canUpdate ? (
        <>
          <EditUserSheet
            userId={user.id}
            user={user}
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
            canUpdate={canUpdate}
          />
          <UserDeactivateConfirmAlert
            userId={user.id}
            open={deactivateOpen}
            onOpenChange={setDeactivateOpen}
            fullName={fullName}
          />
          <UserActivateConfirmAlert
            userId={user.id}
            open={activateOpen}
            onOpenChange={setActivateOpen}
            fullName={fullName}
          />
          <UserUnlockConfirmAlert
            userId={user.id}
            open={unlockOpen}
            onOpenChange={setUnlockOpen}
            fullName={fullName}
          />
        </>
      ) : null}
    </>
  )
}
