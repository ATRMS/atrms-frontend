"use client"

import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { rolesColumns } from "@/features/roles/columns/roles.columns"
import type { CreateRoleDetailsValues } from "@/features/roles/schemas"
import { CreateRoleDetailsDialog } from "@/features/roles/ui/create-role-details-dialog"
import { CreateRolePermissionsSheet } from "@/features/roles/ui/create-role-permissions-sheet"
import { useRolesListQuery } from "@/features/roles/usecases/roles-list.usecase"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { BasicDataTable } from "@/components/shared/basic-data-table"
import { Button } from "@/components/ui/button"

export function RolesPage() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [permissionsSheetOpen, setPermissionsSheetOpen] = useState(false)
  const [roleDraft, setRoleDraft] = useState<CreateRoleDetailsValues | null>(
    null
  )

  const listQuery = useRolesListQuery()

  function handleAddRole() {
    setRoleDraft(null)
    setDetailsDialogOpen(true)
  }

  function handleDetailsContinue(values: CreateRoleDetailsValues) {
    setRoleDraft(values)
    setDetailsDialogOpen(false)
    setPermissionsSheetOpen(true)
  }

  function handlePermissionsBack() {
    setPermissionsSheetOpen(false)
    setDetailsDialogOpen(true)
  }

  function handleFinished() {
    setRoleDraft(null)
  }

  return (
    <PermissionGate
      permission={PermissionCodes.roleRead}
      fallback={
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view roles.
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Roles"
          description="Define roles and attach permissions for officer access."
          action={
            <PermissionGate permission={PermissionCodes.roleCreate}>
              <Button type="button" onClick={handleAddRole}>
                Add role
              </Button>
            </PermissionGate>
          }
        />

        <BasicDataTable
          data={listQuery.data ?? []}
          columns={rolesColumns}
          isPending={listQuery.isPending}
          isError={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No roles found."
          errorMessage="Could not load roles."
        />
      </div>

      <CreateRoleDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        defaultValues={roleDraft}
        onContinue={handleDetailsContinue}
      />

      <CreateRolePermissionsSheet
        open={permissionsSheetOpen}
        onOpenChange={setPermissionsSheetOpen}
        details={roleDraft}
        onBack={handlePermissionsBack}
        onFinished={handleFinished}
      />
    </PermissionGate>
  )
}
