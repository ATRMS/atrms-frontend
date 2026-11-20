"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchIndividualTaxpayersList } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import { individualTaxpayersColumns } from "@/features/individual-taxpayers/columns/individual-taxpayers.columns"
import { RegisterIndividualSheet } from "@/features/individual-taxpayers/ui/register-individual-sheet"
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
  professionsActiveReferenceQueryOptions,
  taxOfficesActiveReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLACKLISTED", label: "Blacklisted" },
  { value: "DECEASED", label: "Deceased" },
] as const

export type IndividualsTaxpayersPageProps = {
  /** From server `searchParams.tin` — opens register sheet and pre-fills TIN when set. */
  tin?: string
}

export function IndividualsTaxpayersPage({
  tin: tinFromServer,
}: IndividualsTaxpayersPageProps) {
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

  const { data: professions = [] } = useQuery(
    professionsActiveReferenceQueryOptions()
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "search",
        placeholder: "Search by TIN, name, or phone number…",
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
      {
        type: "select",
        paramKey: "professionId",
        label: "Profession",
        placeholder: "Profession",
        widthClass: "w-[220px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All professions" },
          ...[...professions]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => ({
              value: p.id,
              label: `${p.code} — ${p.name}`,
            })),
        ],
      },
    ],
    [activeTaxOffices, professions]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.taxpayerRead}
      fallback={
        <PermissionDeniedFallback resourceLabel="individual taxpayers" />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Individual taxpayers"
          description="Register individuals and manage profiles, classification, and registry status."
          action={
            <PermissionGate permission={PermissionCodes.taxpayerCreate}>
              <Button type="button" onClick={() => setManualSheetOpen(true)}>
                Register individual
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={individualTaxpayersColumns}
          queryKey={queryKeys.taxpayers.individualsLists()}
          queryFn={fetchIndividualTaxpayersList}
          filters={filters}
          emptyMessage="No individual taxpayers match your filters."
        />

        <PermissionGate permission={PermissionCodes.taxpayerCreate}>
          <RegisterIndividualSheet
            open={sheetOpen}
            onOpenChange={handleSheetOpenChange}
            initialTin={tinForRegistration || undefined}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
