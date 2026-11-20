"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, PowerIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { normaliseError } from "@/lib/api/client"
import {
  fetchMasterDataList,
  patchMasterDataRecord,
  saveMasterDataRecord,
} from "@/lib/api/master-data"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export interface CodeNameRecord {
  id: string
  code: string
  name: string
  active: boolean
}

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Name is required"),
})
type Values = z.infer<typeof schema>
type Inputs = z.input<typeof schema>

export interface CodeNameMasterDataPageProps {
  resource: string
  title: string
  description: string
  singular: string
  collectionPath: string
  detailPath: (id: string) => string
  activatePath: (id: string) => string
  deactivatePath: (id: string) => string
  codeTakenKey: string
  blockedCode?: string
  blockedMessage?: string
  blockedHref?: (record: CodeNameRecord) => string
}

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

export function CodeNameMasterDataPage(props: CodeNameMasterDataPageProps) {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [editing, setEditing] = useState<CodeNameRecord | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [confirming, setConfirming] = useState<CodeNameRecord | null>(null)
  const [blocked, setBlocked] = useState(false)
  const form = useForm<Inputs, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "" },
  })
  const rootKey = queryKeys.masterData.resourceRoot(props.resource)

  const save = useMutation({
    mutationFn: (values: Values) =>
      saveMasterDataRecord<CodeNameRecord, Values>(
        props.collectionPath,
        editing ? props.detailPath(editing.id) : null,
        values
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: rootKey })
      notify.success(`${props.singular} saved.`)
      setFormOpen(false)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          [props.codeTakenKey]: "code",
        })
      )
        notify.error(error.message)
    },
  })
  const toggle = useMutation({
    mutationFn: (record: CodeNameRecord) =>
      patchMasterDataRecord<CodeNameRecord>(
        record.active
          ? props.deactivatePath(record.id)
          : props.activatePath(record.id)
      ),
    onSuccess: async (_, record) => {
      await client.invalidateQueries({ queryKey: rootKey })
      notify.success(
        `${props.singular} ${record.active ? "deactivated" : "activated"}.`
      )
      setConfirming(null)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (props.blockedCode && error.code === props.blockedCode)
        setBlocked(true)
      else notify.error(error.message)
    },
  })

  const openForm = useCallback(
    (record: CodeNameRecord | null) => {
      setEditing(record)
      form.reset({ code: record?.code ?? "", name: record?.name ?? "" })
      setFormOpen(true)
    },
    [form]
  )
  const columns = useMemo<ColumnDef<CodeNameRecord>[]>(
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
                      onSelect: () => openForm(row.original),
                    },
                    {
                      id: "toggle",
                      label: row.original.active ? "Deactivate" : "Activate",
                      icon: PowerIcon,
                      onSelect: () => setConfirming(row.original),
                    },
                  ],
                },
              ]}
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [canWrite, openForm]
  )

  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={
        <PermissionDeniedFallback resourceLabel={props.title.toLowerCase()} />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title={props.title}
          description={props.description}
          action={
            canWrite ? (
              <Button onClick={() => openForm(null)}>
                Add {props.singular.toLowerCase()}
              </Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists(props.resource)}
          queryFn={(params) =>
            fetchMasterDataList<CodeNameRecord>(props.collectionPath, params)
          }
          filters={filters}
          emptyMessage={`No ${props.title.toLowerCase()} match your filters.`}
        />
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} {props.singular.toLowerCase()}
              </DialogTitle>
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
                      aria-readonly={Boolean(editing)}
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
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
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
        <AlertDialog
          open={Boolean(confirming)}
          onOpenChange={(open) => {
            if (!open) {
              setConfirming(null)
              setBlocked(false)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {blocked
                  ? `Cannot deactivate ${props.singular.toLowerCase()}`
                  : `${confirming?.active ? "Deactivate" : "Activate"} ${props.singular.toLowerCase()}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {blocked
                  ? props.blockedMessage
                  : "This changes whether the record can be selected for new entries."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {blocked && confirming && props.blockedHref ? (
                <Button asChild variant="outline">
                  <Link href={props.blockedHref(confirming)}>
                    View dependent records
                  </Link>
                </Button>
              ) : !blocked && confirming ? (
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault()
                    toggle.mutate(confirming)
                  }}
                >
                  Continue
                </AlertDialogAction>
              ) : null}
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  )
}
