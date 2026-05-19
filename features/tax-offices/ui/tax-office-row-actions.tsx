"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { TaxOfficeListItem } from "@/features/tax-offices/types"
import { ActivateTaxOfficeAlert } from "@/features/tax-offices/ui/activate-tax-office-alert"
import { DeactivateTaxOfficeAlert } from "@/features/tax-offices/ui/deactivate-tax-office-alert"
import { TaxOfficeFormSheet } from "@/features/tax-offices/ui/tax-office-form-sheet"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function TaxOfficeRowActions({
  taxOffice,
}: {
  taxOffice: TaxOfficeListItem
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

  if (canWrite && taxOffice.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !taxOffice.isActive) {
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
        subjectLabel={taxOffice.name}
        menuTitle={taxOffice.code}
        groups={groups}
      />
      <TaxOfficeFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        taxOffice={taxOffice}
      />
      <DeactivateTaxOfficeAlert
        taxOfficeId={taxOffice.id}
        taxOfficeName={taxOffice.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateTaxOfficeAlert
        taxOfficeId={taxOffice.id}
        taxOfficeName={taxOffice.name}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
