"use client"

import { format, isValid, parseISO } from "date-fns"

import type { ColumnDef } from "@tanstack/react-table"

import type { IndividualTaxpayerListItem } from "@/features/individual-taxpayers/types"
import { TaxpayerStatusBadge } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { IndividualTaxpayerRowActions } from "@/features/individual-taxpayers/ui/individual-taxpayer-row-actions"
import { TaxOfficeNameCell } from "@/components/shared/tax-office-name-cell"
import { Badge } from "@/components/ui/badge"

export const individualTaxpayersColumns: ColumnDef<IndividualTaxpayerListItem>[] =
  [
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
      header: "Full name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.displayName}</span>
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <IndividualTaxpayerRowActions row={row.original} />,
    },
  ]
