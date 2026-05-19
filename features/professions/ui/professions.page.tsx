"use client"

import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchProfessionsList } from "@/features/professions/api/professions-api"
import { professionsColumns } from "@/features/professions/columns/professions.columns"
import { ProfessionUpsertDialog } from "@/features/professions/ui/profession-upsert-dialog"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const

export function ProfessionsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search code or name…",
      },
      {
        type: "select",
        paramKey: "isActive",
        label: "Status",
        placeholder: "Status",
        widthClass: "w-[160px]",
        emptyValue: "__all__",
        options: [...STATUS_FILTER_OPTIONS],
      },
    ],
    []
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="professions" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Professions"
          description="Maintain occupation codes used on individual registrations."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Add profession
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={professionsColumns}
          queryKey={queryKeys.masterData.professionsLists()}
          queryFn={fetchProfessionsList}
          filters={filters}
          emptyMessage="No professions match your filters."
        />

        <PermissionGate permission={PermissionCodes.masterDataWrite}>
          <ProfessionUpsertDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            profession={null}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
