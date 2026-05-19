"use client"

import { CircleCheckIcon, CircleOffIcon, PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { BankAccountListItem } from "@/features/bank-accounts/types"
import { ActivateBankAccountAlert } from "@/features/bank-accounts/ui/activate-bank-account-alert"
import { BankAccountFormSheet } from "@/features/bank-accounts/ui/bank-account-form-sheet"
import { DeactivateBankAccountAlert } from "@/features/bank-accounts/ui/deactivate-bank-account-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function BankAccountRowActions({
  account,
}: {
  account: BankAccountListItem
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

  if (canWrite && account.isActive) {
    lifecycleItems.push({
      id: "deactivate",
      label: "Deactivate",
      icon: CircleOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  if (canWrite && !account.isActive) {
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

  const label = `${account.accountName} · ${account.accountNumber}`

  return (
    <>
      <DataTableRowActions
        subjectLabel={account.accountName}
        menuTitle={account.accountNumber}
        groups={groups}
      />
      <BankAccountFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        bankAccount={account}
      />
      <DeactivateBankAccountAlert
        accountId={account.id}
        accountLabel={label}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
      <ActivateBankAccountAlert
        accountId={account.id}
        accountLabel={label}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
