"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchRevenueTargetsList } from "@/features/revenue-targets/api/revenue-targets-api"
import { buildRevenueTargetsColumns } from "@/features/revenue-targets/columns/revenue-targets.columns"
import { getCurrentCalendarYear } from "@/features/revenue-targets/lib/revenue-target-format"
import { RevenueTargetDialog } from "@/features/revenue-targets/ui/revenue-target-dialog"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { taxTypesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"
import { queryKeys } from "@/lib/query-keys"

export function RevenueTargetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: taxTypes = [] } = useQuery(
    taxTypesActiveReferenceQueryOptions()
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "number",
        paramKey: "fiscalYear",
        label: "Fiscal year",
        placeholder: "Year",
        widthClass: "w-[120px]",
      },
      {
        type: "select",
        paramKey: "taxTypeId",
        label: "Tax type",
        placeholder: "Tax type",
        widthClass: "w-[200px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All tax types" },
          ...[...taxTypes]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((t) => ({
              value: t.id,
              label: `${t.code} — ${t.name}`,
            })),
        ],
      },
    ],
    [taxTypes]
  )

  const columns = useMemo(
    () => buildRevenueTargetsColumns(getCurrentCalendarYear()),
    []
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="revenue targets" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Revenue targets"
          description="Set fiscal-year collection targets by tax type and currency."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setDialogOpen(true)}>
                Set target
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.revenueTargetsLists()}
          queryFn={fetchRevenueTargetsList}
          filters={filters}
          emptyMessage="No revenue targets match your filters."
        />

        <PermissionGate permission={PermissionCodes.masterDataWrite}>
          <RevenueTargetDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editingRow={null}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
