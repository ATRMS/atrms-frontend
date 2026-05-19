"use client"

import { PencilLineIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { RegionListItem } from "@/features/regions/types"
import { RegionUpsertDialog } from "@/features/regions/ui/region-upsert-dialog"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"

export function RegionRowActions({ region }: { region: RegionListItem }) {
  const [editOpen, setEditOpen] = useState(false)

  const canWrite = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.masterDataWrite)
  )

  if (!canWrite) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DataTableRowActions
        subjectLabel={region.name}
        menuTitle={region.code}
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
      <RegionUpsertDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        region={region}
      />
    </>
  )
}
