"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { usePatchUserStatusMutation } from "@/features/users/usecases/patch-user-status.usecase"

export type UserActivateConfirmAlertProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
}

export function UserActivateConfirmAlert({
  userId,
  open,
  onOpenChange,
  fullName,
}: UserActivateConfirmAlertProps) {
  const patchStatusMutation = usePatchUserStatusMutation(userId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate account?"
      description={<>Restore access for {fullName}?</>}
      confirmLabel="Activate"
      isPending={patchStatusMutation.isPending}
      onConfirm={() => {
        patchStatusMutation.mutate(
          { status: "ACTIVE" },
          { onSuccess: () => onOpenChange(false) }
        )
      }}
    />
  )
}
