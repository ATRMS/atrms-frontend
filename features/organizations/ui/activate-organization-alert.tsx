"use client"

import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { useActivateOrganizationMutation } from "@/features/organizations/usecases/activate-organization.usecase"

export type ActivateOrganizationAlertProps = {
  organizationId: string
  organizationName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivateOrganizationAlert({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: ActivateOrganizationAlertProps) {
  const mutation = useActivateOrganizationMutation(organizationId)

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Activate organization?"
      description={<>Activate {organizationName}?</>}
      confirmLabel="Activate"
      isPending={mutation.isPending}
      onConfirm={() => {
        mutation.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        })
      }}
    />
  )
}
