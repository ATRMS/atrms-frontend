"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchCorporateTaxpayersList } from "@/features/corporate-taxpayers/api/corporate-taxpayers-api"
import { corporateTaxpayersColumns } from "@/features/corporate-taxpayers/columns/corporate-taxpayers.columns"
import { CORPORATE_COMPANY_TYPES } from "@/features/corporate-taxpayers/schemas"
import { companyTypeLabel } from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"
import { RegisterCorporateSheet } from "@/features/corporate-taxpayers/ui/register-corporate-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { taxOfficesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLACKLISTED", label: "Blacklisted" },
  { value: "DECEASED", label: "Deceased" },
] as const

export type CorporateTaxpayersPageProps = {
  tin?: string
}

export function CorporateTaxpayersPage({
  tin: tinFromServer,
}: CorporateTaxpayersPageProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [manualSheetOpen, setManualSheetOpen] = useState(false)
  const tinForRegistration = tinFromServer?.trim() ?? ""
  const sheetOpen = manualSheetOpen || Boolean(tinForRegistration)

  function handleSheetOpenChange(open: boolean) {
    setManualSheetOpen(open)
    if (!open && tinForRegistration) {
      const sp = new URLSearchParams(searchParams.toString())
      sp.delete("tin")
      const qs = sp.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }

  const { data: activeTaxOffices = [] } = useQuery(
    taxOfficesActiveReferenceQueryOptions()
  )

  const companyTypeFilterOptions = useMemo(
    () => [
      { value: "__all__", label: "All company types" },
      ...CORPORATE_COMPANY_TYPES.map((value) => ({
        value,
        label: companyTypeLabel(value),
      })),
    ],
    []
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search by TIN, company name, or phone…",
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
        paramKey: "companyType",
        label: "Company type",
        placeholder: "Company type",
        widthClass: "w-[200px]",
        emptyValue: "__all__",
        options: companyTypeFilterOptions,
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
    [activeTaxOffices, companyTypeFilterOptions]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.taxpayerRead}
      fallback={
        <PermissionDeniedFallback resourceLabel="corporate taxpayers" />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Corporate taxpayers"
          description="Register companies and manage profiles, classification, and registry status."
          action={
            <PermissionGate permission={PermissionCodes.taxpayerCreate}>
              <Button type="button" onClick={() => setManualSheetOpen(true)}>
                Register corporate
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={corporateTaxpayersColumns}
          queryKey={queryKeys.taxpayers.corporatesLists()}
          queryFn={fetchCorporateTaxpayersList}
          filters={filters}
          emptyMessage="No corporate taxpayers match your filters."
        />

        <PermissionGate permission={PermissionCodes.taxpayerCreate}>
          <RegisterCorporateSheet
            open={sheetOpen}
            onOpenChange={handleSheetOpenChange}
            initialTin={tinForRegistration || undefined}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
