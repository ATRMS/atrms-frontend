"use client"

import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse, parseISO } from "date-fns"
import { type ReactNode, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { fetchUserById, fetchUserTransfers } from "@/features/users/api/users-api"
import {
  formatRoleLabel,
  formatUserFullName,
  UserRoleBadge,
  UserStatusBadge,
} from "@/features/users/lib/user-display"
import type { UserDetail } from "@/features/users/types"
import { EditUserSheet } from "@/features/users/ui/edit-user-sheet"
import { TransferUserDialog } from "@/features/users/ui/transfer-user-dialog"
import { UserActivateConfirmAlert } from "@/features/users/ui/user-activate-confirm-alert"
import { UserCreatedPasswordDialog } from "@/features/users/ui/user-created-password-dialog"
import { UserDeactivateConfirmAlert } from "@/features/users/ui/user-deactivate-confirm-alert"
import { UserResetPasswordConfirmAlert } from "@/features/users/ui/user-reset-password-confirm-alert"
import { UserUnlockConfirmAlert } from "@/features/users/ui/user-unlock-confirm-alert"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { BackLink } from "@/components/shared/back-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { queryKeys } from "@/lib/query-keys"
import { taxOfficesReferenceSelectQueryOptions } from "@/lib/query/admin-reference-select-queries"

/** Calendar date string `yyyy-MM-dd` from the API (avoid UTC midnight shifts). */
function formatEffectiveDateOnly(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—"
  }

  const parsed = parse(value.trim(), "yyyy-MM-dd", new Date())

  return isValid(parsed) ? format(parsed, "MMM d, yyyy") : value.trim()
}

/** Postgres-style timestamp e.g. `2026-05-14 22:46:15.464105+01`. */
function formatTransferCreatedAt(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—"
  }

  const raw = value.trim()
  const isoLike = raw.includes("T") ? raw : raw.replace(" ", "T")
  let parsed = parseISO(isoLike)

  if (!isValid(parsed)) {
    parsed = new Date(raw)
  }

  return isValid(parsed) ? format(parsed, "MMM d, yyyy h:mm a") : raw
}

function ProfileReadOnlyField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

