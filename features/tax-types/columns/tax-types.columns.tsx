"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { TaxTypeListItem } from "@/features/tax-types/types"
import {
  formatTaxTypeDefaultRate,
  TaxTypeAuthorityBadge,
  TaxTypeCategoryBadge,
  TaxTypeRateTypeBadge,
  TaxTypeStatusBadge,
} from "@/features/tax-types/lib/tax-type-display"
import { TaxTypeRowActions } from "@/features/tax-types/ui/tax-type-row-actions"

export const taxTypesColumns: ColumnDef<TaxTypeListItem>[] = [
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <TaxTypeCategoryBadge category={row.original.category} />
    ),
  },
  {
    accessorKey: "rateType",
    header: "Rate type",
    cell: ({ row }) => (
      <TaxTypeRateTypeBadge rateType={row.original.rateType} />
    ),
  },
  {
    accessorKey: "defaultRate",
    header: "Default rate",
    cell: ({ row }) =>
      formatTaxTypeDefaultRate(
        row.original.rateType,
        row.original.defaultRate
      ),
  },
  {
    accessorKey: "collectingAuthority",
    header: "Collecting authority",
    cell: ({ row }) => (
      <TaxTypeAuthorityBadge authority={row.original.collectingAuthority} />
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <TaxTypeStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TaxTypeRowActions taxType={row.original} />,
  },
]
