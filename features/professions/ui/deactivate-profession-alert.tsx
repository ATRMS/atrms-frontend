"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateProfessionMutation } from "@/features/professions/usecases/deactivate-profession.usecase"

export type DeactivateProfessionAlertProps = {
  professionId: string
  professionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateProfessionAlert({
  professionId,
  professionName,
  open,
  onOpenChange,
}: DeactivateProfessionAlertProps) {
  const mutation = useDeactivateProfessionMutation(professionId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate profession?"
      description={
        <>
          Deactivate {professionName}? It will no longer appear in new individual
          registration forms.
        </>
      }
      confirmLabel="Deactivate"
      confirmVariant="destructive"
      isPending={mutation.isPending}
      onConfirm={() => {
        mutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
