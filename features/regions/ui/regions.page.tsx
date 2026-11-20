"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, PowerIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { FormField } from "@/components/shared/form-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  fetchRegionsList,
  saveRegion,
  setRegionActive,
} from "@/features/regions/api/regions-api"
import {
  regionFormSchema,
  type RegionFormInputValues,
  type RegionFormValues,
} from "@/features/regions/schemas"
import type { Region } from "@/features/regions/types"
import { ApiErrorCodes } from "@/lib/api/error-codes"
import { normaliseError } from "@/lib/api/client"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

const statusFilter: DataTableFilterConfig = {
  type: "select",
  paramKey: "active",
  label: "Status",
  placeholder: "Status",
  emptyValue: "__all__",
  options: [
    { value: "__all__", label: "All" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ],
}

function RegionDialog({
  region,
  open,
  onOpenChange,
}: {
  region: Region | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const client = useQueryClient()
  const form = useForm<RegionFormInputValues, unknown, RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: { code: "", name: "", description: "" },
  })
  const mutation = useMutation({
    mutationFn: (values: RegionFormValues) =>
      saveRegion(region?.id ?? null, values),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.regionsRoot(),
      })
      notify.success(region ? "Region updated." : "Region created.")
      onOpenChange(false)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.region.code-taken": "code",
        })
      )
        notify.error(error.message)
    },
  })

  function handleOpenChange(next: boolean) {
    if (next)
      form.reset({
        code: region?.code ?? "",
        name: region?.name ?? "",
        description: region?.description ?? "",
      })
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{region ? "Edit region" : "Add region"}</DialogTitle>
          <DialogDescription>
            Regions group tax offices for administration.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FieldGroup>
            <FormField
              control={form.control}
              name="code"
              label="Code"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  readOnly={Boolean(region)}
                  aria-readonly={Boolean(region)}
                  aria-invalid={fieldState.invalid}
                  onChange={(event) =>
                    field.onChange(event.target.value.toUpperCase())
                  }
                />
              )}
            />
            <FormField
              control={form.control}
              name="name"
              label="Name"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
              )}
            />
            <FormField
              control={form.control}
              name="description"
              label="Description"
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  maxLength={500}
                />
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegionActions({ region }: { region: Region }) {
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const client = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const mutation = useMutation({
    mutationFn: () => setRegionActive(region, !region.active),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.regionsRoot(),
      })
      setConfirmOpen(false)
      notify.success(`Region ${region.active ? "deactivated" : "activated"}.`)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (error.code === ApiErrorCodes.regionHasActiveOffices) setBlocked(true)
      else notify.error(error.message)
    },
  })
  if (!canWrite) return <span className="text-muted-foreground">—</span>
  return (
    <>
      <DataTableRowActions
        subjectLabel={region.name}
        menuTitle={region.code}
        groups={[
          {
            id: "actions",
            items: [
              {
                id: "edit",
                label: "Edit",
                icon: PencilIcon,
                onSelect: () => setEditOpen(true),
              },
              {
                id: "toggle",
                label: region.active ? "Deactivate" : "Activate",
                icon: PowerIcon,
                onSelect: () => setConfirmOpen(true),
              },
            ],
          },
        ]}
      />
      <RegionDialog
        region={region}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          setConfirmOpen(next)
          if (!next) setBlocked(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blocked
                ? "Region still has active tax offices"
                : `${region.active ? "Deactivate" : "Activate"} region?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blocked
                ? "Move or deactivate this region's tax offices first."
                : `This changes whether ${region.name} can be selected for new records.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {blocked ? (
              <Button asChild variant="outline">
                <Link href={`/admin/tax-offices?regionId=${region.id}`}>
                  View tax offices
                </Link>
              </Button>
            ) : (
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault()
                  mutation.mutate()
                }}
              >
                {region.active ? "Deactivate" : "Activate"}
              </AlertDialogAction>
            )}
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function RegionsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const columns = useMemo<ColumnDef<Region>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code}</span>
        ),
      },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "—",
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <RegionActions region={row.original} />,
      },
    ],
    []
  )
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="regions" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Regions"
          description="Group tax offices into administrative regions."
          action={
            <PermissionGate permission={PermissionCodes.masterDataWrite}>
              <Button onClick={() => setCreateOpen(true)}>Add region</Button>
            </PermissionGate>
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.regionsLists()}
          queryFn={fetchRegionsList}
          filters={[statusFilter]}
          emptyMessage="No regions match your filters."
        />
        <RegionDialog
          region={null}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>
    </PermissionGate>
  )
}
