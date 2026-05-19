"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchOrganizationsList } from "@/features/organizations/api/organizations-api"
import { organizationsColumns } from "@/features/organizations/columns/organizations.columns"
import { OrganizationFormSheet } from "@/features/organizations/ui/organization-form-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import {
  businessLinesReferenceQueryOptions,
  taxOfficesReferenceSelectQueryOptions,
} from "@/lib/query/admin-reference-select-queries"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const

export function OrganizationsPage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )
  const { data: businessLines = [] } = useQuery(
    businessLinesReferenceQueryOptions()
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "isActive",
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
          ...[...taxOffices]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((o) => ({
              value: o.id,
              label: `${o.code} — ${o.name}`,
            })),
        ],
      },
      {
        type: "select",
        paramKey: "businessLineId",
        label: "Business line",
        placeholder: "Business line",
        widthClass: "w-[220px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All business lines" },
          ...[...businessLines]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((l) => ({
              value: l.id,
              label: `${l.code} — ${l.name}`,
            })),
        ],
      },
    ],
    [taxOffices, businessLines]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="organizations" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Organizations"
          description="Employer entities for individuals and corporate assessments."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setSheetOpen(true)}>
                Add organization
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={organizationsColumns}
          queryKey={queryKeys.masterData.organizationsLists()}
          queryFn={fetchOrganizationsList}
          filters={filters}
          emptyMessage="No organizations match your filters."
        />

        <PermissionGate permission={PermissionCodes.masterDataWrite}>
          <OrganizationFormSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            organization={null}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
