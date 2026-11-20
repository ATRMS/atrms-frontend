"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { usePatchUserStatusMutation } from "@/features/users/usecases/patch-user-status.usecase"

export type UserUnlockConfirmAlertProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
}

export function UserUnlockConfirmAlert({
  userId,
  open,
  onOpenChange,
  fullName,
}: UserUnlockConfirmAlertProps) {
  const patchStatusMutation = usePatchUserStatusMutation(userId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Unlock account?"
      description={
        <>Unlock {fullName}&apos;s account and restore active access?</>
      }
      confirmLabel="Unlock"
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
