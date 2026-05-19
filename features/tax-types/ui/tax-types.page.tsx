"use client"

import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchTaxTypesList } from "@/features/tax-types/api/tax-types-api"
import { taxTypesColumns } from "@/features/tax-types/columns/tax-types.columns"
import { TaxTypeFormSheet } from "@/features/tax-types/ui/tax-type-form-sheet"
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

export function TaxTypesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search code or name…",
      },
      {
        type: "text",
        paramKey: "category",
        label: "Category",
        placeholder: "e.g. DIRECT",
        widthClass: "w-[140px]",
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
      fallback={<PermissionDeniedFallback resourceLabel="tax types" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Tax types"
          description="Define tax categories, rate behaviour, and collecting authorities."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setSheetOpen(true)}>
                Add tax type
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={taxTypesColumns}
          queryKey={queryKeys.masterData.taxTypesLists()}
          queryFn={fetchTaxTypesList}
          filters={filters}
          emptyMessage="No tax types match your filters."
        />

        <TaxTypeFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          taxType={null}
        />
      </div>
    </PermissionGate>
  )
}
