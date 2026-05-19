"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateBusinessLineMutation } from "@/features/business-lines/usecases/activate-business-line.usecase"

export type ActivateBusinessLineAlertProps = {
  lineId: string
  lineName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateBusinessLineAlert({
  lineId,
  lineName,
  open,
  onOpenChange,
}: ActivateBusinessLineAlertProps) {
  const activateMutation = useActivateBusinessLineMutation(lineId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate business line?"
      description={<>{lineName} will be available for new registrations.</>}
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
