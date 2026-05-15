"use client"

import type { RoleListItem } from "@/features/roles/types"
import { useDeleteRoleMutation } from "@/features/roles/usecases/delete-role.usecase"
import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"

export type DeleteRoleAlertProps = {
  role: RoleListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after successful delete (e.g. navigate away). */
  onDeleted?: () => void
}

export function DeleteRoleAlert({
  role,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRoleAlertProps) {
  const mutation = useDeleteRoleMutation()

  return (
    <ConfirmActionAlert
      open={open}
      onOpenChange={onOpenChange}
      title="Delete role?"
      description={
        role ? (
          <>
            Permanently delete{" "}
            <span className="font-medium text-foreground">{role.name}</span>{" "}
            <span className="font-mono text-muted-foreground">
              ({role.code})
            </span>
            ? This cannot be undone. If the role is still assigned to users,
            the server may reject the request until they are reassigned.
          </>
        ) : null
      }
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      confirmVariant="destructive"
      confirmDisabled={!role}
      isPending={mutation.isPending}
      onConfirm={() => {
        if (!role) return

        mutation.mutate(role.id, {
          onSuccess: () => {
            onOpenChange(false)
            onDeleted?.()
          },
        })
      }}
    />
  )
}
