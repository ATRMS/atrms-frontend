"use client"

import { useQuery } from "@tanstack/react-query"
import { LockIcon } from "lucide-react"
import { useMemo } from "react"

import type { ColumnDef } from "@tanstack/react-table"

import { formatTargetAmountDisplay } from "@/features/revenue-targets/lib/revenue-target-format"
import type { RevenueTargetListItem } from "@/features/revenue-targets/types"
import { RevenueTargetRowActions } from "@/features/revenue-targets/ui/revenue-target-row-actions"
import {
  currenciesReferenceQueryOptions,
  taxTypesReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"

function TaxTypeNameCell({ taxTypeId }: { taxTypeId: string }) {
  const { data: types = [] } = useQuery(taxTypesReferenceQueryOptions())

  const label = useMemo(() => {
    const t = types.find((x) => x.id === taxTypeId)
    if (t) return `${t.code} — ${t.name}`
    return taxTypeId
  }, [taxTypeId, types])

  const isResolved = types.some((x) => x.id === taxTypeId)

  if (isResolved) {
    return <span className="text-sm">{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}

function FiscalYearCell({
  fiscalYear,
  isPastYear,
}: {
  fiscalYear: number
  isPastYear: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm tabular-nums">{fiscalYear}</span>
      {isPastYear ? (
        <LockIcon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-label="Past fiscal year — read only"
        />
      ) : null}
    </div>
  )
}

function TargetAmountCell({
  amount,
  currencyId,
}: {
  amount: number
  currencyId: string
}) {
  const { data: currencies = [] } = useQuery(currenciesReferenceQueryOptions())

  const symbol = useMemo(() => {
    const c = currencies.find((x) => x.id === currencyId)
    return c?.symbol ?? ""
  }, [currencies, currencyId])

  return (
    <span className="text-sm tabular-nums">
      {formatTargetAmountDisplay(amount, symbol)}
    </span>
  )
}

export function buildRevenueTargetsColumns(
  currentCalendarYear: number
): ColumnDef<RevenueTargetListItem>[] {
  return [
    {
      accessorKey: "taxTypeId",
      header: "Tax type",
      cell: ({ row }) => <TaxTypeNameCell taxTypeId={row.original.taxTypeId} />,
    },
    {
      accessorKey: "fiscalYear",
      header: "Fiscal year",
      cell: ({ row }) => (
        <FiscalYearCell
          fiscalYear={row.original.fiscalYear}
          isPastYear={row.original.fiscalYear < currentCalendarYear}
        />
      ),
    },
    {
      accessorKey: "targetAmount",
      header: "Target amount",
      cell: ({ row }) => (
        <TargetAmountCell
          amount={row.original.targetAmount}
          currencyId={row.original.currencyId}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <RevenueTargetRowActions target={row.original} />,
    },
  ]
}
