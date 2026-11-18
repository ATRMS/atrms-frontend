"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { BackLink } from "@/components/shared/back-link"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  fetchParameter,
  fetchParameterVersions,
  saveParameterVersion,
} from "@/features/parameters/api/parameters-api"
import type {
  ParameterValue,
  ParameterVersion,
} from "@/features/parameters/types"
import { ValueEditor } from "@/features/parameters/ui/value-editor"
import { formatParameterValue } from "@/features/parameters/ui/parameters.page"
import { runWorkflowAction } from "@/features/workflow/api/workflow-api"
import { StatusHistory } from "@/features/workflow/ui/status-history"
import { VersionActionBar } from "@/features/workflow/ui/version-action-bar"
import type { WorkflowAction } from "@/features/workflow/types"
import { normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

type FormValues = {
  value: string
  effectiveFrom: string
  sourceReference: string
}
export function ParameterDetailPage({ code }: { code: string }) {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const parameter = useQuery({
    queryKey: queryKeys.masterData.resourceDetail("parameters", code),
    queryFn: () => fetchParameter(code),
  })
  const versions = useQuery({
    queryKey: [
      ...queryKeys.masterData.resourceDetail("parameters", code),
      "versions",
    ],
    queryFn: () => fetchParameterVersions(code),
  })
  const [selected, setSelected] = useState<ParameterVersion | null>(null)
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    defaultValues: {
      value: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      sourceReference: "",
    },
  })
  const current = selected ?? versions.data?.[0] ?? null
  function openEditor(version?: ParameterVersion | null) {
    const item = version ?? null
    setSelected(item)
    const raw = item
      ? parameter.data?.valueType === "RATE"
        ? String(Number(item.value) * 100)
        : typeof item.value === "object"
          ? JSON.stringify(item.value)
          : String(item.value)
      : parameter.data?.valueType === "BANDS"
        ? JSON.stringify([{ upTo: null, rate: "0" }])
        : ""
    form.reset({
      value: raw,
      effectiveFrom:
        item?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
      sourceReference: item?.sourceReference ?? "",
    })
    setOpen(true)
  }
  const save = useMutation({
    mutationFn: (values: FormValues) => {
      if (!parameter.data) throw new Error("Parameter unavailable")
      let value: ParameterValue = values.value
      if (parameter.data.valueType === "RATE")
        value = String(Number(values.value) / 100)
      if (["DAYS", "DAY_OF_MONTH"].includes(parameter.data.valueType))
        value = Number(values.value)
      if (parameter.data.valueType === "BANDS")
        value = JSON.parse(values.value) as ParameterValue
      return saveParameterVersion(
        code,
        selected?.status === "RETURNED" ? selected.version : null,
        {
          value,
          effectiveFrom: values.effectiveFrom,
          sourceReference: values.sourceReference || undefined,
        }
      )
    },
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("parameters"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
      setOpen(false)
      notify.success("Parameter proposal submitted.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      form.setError(
        error.messageKey?.includes("source") ? "sourceReference" : "value",
        { type: "server", message: error.message }
      )
    },
  })
  const action = useMutation({
    mutationFn: ({
      next,
      remarks,
    }: {
      next: WorkflowAction
      remarks?: string
    }) =>
      runWorkflowAction(
        `${apiPaths.masterData.parameterVersion(code, current?.version ?? 0)}/${next}`,
        remarks
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("parameters"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
    },
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  if (!parameter.data) return <p>Loading parameter…</p>
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/parameters">Back to parameters</BackLink>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {parameter.data.code} · {parameter.data.name}
          </h1>
          <p className="text-muted-foreground">{parameter.data.description}</p>
          <p className="mt-2">
            In force:{" "}
            {formatParameterValue(
              parameter.data.inForce?.value,
              parameter.data.valueType
            )}
          </p>
        </div>
        {canWrite ? (
          <Button onClick={() => openEditor(null)}>Propose a new value</Button>
        ) : null}
      </div>
      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="history">Status history</TabsTrigger>
        </TabsList>
        <TabsContent value="versions" className="flex flex-col gap-3">
          {versions.data?.map((version) => (
            <Button
              key={version.version}
              type="button"
              variant="outline"
              className="h-auto justify-start py-3"
              onClick={() => setSelected(version)}
            >
              <Badge variant="outline">v{version.version}</Badge>
              <span>
                {formatParameterValue(version.value, parameter.data.valueType)}
              </span>
              <span>
                {version.effectiveFrom}
                {version.effectiveTo ? ` → ${version.effectiveTo}` : ""}
              </span>
              <Badge>{version.status}</Badge>
            </Button>
          ))}
          {current ? (
            <VersionActionBar
              status={current.status}
              proposedBy={current.proposedBy}
              pending={action.isPending}
              onEdit={() => openEditor(current)}
              onAction={(next, remarks) => action.mutate({ next, remarks })}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="history">
          <StatusHistory instanceId={current?.instanceId ?? null} />
        </TabsContent>
      </Tabs>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose {parameter.data.name}</DialogTitle>
            <DialogDescription>
              Another administrator must approve this value.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name="value"
                label="Value"
                required
                render={({ field, fieldState }) => (
                  <ValueEditor
                    valueType={parameter.data.valueType}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                Submit proposal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
