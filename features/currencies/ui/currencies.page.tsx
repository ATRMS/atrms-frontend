"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchCurrenciesList } from "@/features/currencies/api/currencies-api"
import { currenciesColumns } from "@/features/currencies/columns/currencies.columns"
import { CurrencyUpsertDialog } from "@/features/currencies/ui/currency-upsert-dialog"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { BasicDataTable } from "@/components/shared/basic-data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"

export function CurrenciesPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const listQuery = useQuery({
    queryKey: queryKeys.masterData.currenciesLists(),
    queryFn: fetchCurrenciesList,
  })

  const rows = listQuery.data?.data ?? []

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="currencies" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Currencies"
          description="Manage ISO currencies and the default for amounts across the system."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Add currency
              </Button>
            </PermissionGate>
          }
        />

        <BasicDataTable
          data={rows}
          columns={currenciesColumns}
          isPending={listQuery.isPending}
          isError={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No currencies loaded."
          errorMessage="Could not load currencies."
        />

        <CurrencyUpsertDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          currency={null}
        />
      </div>
    </PermissionGate>
  )
}
