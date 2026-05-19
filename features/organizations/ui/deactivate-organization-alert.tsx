"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useDeactivateOrganizationMutation } from "@/features/organizations/usecases/deactivate-organization.usecase"

export type DeactivateOrganizationAlertProps = {
  organizationId: string
  organizationName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateOrganizationAlert({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: DeactivateOrganizationAlertProps) {
  const mutation = useDeactivateOrganizationMutation(organizationId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Deactivate organization?"
      description={
        <>
          Deactivate {organizationName}? It will be hidden from active employer
          selections until reactivated.
        </>
      }
      confirmLabel="Deactivate"
      confirmVariant="destructive"
      isPending={mutation.isPending}
      onConfirm={() => {
        mutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
