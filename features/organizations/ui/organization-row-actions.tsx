"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { OrganizationListItem } from "@/features/organizations/types"
import { ActivateOrganizationAlert } from "@/features/organizations/ui/activate-organization-alert"
import { DeactivateOrganizationAlert } from "@/features/organizations/ui/deactivate-organization-alert"
import { OrganizationFormSheet } from "@/features/organizations/ui/organization-form-sheet"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function OrganizationRowActions({
  organization,
}: {
  organization: OrganizationListItem
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

  if (canWrite && organization.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !organization.isActive) {
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
        subjectLabel={organization.name}
        menuTitle={organization.regNumber ?? organization.name}
        groups={groups}
      />
      <OrganizationFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        organization={organization}
      />
      <DeactivateOrganizationAlert
        organizationId={organization.id}
        organizationName={organization.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateOrganizationAlert
        organizationId={organization.id}
        organizationName={organization.name}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
