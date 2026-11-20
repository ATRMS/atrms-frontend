"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  fetchBusinessLinesList,
  saveBusinessLine,
  setBusinessLineActive,
} from "@/features/business-lines/api/business-lines-api"
import {
  businessLineSchema,
  type BusinessLineInput,
  type BusinessLineValues,
} from "@/features/business-lines/schemas"
import type { BusinessLine } from "@/features/business-lines/types"
import { normaliseError } from "@/lib/api/client"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { lookupsQueryOptions } from "@/lib/query/lookups"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function BusinessLinesPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [editing, setEditing] = useState<BusinessLine | null>(null)
  const [open, setOpen] = useState(false)
  const { data: lookup } = useQuery(lookupsQueryOptions(["sectors"]))
  const sectors = useMemo(() => lookup?.sectors ?? [], [lookup?.sectors])
  const form = useForm<BusinessLineInput, unknown, BusinessLineValues>({
    resolver: zodResolver(businessLineSchema),
    defaultValues: { code: "", name: "", sectorId: "" },
  })
  const save = useMutation({
    mutationFn: (values: BusinessLineValues) =>
      saveBusinessLine(editing?.id ?? null, values),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.businessLinesRoot(),
      })
      notify.success("Business line saved.")
      setOpen(false)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.business-line.sector-required": "sectorId",
          "master-data.sector.inactive": "sectorId",
          "master-data.business-line.code-taken": "code",
        })
      )
        notify.error(error.message)
    },
  })
  const toggle = useMutation({
    mutationFn: (line: BusinessLine) =>
      setBusinessLineActive(line.id, !line.active),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.businessLinesRoot(),
      })
    },
    onError: (error) => notify.error(normaliseError(error).message),
  })
  const edit = useCallback(
    (line: BusinessLine | null) => {
      setEditing(line)
      form.reset({
        code: line?.code ?? "",
        name: line?.name ?? "",
        sectorId: line?.sectorId ?? "",
      })
      setOpen(true)
    },
    [form]
  )
  const columns = useMemo<ColumnDef<BusinessLine>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code}</span>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "sectorCode", header: "Sector" },
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
  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "sectorId",
        label: "Sector",
        placeholder: "Sector",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All sectors" },
          ...sectors.map((sector) => ({
            value: sector.id,
            label: `${sector.code} — ${sector.name}`,
          })),
        ],
      },
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
    ],
    [sectors]
  )
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="business lines" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Business lines"
          description="Manage business classifications within sectors."
          action={
            canWrite ? (
              <Button onClick={() => edit(null)}>Add business line</Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.businessLinesLists()}
          queryFn={fetchBusinessLinesList}
          filters={filters}
          emptyMessage="No business lines match your filters."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} business line
              </DialogTitle>
              <DialogDescription>
                Every business line belongs to an active sector.
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
                  name="sectorId"
                  label="Sector"
                  required
                  render={({ field, fieldState }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.code} — {sector.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
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
