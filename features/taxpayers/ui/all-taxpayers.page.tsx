"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchAllTaxpayersList } from "@/features/taxpayers/api/taxpayers-registry-api"
import {
  allTaxpayersColumns,
  taxpayerRegistryProfileHref,
} from "@/features/taxpayers/columns/all-taxpayers.columns"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { queryKeys } from "@/lib/query-keys"
import { taxOfficesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLACKLISTED", label: "Blacklisted" },
  { value: "DECEASED", label: "Deceased" },
] as const

export function AllTaxpayersPage() {
  const { data: activeTaxOffices = [] } = useQuery(
    taxOfficesActiveReferenceQueryOptions()
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search by TIN, name, or phone…",
      },
      {
        type: "select",
        paramKey: "status",
        label: "Status",
        placeholder: "Status",
        widthClass: "w-[160px]",
        emptyValue: "__all__",
        options: [...STATUS_FILTER_OPTIONS],
      },
      {
        type: "select",
        paramKey: "taxOfficeId",
        label: "Tax office",
        placeholder: "Tax office",
        widthClass: "w-[220px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All tax offices" },
          ...[...activeTaxOffices]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((o) => ({
              value: o.id,
              label: `${o.code} — ${o.name}`,
            })),
        ],
      },
    ],
    [activeTaxOffices]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.taxpayerRead}
      fallback={<PermissionDeniedFallback resourceLabel="taxpayer registry" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="All taxpayers"
          description="Search and open individual or corporate profiles from one list."
        />

        <DataTable
          columns={allTaxpayersColumns}
          queryKey={queryKeys.taxpayers.unifiedLists()}
          queryFn={fetchAllTaxpayersList}
          filters={filters}
          emptyMessage="No taxpayers match your filters."
          getRowHref={taxpayerRegistryProfileHref}
        />
      </div>
    </PermissionGate>
  )
}
