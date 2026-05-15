"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { usePatchUserStatusMutation } from "@/features/users/usecases/patch-user-status.usecase"

export type UserDeactivateConfirmAlertProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
}

export function UserDeactivateConfirmAlert({
  userId,
  open,
  onOpenChange,
  fullName,
}: UserDeactivateConfirmAlertProps) {
  const patchStatusMutation = usePatchUserStatusMutation(userId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate account?"
      description={
        <>
          {fullName} will not be able to sign in until an administrator
          activates the account again.
        </>
      }
      confirmLabel="Deactivate"
      confirmVariant="destructive"
      isPending={patchStatusMutation.isPending}
      onConfirm={() => {
        patchStatusMutation.mutate(
          { status: "INACTIVE" },
          { onSuccess: () => onOpenChange(false) }
        )
      }}
    />
  )
}
