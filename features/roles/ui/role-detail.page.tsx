"use client"

import { LockIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { PermissionCatalogItem } from "@/features/roles/types"
import { usePermissionCatalogQuery } from "@/features/roles/usecases/permission-catalog.usecase"
import { useRolePermissionsQuery } from "@/features/roles/usecases/role-permissions.usecase"
import { useRolesListQuery } from "@/features/roles/usecases/roles-list.usecase"
import { useSaveRolePermissionsMutation } from "@/features/roles/usecases/save-role-permissions.usecase"
import { DeleteRoleAlert } from "@/features/roles/ui/delete-role-alert"
import { EditRoleDialog } from "@/features/roles/ui/edit-role-dialog"
import { PermissionPickerPanels } from "@/features/roles/ui/permission-picker-panels"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { BackLink } from "@/components/shared/back-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

function RoleDetailPermissionsSection({
  roleId,
  catalog,
  assigned,
  readOnly,
  showSave,
}: {
  roleId: string
  catalog: PermissionCatalogItem[]
  assigned: PermissionCatalogItem[]
  readOnly: boolean
  showSave: boolean
}) {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(assigned.map((p) => p.id))
  )

  const saveMutation = useSaveRolePermissionsMutation()

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium">Permissions</h2>
        {showSave ? (
          <Button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ roleId, permissionIds: [...selectedIds] })}
          >
            {saveMutation.isPending ? "Saving…" : "Save permissions"}
          </Button>
        ) : null}
      </div>

      <PermissionPickerPanels
        catalog={catalog}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        readOnly={readOnly}
      />
    </>
  )
}

export type RoleDetailPageProps = {
  roleId: string
}

export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canUpdate = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.roleUpdate)
  )
  const canDelete = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.roleDelete)
  )

  const listQuery = useRolesListQuery()

  const role = listQuery.data?.find((r) => r.id === roleId)

  const catalogQuery = usePermissionCatalogQuery({ enabled: Boolean(role) })

  const rolePermQuery = useRolePermissionsQuery(roleId, {
    enabled: Boolean(role),
  })

  const isSystem = Boolean(role?.isSystem)
  const permissionsReadOnly = isSystem || !canUpdate

  return (
    <PermissionGate
      permission={PermissionCodes.roleRead}
      fallback={<PermissionDeniedFallback resourceLabel="this role" />}
    >
      <div className="flex flex-col gap-6">
        <BackLink href="/admin/roles">Roles</BackLink>

        {listQuery.isPending ? (
          <Skeleton className="h-40 w-full max-w-xl rounded-lg" />
        ) : listQuery.isError ? (
          <p className="text-sm text-destructive">
            Could not load roles list.{" "}
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => void listQuery.refetch()}
            >
              Retry
            </Button>
          </p>
        ) : !role ? (
          <p className="text-sm text-muted-foreground">
            This role was not found in the current directory.{" "}
            <Link href="/admin/roles" className="text-primary underline">
              Back to roles
            </Link>
          </p>
        ) : (
          <>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {role.name}
                  </h1>
                  {isSystem ? (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <LockIcon className="size-3" />
                      System
                    </Badge>
                  ) : null}
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  {role.code}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canUpdate && !isSystem ? (
                  <Button type="button" onClick={() => setEditOpen(true)}>
                    Edit name
                  </Button>
                ) : null}
                {canDelete && !isSystem ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </header>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium">Details</h2>
              <dl className="grid gap-6 sm:grid-cols-2">
                <InfoField
                  label="Code"
                  value={<span className="font-mono">{role.code}</span>}
                />
                <InfoField
                  label="Description"
                  value={role.description?.trim() ? role.description : "—"}
                />
              </dl>
            </section>

            <section className="flex flex-col gap-3">
              {catalogQuery.isPending || rolePermQuery.isPending ? (
                <Skeleton className="min-h-[280px] w-full rounded-lg" />
              ) : catalogQuery.isError ? (
                <p className="text-sm text-destructive">
                  Could not load permission catalog.
                </p>
              ) : rolePermQuery.isError ? (
                <p className="text-sm text-destructive">
                  Could not load role permissions.
                </p>
              ) : (
                <>
                  {isSystem ? (
                    <p className="text-sm text-muted-foreground">
                      System roles have fixed permissions and cannot be edited.
                    </p>
                  ) : null}

                  <RoleDetailPermissionsSection
                    key={rolePermQuery.dataUpdatedAt}
                    roleId={roleId}
                    catalog={catalogQuery.data ?? []}
                    assigned={rolePermQuery.data ?? []}
                    readOnly={permissionsReadOnly}
                    showSave={canUpdate && !isSystem}
                  />
                </>
              )}
            </section>

            <EditRoleDialog
              role={role}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
            <DeleteRoleAlert
              role={role}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onDeleted={() => router.push("/admin/roles")}
            />
          </>
        )}
      </div>
    </PermissionGate>
  )
}
