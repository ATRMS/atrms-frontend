"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateBusinessLineMutation } from "@/features/business-lines/usecases/deactivate-business-line.usecase"

export type DeactivateBusinessLineAlertProps = {
  lineId: string
  lineName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateBusinessLineAlert({
  lineId,
  lineName,
  open,
  onOpenChange,
}: DeactivateBusinessLineAlertProps) {
  const deactivateMutation = useDeactivateBusinessLineMutation(lineId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate business line?"
      description={
        <>
          Deactivate {lineName}? It will no longer appear in new registrations.
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
