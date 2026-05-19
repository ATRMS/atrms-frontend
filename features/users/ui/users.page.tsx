"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchUsersList } from "@/features/users/api/users-api"
import { usersColumns } from "@/features/users/columns/users.columns"
import { CreateUserSheet } from "@/features/users/ui/create-user-sheet"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import {
  rolesReferenceSelectQueryOptions,
  taxOfficesReferenceSelectQueryOptions,
} from "@/lib/query/admin-reference-select-queries"
import { queryKeys } from "@/lib/query-keys"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LOCKED", label: "Locked" },
  { value: "PENDING", label: "Pending" },
] as const

export function UsersPage() {
  const [createSheetOpen, setCreateSheetOpen] = useState(false)

  const { data: roles = [] } = useQuery(rolesReferenceSelectQueryOptions())

  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "roleId",
        label: "Role",
        placeholder: "Role",
        widthClass: "w-[160px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All roles" },
          ...roles.map((r) => ({ value: r.id, label: r.name })),
        ],
      },
      {
        type: "select",
        paramKey: "taxOfficeId",
        label: "Tax office",
        placeholder: "Tax office",
        widthClass: "w-[180px]",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All tax offices" },
          ...taxOffices.map((t) => ({ value: t.id, label: t.name })),
        ],
      },
      {
        type: "select",
        paramKey: "status",
        label: "Status",
        placeholder: "Status",
        widthClass: "w-[160px]",
        emptyValue: "__all__",
        options: [...STATUS_FILTER_OPTIONS],
      },
    ],
    [roles, taxOffices]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.userRead}
      fallback={<PermissionDeniedFallback resourceLabel="users" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Users"
          description="Manage IRS officer accounts, roles, and office assignments."
          action={
            <PermissionGate permission={PermissionCodes.userCreate}>
              <Button
                type="button"
                onClick={() => setCreateSheetOpen(true)}
              >
                Add user
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={usersColumns}
          queryKey={queryKeys.users.lists()}
          queryFn={fetchUsersList}
          filters={filters}
        />

        <CreateUserSheet open={createSheetOpen} onOpenChange={setCreateSheetOpen} />
      </div>
    </PermissionGate>
  )
}
