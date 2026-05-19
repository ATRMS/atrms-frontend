"use client"

import { PencilLineIcon, StarIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { CurrencyListItem } from "@/features/currencies/types"
import { CurrencyUpsertDialog } from "@/features/currencies/ui/currency-upsert-dialog"
import { SetDefaultCurrencyAlert } from "@/features/currencies/ui/set-default-currency-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function CurrencyRowActions({ currency }: { currency: CurrencyListItem }) {
  const [editOpen, setEditOpen] = useState(false)
  const [setDefaultOpen, setSetDefaultOpen] = useState(false)

  const canWrite = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.masterDataWrite)
  )

  if (!canWrite) {
    return <span className="text-muted-foreground">—</span>
  }

  const primaryItems = [
    {
      id: "edit",
      label: "Edit",
      icon: PencilLineIcon,
      onSelect: () => setEditOpen(true),
    },
  ]

  const defaultItems = []

  if (!currency.isDefault) {
    defaultItems.push({
      id: "set-default",
      label: "Set as default",
      icon: StarIcon,
      onSelect: () => setSetDefaultOpen(true),
    })
  }

  const groups = [{ id: "primary", items: primaryItems }]

  if (defaultItems.length > 0) {
    groups.push({ id: "default", items: defaultItems })
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={currency.name}
        menuTitle={currency.code}
        groups={groups}
      />
      <CurrencyUpsertDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currency={currency}
      />
      <SetDefaultCurrencyAlert
        currencyId={currency.id}
        currencyName={currency.name}
        open={setDefaultOpen}
        onOpenChange={setSetDefaultOpen}
      />
    </>
  )
}
