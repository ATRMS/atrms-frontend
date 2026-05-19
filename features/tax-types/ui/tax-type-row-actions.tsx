"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { TaxTypeListItem } from "@/features/tax-types/types"
import { ActivateTaxTypeAlert } from "@/features/tax-types/ui/activate-tax-type-alert"
import { DeactivateTaxTypeAlert } from "@/features/tax-types/ui/deactivate-tax-type-alert"
import { TaxTypeFormSheet } from "@/features/tax-types/ui/tax-type-form-sheet"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function TaxTypeRowActions({ taxType }: { taxType: TaxTypeListItem }) {
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

  if (canWrite && taxType.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !taxType.isActive) {
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
        subjectLabel={taxType.name}
        menuTitle={taxType.code}
        groups={groups}
      />
      <TaxTypeFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        taxType={taxType}
      />
      <DeactivateTaxTypeAlert
        taxTypeId={taxType.id}
        taxTypeName={taxType.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateTaxTypeAlert
        taxTypeId={taxType.id}
        taxTypeName={taxType.name}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
