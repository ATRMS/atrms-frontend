"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"

export type TaxpayerDeleteConfirmAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  tin: string
  isPending: boolean
  onConfirm: () => void
}

export function TaxpayerDeleteConfirmAlert({
  open,
  onOpenChange,
  displayName,
  tin,
  isPending,
  onConfirm,
}: TaxpayerDeleteConfirmAlertProps) {
  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this taxpayer?"
      description={`Permanently delete ${displayName} (TIN: ${tin})? This cannot be undone.`}
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      confirmVariant="destructive"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}
