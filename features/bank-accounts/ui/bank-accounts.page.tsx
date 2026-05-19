"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchBankAccountsList } from "@/features/bank-accounts/api/bank-accounts-api"
import { bankAccountsColumns } from "@/features/bank-accounts/columns/bank-accounts.columns"
import { BankAccountFormSheet } from "@/features/bank-accounts/ui/bank-account-form-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { BasicDataTable } from "@/components/shared/basic-data-table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { queryKeys } from "@/lib/query-keys"
import { taxTypesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

const STATUS_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const

export function BankAccountsPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [taxTypeFilter, setTaxTypeFilter] = useState("__all__")
  const [statusFilter, setStatusFilter] = useState("__all__")

  const { data: taxTypes = [] } = useQuery(taxTypesActiveReferenceQueryOptions())

  const listParams = useMemo(() => {
    const taxTypeId =
      taxTypeFilter !== "__all__" ? taxTypeFilter : undefined
    let isActive: boolean | undefined
    if (statusFilter === "true") isActive = true
    else if (statusFilter === "false") isActive = false

    return {
      ...(taxTypeId ? { taxTypeId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    }
  }, [taxTypeFilter, statusFilter])

  const listQuery = useQuery({
    queryKey: [...queryKeys.masterData.bankAccountsLists(), listParams] as const,
    queryFn: () => fetchBankAccountsList(listParams),
  })

  const rows = listQuery.data?.data ?? []

  const taxTypeSelectOptions = useMemo(
    () => [...taxTypes].sort((a, b) => a.name.localeCompare(b.name)),
    [taxTypes]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="bank accounts" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Bank accounts"
          description="Configure revenue collection accounts by tax type."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setSheetOpen(true)}>
                Add bank account
              </Button>
            </PermissionGate>
          }
        />

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bank-filter-tax-type">Tax type</Label>
            <Select value={taxTypeFilter} onValueChange={setTaxTypeFilter}>
              <SelectTrigger id="bank-filter-tax-type" className="w-[220px]">
                <SelectValue placeholder="Tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">All tax types</SelectItem>
                  {taxTypeSelectOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.code} — {t.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bank-filter-status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="bank-filter-status" className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <BasicDataTable
          data={rows}
          columns={bankAccountsColumns}
          isPending={listQuery.isPending}
          isError={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No bank accounts match your filters."
          errorMessage="Could not load bank accounts."
        />

        <PermissionGate permission={PermissionCodes.masterDataWrite}>
          <BankAccountFormSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            bankAccount={null}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
