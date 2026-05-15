"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useResetUserPasswordMutation } from "@/features/users/usecases/reset-user-password.usecase"

export type UserResetPasswordConfirmAlertProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
  onTemporaryPassword: (temporaryPassword: string) => void
}

export function UserResetPasswordConfirmAlert({
  userId,
  open,
  onOpenChange,
  fullName,
  onTemporaryPassword,
}: UserResetPasswordConfirmAlertProps) {
  const resetMutation = useResetUserPasswordMutation(userId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Reset password?"
      description={
        <>
          Reset {fullName}&apos;s password? A new temporary password will be
          generated.
        </>
      }
      confirmLabel="Reset password"
      pendingLabel="Resetting…"
      isPending={resetMutation.isPending}
      onConfirm={() => {
        resetMutation.mutate(undefined, {
          onSuccess: (data) => {
            onOpenChange(false)
            onTemporaryPassword(data.temporaryPassword)
          },
        })
      }}
    />
  )
}
