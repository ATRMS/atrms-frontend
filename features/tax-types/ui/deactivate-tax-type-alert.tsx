"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateTaxTypeMutation } from "@/features/tax-types/usecases/deactivate-tax-type.usecase"

export type DeactivateTaxTypeAlertProps = {
  taxTypeId: string
  taxTypeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateTaxTypeAlert({
  taxTypeId,
  taxTypeName,
  open,
  onOpenChange,
}: DeactivateTaxTypeAlertProps) {
  const deactivateMutation = useDeactivateTaxTypeMutation(taxTypeId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate tax type?"
      description={
        <>Deactivate {taxTypeName}? It will no longer appear for new use.</>
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
