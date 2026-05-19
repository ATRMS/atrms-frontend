"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateBankAccountMutation } from "@/features/bank-accounts/usecases/deactivate-bank-account.usecase"

export type DeactivateBankAccountAlertProps = {
  accountId: string
  accountLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateBankAccountAlert({
  accountId,
  accountLabel,
  open,
  onOpenChange,
}: DeactivateBankAccountAlertProps) {
  const deactivateMutation = useDeactivateBankAccountMutation(accountId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate bank account?"
      description={
        <>
          Deactivate {accountLabel}? It will no longer be offered for new payment
          routing until reactivated.
        </>
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
