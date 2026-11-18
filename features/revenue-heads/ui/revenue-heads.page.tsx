"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, PencilIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useSearchParams } from "next/navigation"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  fetchInForceRate,
  fetchRates,
  fetchRevenueHeads,
  saveRate,
  saveRevenueHead,
} from "@/features/revenue-heads/api/revenue-heads-api"
import {
  rateSchema,
  revenueHeadSchema,
  type RateInput,
  type RevenueHeadInput,
  type RevenueHeadValues,
} from "@/features/revenue-heads/schemas"
import type { RateVersion, RevenueHead } from "@/features/revenue-heads/types"
import { runWorkflowAction } from "@/features/workflow/api/workflow-api"
import { StatusHistory } from "@/features/workflow/ui/status-history"
import { VersionActionBar } from "@/features/workflow/ui/version-action-bar"
import type { WorkflowAction } from "@/features/workflow/types"
import { normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import { lookupsQueryOptions } from "@/lib/query/lookups"

function displayRate(version: RateVersion | null | undefined) {
  if (!version) return "No approved rate in force"
  if (version.rateKind === "RATE" && version.rate)
    return `${Number(version.rate) * 100}%`
  if (version.amount)
    return `${version.amount.currency} ${version.amount.amount}`
  return "Rate table"
}
export function RevenueHeadsPage() {
  const params = useSearchParams()
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [editing, setEditing] = useState<RevenueHead | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<RevenueHead | null>(null)
  const [dismissedDeepLink, setDismissedDeepLink] = useState<string | null>(
    null
  )
  const [rateOpen, setRateOpen] = useState(false)
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<
    number | null
  >(null)
  const [editingRateVersion, setEditingRateVersion] =
    useState<RateVersion | null>(null)
  const lookupQuery = useQuery(
    lookupsQueryOptions(["taxTypes", "stateAgencies"])
  )
  const taxTypes = useMemo(
    () => lookupQuery.data?.taxTypes ?? [],
    [lookupQuery.data?.taxTypes]
  )
  const agencies = useMemo(
    () => lookupQuery.data?.stateAgencies ?? [],
    [lookupQuery.data?.stateAgencies]
  )
  const deepLink = useQuery({
    queryKey: [
      ...queryKeys.masterData.resourceLists("revenue-heads"),
      "deep-link",
      params.get("code"),
    ],
    queryFn: () =>
      fetchRevenueHeads({
        page: 0,
        size: 20,
        search: params.get("code") ?? undefined,
      }),
    enabled: Boolean(params.get("code")),
  })
  const requestedCode = params.get("code")
  const deepLinkedHead = deepLink.data?.data.find(
    (item) => item.code === requestedCode
  )
  const activeHead =
    selected ??
    (requestedCode !== dismissedDeepLink ? (deepLinkedHead ?? null) : null)
  const rates = useQuery({
    queryKey: [
      ...queryKeys.masterData.resourceDetail(
        "revenue-heads",
        activeHead?.id ?? ""
      ),
      "rates",
    ],
    queryFn: () => fetchRates(activeHead?.id ?? ""),
    enabled: Boolean(activeHead),
  })
  const inForce = useQuery({
    queryKey: [
      ...queryKeys.masterData.resourceDetail(
        "revenue-heads",
        activeHead?.id ?? ""
      ),
      "in-force",
    ],
    queryFn: () => fetchInForceRate(activeHead?.id ?? ""),
    enabled: Boolean(activeHead),
  })
  const requestedVersion = Number(params.get("version"))
  const activeVersion =
    rates.data?.find((item) => item.version === selectedVersionNumber) ??
    rates.data?.find((item) => item.version === requestedVersion) ??
    rates.data?.[0] ??
    null
  const form = useForm<RevenueHeadInput, unknown, RevenueHeadValues>({
    resolver: zodResolver(revenueHeadSchema),
    defaultValues: {
      code: "",
      name: "",
      taxTypeId: "",
      stateAgencyId: "",
      subCategory: "",
    },
  })
  const rateForm = useForm<RateInput>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      rateKind: "RATE",
      value: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      sourceReference: "",
    },
  })
  const rateKind = useWatch({ control: rateForm.control, name: "rateKind" })
  const save = useMutation({
    mutationFn: (values: RevenueHeadValues) =>
      saveRevenueHead(editing?.id ?? null, values),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("revenue-heads"),
      })
      setFormOpen(false)
      notify.success("Revenue head saved.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.revenue-head.agency-inactive": "stateAgencyId",
          "master-data.revenue-head.tax-type-unknown": "taxTypeId",
        })
      )
        notify.error(error.message)
    },
  })
  const propose = useMutation({
    mutationFn: (values: RateInput) => {
      const payload = {
        rateKind: values.rateKind,
        effectiveFrom: values.effectiveFrom,
        sourceReference: values.sourceReference || undefined,
        ...(values.rateKind === "RATE"
          ? { rate: String(Number(values.value) / 100) }
          : values.rateKind === "FIXED_AMOUNT"
            ? { amount: values.value }
            : { rateTable: JSON.parse(values.value) }),
      }
      return saveRate(
        activeHead?.id ?? "",
        editingRateVersion?.status === "RETURNED"
          ? editingRateVersion.version
          : null,
        payload
      )
    },
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("revenue-heads"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
      setRateOpen(false)
      notify.success("Rate proposal submitted.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, rateForm.setError, {
          "master-data.rate.kind-invalid": "value",
          "master-data.rate.value-invalid": "value",
          "master-data.rate.source-required": "sourceReference",
        })
      )
        notify.error(error.message)
    },
  })
  const action = useMutation({
    mutationFn: ({
      action,
      remarks,
    }: {
      action: WorkflowAction
      remarks?: string
    }) =>
      runWorkflowAction(
        `${apiPaths.masterData.revenueHeadRateVersion(activeHead?.id ?? "", activeVersion?.version ?? 0)}/${action}`,
        remarks
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("revenue-heads"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
      notify.success("Workflow updated.")
    },
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  const editHead = useCallback(
    (head: RevenueHead | null) => {
      setEditing(head)
      form.reset({
        code: head?.code ?? "",
        name: head?.name ?? "",
        taxTypeId: head?.taxTypeId ?? "",
        stateAgencyId: head?.stateAgencyId ?? "",
        subCategory: head?.subCategory ?? "",
      })
      setFormOpen(true)
    },
    [form]
  )
  function editRate(version?: RateVersion | null) {
    const item = version ?? null
    setEditingRateVersion(item)
    rateForm.reset({
      rateKind: item?.rateKind ?? "RATE",
      value:
        item?.rateKind === "RATE"
          ? String(Number(item.rate ?? 0) * 100)
          : item?.rateKind === "FIXED_AMOUNT"
            ? (item.amount?.amount ?? "")
            : JSON.stringify(
                item?.rateTable ?? [{ upTo: null, rate: "0" }],
                null,
                2
              ),
      effectiveFrom:
        item?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
      sourceReference: item?.sourceReference ?? "",
    })
    setRateOpen(true)
  }
  const columns = useMemo<ColumnDef<RevenueHead>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "taxTypeCode", header: "Tax type" },
      { accessorKey: "stateAgencyCode", header: "Agency" },
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
        cell: ({ row }) => (
          <DataTableRowActions
            subjectLabel={row.original.name}
            menuTitle={row.original.code}
            groups={[
              {
                id: "actions",
                items: [
                  {
                    id: "open",
                    label: "Open",
                    icon: EyeIcon,
                    onSelect: () => {
                      setSelectedVersionNumber(null)
                      setSelected(row.original)
                    },
                  },
                  ...(canWrite
                    ? [
                        {
                          id: "edit",
                          label: "Edit",
                          icon: PencilIcon,
                          onSelect: () => editHead(row.original),
                        },
                      ]
                    : []),
                ],
              },
            ]}
          />
        ),
      },
    ],
    [canWrite, editHead]
  )
  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "taxTypeId",
        label: "Tax type",
        placeholder: "Tax type",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All tax types" },
          ...taxTypes.map((item) => ({ value: item.id, label: item.name })),
        ],
      },
      {
        type: "select",
        paramKey: "stateAgencyId",
        label: "Agency",
        placeholder: "Agency",
        emptyValue: "__all__",
        options: [
          { value: "__all__", label: "All agencies" },
          ...agencies.map((item) => ({ value: item.id, label: item.name })),
        ],
      },
    ],
    [agencies, taxTypes]
  )
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="revenue heads" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Revenue heads"
          description="Manage lines of revenue and their approved dated rates."
          action={
            canWrite ? (
              <Button onClick={() => editHead(null)}>Add revenue head</Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists("revenue-heads")}
          queryFn={fetchRevenueHeads}
          filters={filters}
          emptyMessage="No revenue heads match your filters."
        />
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} revenue head</DialogTitle>
              <DialogDescription>
                Choose the tax type and owning State Agency.
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
                  name="taxTypeId"
                  label="Tax type"
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
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {taxTypes.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.code} — {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stateAgencyId"
                  label="State Agency"
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
                        <SelectValue placeholder="Select agency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {agencies.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.code} — {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subCategory"
                  label="Sub-category"
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
        <Sheet
          open={Boolean(activeHead)}
          onOpenChange={(open) => {
            if (!open) {
              setDismissedDeepLink(requestedCode)
              setSelected(null)
            }
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
            <SheetHeader>
              <SheetTitle>
                {activeHead?.code} · {activeHead?.name}
              </SheetTitle>
              <SheetDescription>
                In force today: {displayRate(inForce.data)}
              </SheetDescription>
            </SheetHeader>
            <Tabs
              defaultValue={params.get("tab") ?? "details"}
              className="px-4 pb-4"
            >
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rates">Rates</TabsTrigger>
                <TabsTrigger value="history">Status history</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <dl className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Tax type</dt>
                    <dd>{activeHead?.taxTypeCode}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      State Agency
                    </dt>
                    <dd>{activeHead?.stateAgencyCode}</dd>
                  </div>
                </dl>
              </TabsContent>
              <TabsContent value="rates" className="flex flex-col gap-4">
                {canWrite ? (
                  <Button className="self-start" onClick={() => editRate(null)}>
                    Propose a new value
                  </Button>
                ) : null}
                <div className="flex flex-col gap-2">
                  {rates.data?.map((version) => (
                    <button
                      type="button"
                      key={version.version}
                      onClick={() => setSelectedVersionNumber(version.version)}
                      className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-left"
                    >
                      <Badge variant="outline">v{version.version}</Badge>
                      <span>{displayRate(version)}</span>
                      <span>
                        {version.effectiveFrom}
                        {version.effectiveTo ? ` → ${version.effectiveTo}` : ""}
                      </span>
                      <Badge>{version.status}</Badge>
                    </button>
                  ))}
                </div>
                {activeVersion ? (
                  <VersionActionBar
                    status={activeVersion.status}
                    proposedBy={activeVersion.proposedBy}
                    pending={action.isPending}
                    onEdit={() => editRate(activeVersion)}
                    onAction={(next, remarks) =>
                      action.mutate({ action: next, remarks })
                    }
                  />
                ) : null}
              </TabsContent>
              <TabsContent value="history">
                <StatusHistory instanceId={activeVersion?.instanceId ?? null} />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
        <Dialog open={rateOpen} onOpenChange={setRateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRateVersion?.status === "RETURNED"
                  ? "Edit returned rate"
                  : "Propose a new rate"}
              </DialogTitle>
              <DialogDescription>
                Another administrator must approve this dated value.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={rateForm.handleSubmit((values) =>
                propose.mutate(values)
              )}
            >
              <FieldGroup>
                <FormField
                  control={rateForm.control}
                  name="rateKind"
                  label="Kind"
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
                          <SelectItem value="RATE">Percentage rate</SelectItem>
                          <SelectItem value="FIXED_AMOUNT">
                            Fixed amount
                          </SelectItem>
                          <SelectItem value="RATE_TABLE">Rate table</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={rateForm.control}
                  name="value"
                  label="Value"
                  required
                  description={
                    rateKind === "RATE"
                      ? "Enter a percentage, for example 7.5."
                      : undefined
                  }
                  render={({ field, fieldState }) =>
                    rateKind === "RATE_TABLE" ? (
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={7}
                        aria-invalid={fieldState.invalid}
                      />
                    ) : (
                      <Input
                        {...field}
                        id={field.name}
                        inputMode="decimal"
                        aria-invalid={fieldState.invalid}
                      />
                    )
                  }
                />
                <FormField
                  control={rateForm.control}
                  name="effectiveFrom"
                  label="Effective from"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FormField
                  control={rateForm.control}
                  name="sourceReference"
                  label="Source reference"
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
                  onClick={() => setRateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={propose.isPending}>
                  Submit proposal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
