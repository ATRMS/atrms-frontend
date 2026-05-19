"use client"

import { PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { getCurrentCalendarYear } from "@/features/revenue-targets/lib/revenue-target-format"
import type { RevenueTargetListItem } from "@/features/revenue-targets/types"
import { RevenueTargetDialog } from "@/features/revenue-targets/ui/revenue-target-dialog"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function RevenueTargetRowActions({
  target,
}: {
  target: RevenueTargetListItem
}) {
  const [editOpen, setEditOpen] = useState(false)

  const canWrite = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.masterDataWrite)
  )

  const currentYear = getCurrentCalendarYear()
  const isPastYear = target.fiscalYear < currentYear

  if (!canWrite || isPastYear) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={`FY ${target.fiscalYear}`}
        menuTitle="Revenue target"
        groups={[
          {
            id: "primary",
            items: [
              {
                id: "edit",
                label: "Edit",
                icon: PencilLineIcon,
                onSelect: () => setEditOpen(true),
              },
            ],
          },
        ]}
      />
      <RevenueTargetDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editingRow={target}
      />
    </>
  )
}
