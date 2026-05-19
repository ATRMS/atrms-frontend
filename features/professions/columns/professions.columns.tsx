"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { ProfessionListItem } from "@/features/professions/types"
import { ProfessionStatusBadge } from "@/features/professions/lib/profession-display"
import { ProfessionRowActions } from "@/features/professions/ui/profession-row-actions"

export const professionsColumns: ColumnDef<ProfessionListItem>[] = [
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
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <ProfessionStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ProfessionRowActions profession={row.original} />,
  },
]
