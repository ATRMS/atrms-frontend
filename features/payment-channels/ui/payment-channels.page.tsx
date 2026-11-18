"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { fetchBankAccountsList } from "@/features/bank-accounts/api/bank-accounts-api"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { PaymentChannel } from "@/features/payment-channels/types"
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

const types = [
  "BANK_BRANCH",
  "PSP",
  "POS",
  "ONLINE",
  "USSD",
  "DIRECT_LODGEMENT",
] as const
const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1),
  channelType: z.enum(types),
  provider: z.string().trim().optional(),
  settlementAccountId: z.string().uuid("Select a settlement account"),
})
type Values = z.infer<typeof schema>
type Inputs = z.input<typeof schema>
export function PaymentChannelsPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [editing, setEditing] = useState<PaymentChannel | null>(null)
  const [open, setOpen] = useState(false)
  const accounts = useQuery({
    queryKey: [...queryKeys.masterData.bankAccountsRoot(), "active"],
    queryFn: () => fetchBankAccountsList({ isActive: true }),
  })
  const form = useForm<Inputs, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      channelType: "BANK_BRANCH",
      provider: "",
      settlementAccountId: "",
    },
  })
  const save = useMutation({
    mutationFn: (values: Values) =>
      saveMasterDataRecord<PaymentChannel, Values>(
        apiPaths.masterData.paymentChannels,
        editing ? apiPaths.masterData.paymentChannelDetail(editing.id) : null,
        values
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("payment-channels"),
      })
      setOpen(false)
      notify.success("Payment channel saved.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.payment-channel.account-inactive": "settlementAccountId",
          "master-data.payment-channel.type-invalid": "channelType",
          "master-data.payment-channel.code-taken": "code",
        })
      )
        notify.error(error.message)
    },
  })
  const toggle = useMutation({
    mutationFn: (channel: PaymentChannel) =>
      patchMasterDataRecord(
        channel.isActive
          ? apiPaths.masterData.paymentChannelDeactivate(channel.id)
          : apiPaths.masterData.paymentChannelActivate(channel.id)
      ),
    onSuccess: async () =>
      client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("payment-channels"),
      }),
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  const edit = useCallback(
    (channel: PaymentChannel | null) => {
      setEditing(channel)
      form.reset({
        code: channel?.code ?? "",
        name: channel?.name ?? "",
        channelType: channel?.channelType ?? "BANK_BRANCH",
        provider: channel?.provider ?? "",
        settlementAccountId: channel?.settlementAccountId ?? "",
      })
      setOpen(true)
    },
    [form]
  )
  const columns = useMemo<ColumnDef<PaymentChannel>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "channelType", header: "Type" },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => row.original.provider ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
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
                      label: row.original.isActive ? "Deactivate" : "Activate",
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
  const filters: DataTableFilterConfig[] = [
    {
      type: "select",
      paramKey: "channelType",
      label: "Type",
      emptyValue: "__all__",
      options: [
        { value: "__all__", label: "All types" },
        ...types.map((type) => ({
          value: type,
          label: type.replaceAll("_", " "),
        })),
      ],
    },
    {
      type: "select",
      paramKey: "isActive",
      label: "Status",
      emptyValue: "__all__",
      options: [
        { value: "__all__", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ]
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="payment channels" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payment channels"
          description="Configure payment entry points and settlement accounts."
          action={
            canWrite ? (
              <Button onClick={() => edit(null)}>Add payment channel</Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists("payment-channels")}
          queryFn={(params) =>
            fetchMasterDataList<PaymentChannel>(
              apiPaths.masterData.paymentChannels,
              params
            )
          }
          filters={filters}
          emptyMessage="No payment channels match your filters."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} payment channel
              </DialogTitle>
              <DialogDescription>
                Choose an active bank account for settlement.
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
                  name="channelType"
                  label="Channel type"
                  required
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replaceAll("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  label="Provider"
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
                  name="settlementAccountId"
                  label="Settlement account"
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
                        <SelectValue placeholder="Select active account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(accounts.data?.data ?? []).map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName} — {account.accountNumber}
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
