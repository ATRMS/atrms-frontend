"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateTaxOfficeMutation } from "@/features/tax-offices/usecases/deactivate-tax-office.usecase"

export type DeactivateTaxOfficeAlertProps = {
  taxOfficeId: string
  taxOfficeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateTaxOfficeAlert({
  taxOfficeId,
  taxOfficeName,
  open,
  onOpenChange,
}: DeactivateTaxOfficeAlertProps) {
  const deactivateMutation = useDeactivateTaxOfficeMutation(taxOfficeId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate tax office?"
      description={
        <>
          Deactivate {taxOfficeName}? Users and taxpayers should be reassigned
          first if this office is still in use.
        </>
      }
      confirmLabel="Deactivate"
      confirmVariant="destructive"
      isPending={deactivateMutation.isPending}
      onConfirm={() => {
        deactivateMutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
