"use client"

import { EyeIcon } from "lucide-react"
import { useState } from "react"

import { AuditLogDetailSheet } from "@/features/audit-logs/ui/audit-log-detail-sheet"
import type { AuditLogListItem } from "@/features/audit-logs/types"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function AuditLogRowActions({ row }: { row: AuditLogListItem }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <DataTableRowActions
        subjectLabel={row.entityType}
        menuTitle={row.action}
        groups={[
          {
            id: "actions",
            items: [
              {
                id: "view",
                label: "View details",
                icon: EyeIcon,
                onSelect: () => setDetailOpen(true),
              },
            ],
          },
        ]}
      />
      <AuditLogDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        auditLogId={row.id}
        listItem={row}
      />
    </>
  )
}
