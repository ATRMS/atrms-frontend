"use client"

import { format, isValid, parseISO } from "date-fns"

import type { ColumnDef } from "@tanstack/react-table"

import type { UnifiedTaxpayerListItem } from "@/features/taxpayers/types"
import { RegistryTaxpayerTypeBadge } from "@/features/taxpayers/lib/registry-taxpayer-display"
import { TaxpayerStatusBadge } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { TaxOfficeNameCell } from "@/components/shared/tax-office-name-cell"
import { Badge } from "@/components/ui/badge"

export function taxpayerRegistryProfileHref(row: {
  id: string
  taxpayerType: UnifiedTaxpayerListItem["taxpayerType"]
}): string {
  return row.taxpayerType === "INDIVIDUAL"
    ? `/admin/taxpayers/individuals/${row.id}`
    : `/admin/taxpayers/corporates/${row.id}`
}

export const allTaxpayersColumns: ColumnDef<UnifiedTaxpayerListItem>[] = [
  {
    accessorKey: "tin",
    header: "TIN",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs font-normal">
        {row.original.tin}
      </Badge>
    ),
  },
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.displayName}</span>
    ),
  },
  {
    accessorKey: "taxpayerType",
    header: "Type",
    cell: ({ row }) => (
      <RegistryTaxpayerTypeBadge taxpayerType={row.original.taxpayerType} />
    ),
  },
  {
    accessorKey: "taxOfficeId",
    header: "Tax office",
    cell: ({ row }) => (
      <TaxOfficeNameCell taxOfficeId={row.original.taxOfficeId} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <TaxpayerStatusBadge status={row.original.status} />
    ),
  },
  {
    accessorKey: "registeredAt",
    header: "Registered",
    cell: ({ row }) => {
      const raw = row.original.registeredAt
      const parsed = parseISO(raw)
      return (
        <span className="text-sm text-muted-foreground">
          {isValid(parsed) ? format(parsed, "MMM d, yyyy") : raw}
        </span>
      )
    },
  },
]
