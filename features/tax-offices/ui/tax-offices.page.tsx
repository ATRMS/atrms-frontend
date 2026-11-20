"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchTaxOfficesList } from "@/features/tax-offices/api/tax-offices-api"
import { taxOfficesColumns } from "@/features/tax-offices/columns/tax-offices.columns"
import { TaxOfficeFormSheet } from "@/features/tax-offices/ui/tax-office-form-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { lookupsQueryOptions } from "@/lib/query/lookups"
import { queryKeys } from "@/lib/query-keys"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const

export function TaxOfficesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: lookups } = useQuery(lookupsQueryOptions(["regions"]))
  const regions = useMemo(() => lookups?.regions ?? [], [lookups?.regions])

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search code, name, phone, or email…",
      },
      {
        type: "select",
        paramKey: "regionId",
        label: "Region",
        placeholder: "Region",
        widthClass: "w-[160px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All regions" },
          ...[...regions]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((r) => ({
              value: r.id,
              label: `${r.code} — ${r.name}`,
            })),
        ],
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
    [regions]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="tax offices" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Tax offices"
          description="Manage regional IRS offices, contact details, and assignments."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setSheetOpen(true)}>
                Add tax office
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={taxOfficesColumns}
          queryKey={queryKeys.masterData.taxOfficesLists()}
          queryFn={fetchTaxOfficesList}
          filters={filters}
          emptyMessage="No tax offices match your filters."
        />

        <TaxOfficeFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          taxOffice={null}
        />
      </div>
    </PermissionGate>
  )
}
