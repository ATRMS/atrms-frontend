"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { EyeIcon, PencilLineIcon, TrashIcon } from "lucide-react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { RoleListItem } from "@/features/roles/types"
import { DeleteRoleAlert } from "@/features/roles/ui/delete-role-alert"
import { EditRoleDialog } from "@/features/roles/ui/edit-role-dialog"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function RoleRowActions({ role }: { role: RoleListItem }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canRead = useAuthStore((s) => s.hasPermission(PermissionCodes.roleRead))
  const canUpdate = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.roleUpdate)
  )
  const canDelete = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.roleDelete)
  )

  const isSystem = Boolean(role.isSystem)

  const primaryItems = []

  if (canRead) {
    primaryItems.push({
      id: "view",
      label: "View",
      icon: EyeIcon,
      onSelect: () => router.push(`/admin/roles/${role.id}`),
    })
  }

  if (canUpdate && !isSystem) {
    primaryItems.push({
      id: "edit",
      label: "Edit",
      icon: PencilLineIcon,
      onSelect: () => setEditOpen(true),
    })
  }

  if (canDelete && !isSystem) {
    primaryItems.push({
      id: "delete",
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onSelect: () => setDeleteOpen(true),
    })
  }

  const groups =
    primaryItems.length > 0 ? [{ id: "primary", items: primaryItems }] : []

  return (
    <>
      <DataTableRowActions
        subjectLabel={role.name}
        menuTitle={role.code}
        groups={groups}
      />
      <EditRoleDialog role={role} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteRoleAlert
        role={role}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
