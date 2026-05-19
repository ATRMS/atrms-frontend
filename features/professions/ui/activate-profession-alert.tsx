"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateProfessionMutation } from "@/features/professions/usecases/activate-profession.usecase"

export type ActivateProfessionAlertProps = {
  professionId: string
  professionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateProfessionAlert({
  professionId,
  professionName,
  open,
  onOpenChange,
}: ActivateProfessionAlertProps) {
  const mutation = useActivateProfessionMutation(professionId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate profession?"
      description={<>Activate {professionName}?</>}
      confirmLabel="Activate"
      isPending={mutation.isPending}
      onConfirm={() => {
        mutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
