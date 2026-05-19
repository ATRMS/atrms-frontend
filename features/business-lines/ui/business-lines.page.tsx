"use client"

import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchBusinessLinesList } from "@/features/business-lines/api/business-lines-api"
import { businessLinesColumns } from "@/features/business-lines/columns/business-lines.columns"
import { BusinessLineCreateDialog } from "@/features/business-lines/ui/business-line-create-dialog"
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

export function BusinessLinesPage() {
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
      fallback={<PermissionDeniedFallback resourceLabel="business lines" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Business lines"
          description="Configure revenue business lines used across registrations and reporting."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Add business line
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={businessLinesColumns}
          queryKey={queryKeys.masterData.businessLinesLists()}
          queryFn={fetchBusinessLinesList}
          filters={filters}
          emptyMessage="No business lines match your filters."
        />

        <BusinessLineCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    </PermissionGate>
  )
}
