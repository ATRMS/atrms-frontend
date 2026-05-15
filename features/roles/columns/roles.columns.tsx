"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { LockIcon } from "lucide-react"

import type { RoleListItem } from "@/features/roles/types"
import { RoleRowActions } from "@/features/roles/ui/role-row-actions"
import { Badge } from "@/components/ui/badge"

export const rolesColumns: ColumnDef<RoleListItem>[] = [
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
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <span>{row.original.name}</span>
        {row.original.isSystem ? (
          <Badge variant="secondary" className="gap-1 font-normal">
            <LockIcon className="size-3" />
            System
          </Badge>
        ) : null}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RoleRowActions role={row.original} />,
  },
]
