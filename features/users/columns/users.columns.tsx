"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { UserListItem } from "@/features/users/types"
import {
  formatRoleLabel,
  formatUserFullName,
  UserStatusBadge,
} from "@/features/users/lib/user-display"
import { UserRowActions } from "@/features/users/ui/user-row-actions"

export const usersColumns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: "staffId",
    header: "Staff ID",
    cell: ({ row }) =>
      row.original.staffId ? (
        <span className="font-mono text-sm">{row.original.staffId}</span>
      ) : (
        "—"
      ),
  },
  {
    id: "fullName",
    accessorFn: (row) => formatUserFullName(row),
    header: "Full name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.username}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    id: "role",
    accessorFn: (row) => row.role,
    header: "Role",
    cell: ({ row }) => formatRoleLabel(row.original.role),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
]