function UserDetailLoaded({
  userId,
  user,
  canUpdate,
  canResetPassword,
}: {
  userId: string
  user: UserDetail
  canUpdate: boolean
  canResetPassword: boolean
}) {
  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const transfersQuery = useQuery({
    queryKey: queryKeys.users.transfers(userId),
    queryFn: () => fetchUserTransfers(userId),
  })

  const taxOfficeName = (taxOfficeId: string) =>
    taxOffices.find((o) => o.id === taxOfficeId)?.name ?? "—"

  const fullName = formatUserFullName(user)

  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false)
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false)
  const [confirmUnlockOpen, setConfirmUnlockOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  )

  function handlePasswordDialogChange(next: boolean) {
    setPasswordDialogOpen(next)

    if (!next) {
      setTemporaryPassword(null)
    }
  }

  const showDeactivate =
    user.status === "ACTIVE" || user.status === "PENDING"
  const showActivate = user.status === "INACTIVE" || user.status === "PENDING"
  const showUnlock = user.status === "LOCKED"

  return (
    <>
      <BackLink href="/admin/users">
        Users
      </BackLink>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
            <UserRoleBadge code={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PermissionGate permission={PermissionCodes.userUpdate}>
            <Button type="button" onClick={() => setEditSheetOpen(true)}>
              Edit
            </Button>
          </PermissionGate>

          <PermissionGate permission={PermissionCodes.userResetPassword}>
            {canResetPassword ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmResetOpen(true)}
              >
                Reset password
              </Button>
            ) : null}
          </PermissionGate>

          <PermissionGate permission={PermissionCodes.userUpdate}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferOpen(true)}
            >
              Transfer
            </Button>
          </PermissionGate>

          <PermissionGate permission={PermissionCodes.userUpdate}>
            {showDeactivate ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDeactivateOpen(true)}
              >
                Deactivate
              </Button>
            ) : null}
            {showActivate ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmActivateOpen(true)}
              >
                Activate
              </Button>
            ) : null}
            {showUnlock ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmUnlockOpen(true)}
              >
                Unlock
              </Button>
            ) : null}
          </PermissionGate>
        </div>
      </header>

      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="transfers">Transfer history</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <dl className="grid gap-6 sm:grid-cols-2">
            <ProfileReadOnlyField label="Title" value={user.title ?? "—"} />
            <ProfileReadOnlyField label="Staff ID" value={user.staffId ?? "—"} />
            <ProfileReadOnlyField
              label="First name"
              value={user.firstName}
            />
            <ProfileReadOnlyField
              label="Middle name"
              value={user.middleName ?? "—"}
            />
            <ProfileReadOnlyField label="Last name" value={user.lastName} />
            <ProfileReadOnlyField label="Email" value={user.email} />
            <ProfileReadOnlyField
              label="Username"
              value={<span className="font-mono">{user.username}</span>}
            />
            <ProfileReadOnlyField label="Phone" value={user.phone ?? "—"} />
            <ProfileReadOnlyField
              label="Role"
              value={formatRoleLabel(user.role)}
            />
            <ProfileReadOnlyField label="Tax office" value={taxOfficeName(user.taxOfficeId ?? "")} />
          </dl>
        </TabsContent>

        <TabsContent value="transfers">
          <div className="flex flex-col gap-4">
            {transfersQuery.isPending ? (
              <Skeleton className="h-40 w-full rounded-lg" />
            ) : transfersQuery.isError ? (
              <p className="text-sm text-destructive">
                Could not load transfer history.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From office</TableHead>
                    <TableHead>To office</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Effective date</TableHead>
                    <TableHead>Transferred by</TableHead>
                    <TableHead>Recorded at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transfersQuery.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No transfers recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transfersQuery.data?.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {taxOfficeName(row.fromTaxOfficeId)}
                        </TableCell>
                        <TableCell>{taxOfficeName(row.toTaxOfficeId)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {row.reason}
                        </TableCell>
                        <TableCell>
                          {formatEffectiveDateOnly(row.effectiveDate)}
                        </TableCell>
                        <TableCell>
                          <span
                            className="font-mono text-xs"
                            title={row.transferredBy}
                          >
                            {row.transferredBy}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatTransferCreatedAt(row.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EditUserSheet
        userId={userId}
        user={user}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        canUpdate={canUpdate}
      />

      <TransferUserDialog
        userId={userId}
        open={transferOpen}
        onOpenChange={setTransferOpen}
        currentTaxOfficeId={user.taxOfficeId}
      />

      <UserCreatedPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={handlePasswordDialogChange}
        temporaryPassword={temporaryPassword}
      />

      <UserResetPasswordConfirmAlert
        userId={userId}
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        fullName={fullName}
        onTemporaryPassword={(password) => {
          setTemporaryPassword(password)
          setPasswordDialogOpen(true)
        }}
      />

      <UserDeactivateConfirmAlert
        userId={userId}
        open={confirmDeactivateOpen}
        onOpenChange={setConfirmDeactivateOpen}
        fullName={fullName}
      />

      <UserActivateConfirmAlert
        userId={userId}
        open={confirmActivateOpen}
        onOpenChange={setConfirmActivateOpen}
        fullName={fullName}
      />

      <UserUnlockConfirmAlert
        userId={userId}
        open={confirmUnlockOpen}
        onOpenChange={setConfirmUnlockOpen}
        fullName={fullName}
      />
    </>
  )
}

export type UserDetailPageProps = {
  userId: string
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const canUpdate = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.userUpdate)
  )
  const canResetPassword = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.userResetPassword)
  )

  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserById(userId),
  })

  return (
    <PermissionGate
      permission={PermissionCodes.userRead}
      fallback={<PermissionDeniedFallback resourceLabel="this user" />}
    >
      <div className="flex flex-col gap-6">
        {userQuery.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        ) : userQuery.isError ? (
          <p className="text-sm text-destructive">
            Could not load this user.{" "}
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => void userQuery.refetch()}
            >
              Retry
            </Button>
          </p>
        ) : userQuery.data ? (
          <UserDetailLoaded
            key={userId}
            userId={userId}
            user={userQuery.data}
            canUpdate={canUpdate}
            canResetPassword={canResetPassword}
          />
        ) : null}
      </div>
    </PermissionGate>
  )
}
