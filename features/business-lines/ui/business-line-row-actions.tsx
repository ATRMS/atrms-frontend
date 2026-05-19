"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { BusinessLineListItem } from "@/features/business-lines/types"
import { ActivateBusinessLineAlert } from "@/features/business-lines/ui/activate-business-line-alert"
import { BusinessLineEditDialog } from "@/features/business-lines/ui/business-line-edit-dialog"
import { DeactivateBusinessLineAlert } from "@/features/business-lines/ui/deactivate-business-line-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function BusinessLineRowActions({ line }: { line: BusinessLineListItem }) {
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

  if (canWrite && line.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !line.isActive) {
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
        subjectLabel={line.name}
        menuTitle={line.code}
        groups={groups}
      />
      <BusinessLineEditDialog
        line={line}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeactivateBusinessLineAlert
        lineId={line.id}
        lineName={line.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateBusinessLineAlert
        lineId={line.id}
        lineName={line.name}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
