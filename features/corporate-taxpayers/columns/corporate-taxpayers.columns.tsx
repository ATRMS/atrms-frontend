"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { CorporateTaxpayerListItem } from "@/features/corporate-taxpayers/types"
import {
  CompanyTypeBadge,
  formatCorporateAnnualTurnover,
  TaxpayerStatusBadge,
} from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"
import { CorporateTaxpayerRowActions } from "@/features/corporate-taxpayers/ui/corporate-taxpayer-row-actions"
import { TaxOfficeNameCell } from "@/components/shared/tax-office-name-cell"
import { Badge } from "@/components/ui/badge"

export const corporateTaxpayersColumns: ColumnDef<CorporateTaxpayerListItem>[] =
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
      header: "Company name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.displayName}</span>
      ),
    },
    {
      accessorKey: "companyType",
      header: "Type",
      cell: ({ row }) => (
        <CompanyTypeBadge companyType={row.original.companyType} />
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
      accessorKey: "annualTurnover",
      header: "Annual turnover",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatCorporateAnnualTurnover(row.original.annualTurnover)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TaxpayerStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <CorporateTaxpayerRowActions row={row.original} />,
    },
  ]
