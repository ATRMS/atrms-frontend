"use client"

import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { notificationTemplatesColumns } from "@/features/notification-templates/columns/notification-templates.columns"
import { notificationTemplateFilters } from "@/features/notification-templates/lib/notification-templates-filters"
import { useNotificationTemplatesQuery } from "@/features/notification-templates/usecases/notification-templates-list.usecase"
import { NotificationTemplateCreateSheet } from "@/features/notification-templates/ui/notification-template-create-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { BasicDataTable } from "@/components/shared/basic-data-table"
import { useUrlSyncedBasicDataTableFilters } from "@/components/shared/use-basic-data-table-filters"
import { dataTableSelectFilterValue } from "@/components/data-table/data-table-filters"
import { Button } from "@/components/ui/button"
import type { NotificationChannel } from "@/features/notification-templates/types"

export function NotificationTemplatesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { filterValues, onFiltersPatch } = useUrlSyncedBasicDataTableFilters(
    notificationTemplateFilters
  )

  const channelParam = dataTableSelectFilterValue(filterValues, "channel") as
    | NotificationChannel
    | undefined

  const listQuery = useNotificationTemplatesQuery(
    channelParam ? { channel: channelParam } : undefined
  )

  const rows = listQuery.data ?? []

  return (
    <PermissionGate
      permission={PermissionCodes.systemConfig}
      fallback={
        <PermissionDeniedFallback resourceLabel="notification templates" />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Notification templates"
          description="Manage email and SMS templates for system notifications."
          action={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Add template
            </Button>
          }
        />

        <BasicDataTable
          data={rows}
          columns={notificationTemplatesColumns}
          isPending={listQuery.isPending}
          isError={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No templates match your filters."
          filters={notificationTemplateFilters}
          filterValues={filterValues}
          onFiltersPatch={onFiltersPatch}
        />

        <NotificationTemplateCreateSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>
    </PermissionGate>
  )
}
