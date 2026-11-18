"use client"

import { PencilIcon, PowerOffIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { NotificationTemplateListItem } from "@/features/notification-templates/types"
import { useDeactivateNotificationTemplateMutation } from "@/features/notification-templates/usecases/deactivate-notification-template.usecase"
import { NotificationTemplateEditSheet } from "@/features/notification-templates/ui/notification-template-edit-sheet"
import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function NotificationTemplateRowActions({
  row,
}: {
  row: NotificationTemplateListItem
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const deactivateMutation = useDeactivateNotificationTemplateMutation()

  const canConfig = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.systemWrite)
  )

  const items = []

  if (canConfig) {
    items.push({
      id: "edit",
      label: "Edit",
      icon: PencilIcon,
      onSelect: () => setEditOpen(true),
    })
  }

  if (canConfig && !row.isSystem && row.isActive) {
    items.push({
      id: "deactivate",
      label: "Deactivate",
      icon: PowerOffIcon,
      variant: "destructive" as const,
      onSelect: () => setDeactivateOpen(true),
    })
  }

  const groups = items.length > 0 ? [{ id: "actions", items }] : []

  if (groups.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={row.code}
        menuTitle={row.channel}
        groups={groups}
      />
      {canConfig ? (
        <NotificationTemplateEditSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          template={row}
        />
      ) : null}
      {canConfig && !row.isSystem ? (
        <ConfirmActionAlert
          open={deactivateOpen}
          onOpenChange={setDeactivateOpen}
          title="Deactivate this template?"
          description={`Deactivate ${row.code}? It will no longer be used for outbound notifications.`}
          confirmLabel="Deactivate"
          pendingLabel="Deactivating…"
          confirmVariant="destructive"
          isPending={deactivateMutation.isPending}
          onConfirm={() => {
            deactivateMutation.mutate(row.id, {
              onSuccess: () => setDeactivateOpen(false),
            })
          }}
        />
      ) : null}
    </>
  )
}
