"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useSetDefaultCurrencyMutation } from "@/features/currencies/usecases/set-default-currency.usecase"

export type SetDefaultCurrencyAlertProps = {
  currencyId: string
  currencyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetDefaultCurrencyAlert({
  currencyId,
  currencyName,
  open,
  onOpenChange,
}: SetDefaultCurrencyAlertProps) {
  const mutation = useSetDefaultCurrencyMutation(currencyId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Set default currency?"
      description={
        <>Set {currencyName} as the default currency for new amounts?</>
      }
      confirmLabel="Set as default"
      isPending={mutation.isPending}
      onConfirm={() => {
        mutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
