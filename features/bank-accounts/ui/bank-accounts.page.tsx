"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchBankAccountsList } from "@/features/bank-accounts/api/bank-accounts-api"
import { bankAccountsColumns } from "@/features/bank-accounts/columns/bank-accounts.columns"
import {
  bankAccountFilters,
  bankAccountsListParamsFromFilters,
} from "@/features/bank-accounts/lib/bank-accounts-filters"
import { BankAccountFormSheet } from "@/features/bank-accounts/ui/bank-account-form-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { BasicDataTable } from "@/components/shared/basic-data-table"
import { useUrlSyncedBasicDataTableFilters } from "@/components/shared/use-basic-data-table-filters"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { taxTypesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

export function BankAccountsPage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: taxTypes = [] } = useQuery(taxTypesActiveReferenceQueryOptions())

  const taxTypeSelectOptions = useMemo(
    () => [...taxTypes].sort((a, b) => a.name.localeCompare(b.name)),
    [taxTypes]
  )

  const filters = useMemo(
    () => bankAccountFilters(taxTypeSelectOptions),
    [taxTypeSelectOptions]
  )

  const { filterValues, onFiltersPatch } =
    useUrlSyncedBasicDataTableFilters(filters)

  const listParams = useMemo(
    () => bankAccountsListParamsFromFilters(filterValues),
    [filterValues]
  )

  const listQuery = useQuery({
    queryKey: [...queryKeys.masterData.bankAccountsLists(), listParams] as const,
    queryFn: () => fetchBankAccountsList(listParams),
  })

  const rows = listQuery.data?.data ?? []

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

        <BasicDataTable
          data={rows}
          columns={bankAccountsColumns}
          isPending={listQuery.isPending}
          isError={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No bank accounts match your filters."
          errorMessage="Could not load bank accounts."
          filters={filters}
          filterValues={filterValues}
          onFiltersPatch={onFiltersPatch}
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
