"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { CurrencyListItem } from "@/features/currencies/types"
import { CurrencyDefaultStar } from "@/features/currencies/lib/currency-display"
import { CurrencyRowActions } from "@/features/currencies/ui/currency-row-actions"

export const currenciesColumns: ColumnDef<CurrencyListItem>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => <span className="text-lg">{row.original.symbol}</span>,
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) => (
      <CurrencyDefaultStar isDefault={row.original.isDefault} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <CurrencyRowActions currency={row.original} />,
  },
]
