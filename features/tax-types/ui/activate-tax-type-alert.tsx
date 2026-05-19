"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateTaxTypeMutation } from "@/features/tax-types/usecases/activate-tax-type.usecase"

export type ActivateTaxTypeAlertProps = {
  taxTypeId: string
  taxTypeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateTaxTypeAlert({
  taxTypeId,
  taxTypeName,
  open,
  onOpenChange,
}: ActivateTaxTypeAlertProps) {
  const activateMutation = useActivateTaxTypeMutation(taxTypeId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate tax type?"
      description={
        <>Activate {taxTypeName}? It will be available for selection again.</>
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
