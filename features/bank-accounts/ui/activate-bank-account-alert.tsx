"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateBankAccountMutation } from "@/features/bank-accounts/usecases/activate-bank-account.usecase"

export type ActivateBankAccountAlertProps = {
  accountId: string
  accountLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateBankAccountAlert({
  accountId,
  accountLabel,
  open,
  onOpenChange,
}: ActivateBankAccountAlertProps) {
  const activateMutation = useActivateBankAccountMutation(accountId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate bank account?"
      description={<>Activate {accountLabel}?</>}
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
