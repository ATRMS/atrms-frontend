"use client"

import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchRegionsList } from "@/features/regions/api/regions-api"
import { regionsColumns } from "@/features/regions/columns/regions.columns"
import { REGION_TYPE_LABELS } from "@/features/regions/lib/region-display"
import { REGION_TYPE_VALUES } from "@/features/regions/types"
import { RegionUpsertDialog } from "@/features/regions/ui/region-upsert-dialog"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"

const TYPE_FILTER_OPTIONS = [
  { value: "__all__", label: "All types" },
  ...REGION_TYPE_VALUES.map((v) => ({
    value: v,
    label: REGION_TYPE_LABELS[v],
  })),
] as const

export function RegionsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "type",
        label: "Type",
        placeholder: "Type",
        widthClass: "w-[200px]",
        emptyValue: "__all__",
        options: [...TYPE_FILTER_OPTIONS],
      },
    ],
    []
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="regions" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Regions"
          description="Manage states, LGAs, senatorial districts, and federal constituencies."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Add region
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={regionsColumns}
          queryKey={queryKeys.masterData.regionsLists()}
          queryFn={fetchRegionsList}
          filters={filters}
          emptyMessage="No regions match your filters."
        />

        <RegionUpsertDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          region={null}
        />
      </div>
    </PermissionGate>
  )
}
