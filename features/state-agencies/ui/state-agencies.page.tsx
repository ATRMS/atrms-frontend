"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, PowerIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
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
  stateAgencySchema,
  type StateAgencyInput,
  type StateAgencyValues,
} from "@/features/state-agencies/schemas"
import type { StateAgency } from "@/features/state-agencies/types"
import { normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import {
  fetchMasterDataList,
  patchMasterDataRecord,
  saveMasterDataRecord,
} from "@/lib/api/master-data"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

const filters: DataTableFilterConfig[] = [
  {
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
  },
]
export function StateAgenciesPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [editing, setEditing] = useState<StateAgency | null>(null)
  const [open, setOpen] = useState(false)
  const form = useForm<StateAgencyInput, unknown, StateAgencyValues>({
    resolver: zodResolver(stateAgencySchema),
    defaultValues: {
      code: "",
      name: "",
      accountingOfficer: "",
      address: "",
      phone: "",
      email: "",
    },
  })
  const save = useMutation({
    mutationFn: (values: StateAgencyValues) =>
      saveMasterDataRecord<StateAgency, StateAgencyValues>(
        apiPaths.masterData.stateAgencies,
        editing ? apiPaths.masterData.stateAgencyDetail(editing.id) : null,
        values
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("state-agencies"),
      })
      setOpen(false)
      notify.success("State agency saved.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.state-agency.code-taken": "code",
        })
      )
        notify.error(error.message)
    },
  })
  const toggle = useMutation({
    mutationFn: (agency: StateAgency) =>
      patchMasterDataRecord<StateAgency>(
        agency.active
          ? apiPaths.masterData.stateAgencyDeactivate(agency.id)
          : apiPaths.masterData.stateAgencyActivate(agency.id)
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("state-agencies"),
      })
    },
  })
  const edit = useCallback(
    (agency: StateAgency | null) => {
      setEditing(agency)
      form.reset({
        code: agency?.code ?? "",
        name: agency?.name ?? "",
        accountingOfficer: agency?.accountingOfficer ?? "",
        address: agency?.address ?? "",
        phone: agency?.phone ?? "",
        email: agency?.email ?? "",
      })
      setOpen(true)
    },
    [form]
  )
  const columns = useMemo<ColumnDef<StateAgency>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "accountingOfficer",
        header: "Accounting officer",
        cell: ({ row }) => row.original.accountingOfficer ?? "—",
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
        cell: ({ row }) =>
          canWrite ? (
            <DataTableRowActions
              subjectLabel={row.original.name}
              menuTitle={row.original.code}
              groups={[
                {
                  id: "actions",
                  items: [
                    {
                      id: "edit",
                      label: "Edit",
                      icon: PencilIcon,
                      onSelect: () => edit(row.original),
                    },
                    {
                      id: "toggle",
                      label: row.original.active ? "Deactivate" : "Activate",
                      icon: PowerIcon,
                      onSelect: () => toggle.mutate(row.original),
                    },
                  ],
                },
              ]}
            />
          ) : (
            <span>—</span>
          ),
      },
    ],
    [canWrite, edit, toggle]
  )
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="state agencies" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="State Agencies (MDAs)"
          description="Manage the public agencies that own revenue heads."
          action={
            canWrite ? (
              <Button onClick={() => edit(null)}>Add State Agency</Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists("state-agencies")}
          queryFn={(params) =>
            fetchMasterDataList<StateAgency>(
              apiPaths.masterData.stateAgencies,
              params
            )
          }
          filters={filters}
          emptyMessage="No state agencies match your filters."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} State Agency</DialogTitle>
              <DialogDescription>
                Codes cannot be changed after creation.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
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
                      readOnly={Boolean(editing)}
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
                  name="accountingOfficer"
                  label="Accounting officer"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  label="Address"
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id={field.name}
                        type="tel"
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    label="Email"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
