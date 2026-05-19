"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateTaxOfficeMutation } from "@/features/tax-offices/usecases/activate-tax-office.usecase"

export type ActivateTaxOfficeAlertProps = {
  taxOfficeId: string
  taxOfficeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateTaxOfficeAlert({
  taxOfficeId,
  taxOfficeName,
  open,
  onOpenChange,
}: ActivateTaxOfficeAlertProps) {
  const activateMutation = useActivateTaxOfficeMutation(taxOfficeId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate tax office?"
      description={
        <>
          Activate {taxOfficeName}? It will be available for assignment again.
        </>
      }
      confirmLabel="Activate"
      isPending={activateMutation.isPending}
      onConfirm={() => {
        activateMutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
