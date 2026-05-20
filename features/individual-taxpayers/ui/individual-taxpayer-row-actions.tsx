"use client"

import { EyeIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { IndividualTaxpayerListItem } from "@/features/individual-taxpayers/types"
import { useDeleteTaxpayerMutation } from "@/features/individual-taxpayers/usecases/delete-taxpayer.usecase"
import { TaxpayerDeleteConfirmAlert } from "@/features/taxpayers/ui/taxpayer-delete-confirm-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function IndividualTaxpayerRowActions({
  row,
}: {
  row: IndividualTaxpayerListItem
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeleteTaxpayerMutation()

  const canRead = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.taxpayerRead)
  )
  const canDelete = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.taxpayerDelete)
  )

  const subjectLabel = row.displayName?.trim() || row.tin

  const items = []

  if (canRead) {
    items.push({
      id: "view",
      label: "View",
      icon: EyeIcon,
      onSelect: () => router.push(`/admin/taxpayers/individuals/${row.id}`),
    })
  }

  if (canDelete) {
    items.push({
      id: "delete",
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onSelect: () => setDeleteOpen(true),
    })
  }

  const groups = items.length > 0 ? [{ id: "actions", items }] : []

  if (groups.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={subjectLabel}
        menuTitle={row.tin}
        groups={groups}
      />
      {canDelete ? (
        <TaxpayerDeleteConfirmAlert
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          displayName={row.displayName?.trim() || row.tin}
          tin={row.tin}
          isPending={deleteMutation.isPending}
          onConfirm={() => {
            deleteMutation.mutate(row.id, {
              onSuccess: () => setDeleteOpen(false),
            })
          }}
        />
      ) : null}
    </>
  )
}
