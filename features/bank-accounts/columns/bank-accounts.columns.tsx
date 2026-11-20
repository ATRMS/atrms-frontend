"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import type { ColumnDef } from "@tanstack/react-table"

import type { BankAccountListItem } from "@/features/bank-accounts/types"
import { BankAccountStatusBadge } from "@/features/bank-accounts/lib/bank-account-display"
import { BankAccountRowActions } from "@/features/bank-accounts/ui/bank-account-row-actions"
import { taxTypesReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

function TaxTypeCell({ taxTypeId }: { taxTypeId: string | null }) {
  const { data: types = [] } = useQuery(taxTypesReferenceQueryOptions())

  const label = useMemo(() => {
    if (!taxTypeId) return "—"
    const t = types.find((x) => x.id === taxTypeId)
    if (t) return `${t.code} — ${t.name}`
    return taxTypeId
  }, [taxTypeId, types])

  if (!taxTypeId) return <span className="text-muted-foreground">—</span>

  const resolved = types.some((x) => x.id === taxTypeId)

  if (resolved) {
    return <span className="text-sm">{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}

export const bankAccountsColumns: ColumnDef<BankAccountListItem>[] = [
  {
    accessorKey: "accountNumber",
    header: "Account number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.accountNumber}</span>
    ),
  },
  {
    accessorKey: "accountName",
    header: "Account name",
  },
  {
    id: "bank",
    header: "Bank",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{row.original.bankName}</span>
      </div>
    ),
  },
  {
    accessorKey: "taxTypeId",
    header: "Tax type",
    cell: ({ row }) => <TaxTypeCell taxTypeId={row.original.taxTypeId} />,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <BankAccountStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <BankAccountRowActions account={row.original} />,
  },
]
