"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { BusinessLineListItem } from "@/features/business-lines/types"
import {
  BusinessLineSectorBadge,
  BusinessLineStatusBadge,
} from "@/features/business-lines/lib/business-line-display"
import { BusinessLineRowActions } from "@/features/business-lines/ui/business-line-row-actions"

export const businessLinesColumns: ColumnDef<BusinessLineListItem>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "sector",
    header: "Sector",
    cell: ({ row }) => (
      <BusinessLineSectorBadge sector={row.original.sector} />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <BusinessLineStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <BusinessLineRowActions line={row.original} />,
  },
]
