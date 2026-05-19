"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { ProfessionListItem } from "@/features/professions/types"
import { ActivateProfessionAlert } from "@/features/professions/ui/activate-profession-alert"
import { DeactivateProfessionAlert } from "@/features/professions/ui/deactivate-profession-alert"
import { ProfessionUpsertDialog } from "@/features/professions/ui/profession-upsert-dialog"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function ProfessionRowActions({
  profession,
}: {
  profession: ProfessionListItem
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const canWrite = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.masterDataWrite)
  )

  const primaryItems = []

  if (canWrite) {
    primaryItems.push({
      id: "edit",
      label: "Edit",
      icon: PencilLineIcon,
      onSelect: () => setEditOpen(true),
    })
  }

  const lifecycleItems = []

  if (canWrite && profession.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !profession.isActive) {
    lifecycleItems.push({
      id: "activate",
      label: "Activate",
      icon: CircleCheckIcon,
      onSelect: () => setActivateOpen(true),
    })
  }

  const groups = []

  if (primaryItems.length > 0) {
    groups.push({ id: "primary", items: primaryItems })
  }

  if (lifecycleItems.length > 0) {
    groups.push({ id: "lifecycle", items: lifecycleItems })
  }

  if (groups.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={profession.name}
        menuTitle={profession.code}
        groups={groups}
      />
      <ProfessionUpsertDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profession={profession}
      />
      <DeactivateProfessionAlert
        professionId={profession.id}
        professionName={profession.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateProfessionAlert
        professionId={profession.id}
        professionName={profession.name}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
