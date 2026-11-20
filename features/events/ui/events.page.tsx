"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { FormField } from "@/components/shared/form-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { Catalogue, EventType } from "@/features/events/types"
import { fetchNotificationTemplatesList } from "@/features/notification-templates/api/notification-templates-api"
import { fetchRolesList } from "@/features/roles/api/roles-api"
import { apiClient, normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"

type BindingForm = {
  channel: "EMAIL" | "SMS"
  templateCode: string
  audience: "MAKER" | "STEP_APPROVERS" | "TAXPAYER" | "ROLE"
  roleCode: string
}
export function EventsPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.systemWrite)
  )
  const [selected, setSelected] = useState<EventType | null>(null)
  const catalogue = useQuery({
    queryKey: queryKeys.masterData.resourceRoot("events"),
    queryFn: async () =>
      unwrapApiPayload(
        (
          await apiClient.get<ApiResponse<Catalogue>>(
            apiPaths.masterData.events
          )
        ).data
      ),
  })
  const templates = useQuery({
    queryKey: queryKeys.notificationTemplates.all,
    queryFn: () => fetchNotificationTemplatesList(),
  })
  const roles = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: fetchRolesList,
  })
  const form = useForm<BindingForm>({
    defaultValues: {
      channel: "EMAIL",
      templateCode: "",
      audience: "MAKER",
      roleCode: "",
    },
  })
  const channel = useWatch({ control: form.control, name: "channel" })
  const audience = useWatch({ control: form.control, name: "audience" })
  const groups = useMemo(
    () =>
      Object.entries(
        Object.groupBy(catalogue.data?.events ?? [], (event) => event.topic)
      ),
    [catalogue.data?.events]
  )
  const mutate = useMutation({
    mutationFn: ({
      path,
      method,
      body,
    }: {
      path: string
      method: "post" | "patch" | "delete"
      body?: unknown
    }) => apiClient.request({ url: path, method, data: body }),
    onSuccess: async () =>
      client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("events"),
      }),
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  function submit(values: BindingForm) {
    if (!selected) return
    if (values.audience === "ROLE" && !values.roleCode) {
      form.setError("roleCode", { message: "Select a role" })
      return
    }
    mutate.mutate(
      {
        path: apiPaths.masterData.eventBindings(selected.type),
        method: "post",
        body: {
          channel: values.channel,
          templateCode: values.templateCode,
          audience:
            values.audience === "ROLE"
              ? `ROLE:${values.roleCode}`
              : values.audience,
        },
      },
      { onSuccess: () => setSelected(null) }
    )
  }
  return (
    <PermissionGate
      permission={PermissionCodes.systemRead}
      fallback={<PermissionDeniedFallback resourceLabel="events" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Events and notifications"
          description="Control notification bindings for system events."
        />
        <div className="flex flex-wrap gap-3">
          {catalogue.data?.backlog.map((item) => (
            <Card key={item.topic} className="min-w-48">
              <CardHeader>
                <CardTitle className="text-base">{item.topic}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Badge variant="outline">{item.pending} pending</Badge>
                <Badge variant={item.parked ? "destructive" : "outline"}>
                  {item.parked} parked
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        {catalogue.data?.backlog.some((item) => item.parked > 0) ? (
          <Alert variant="destructive">
            <AlertTitle>Delivery backlog</AlertTitle>
            <AlertDescription>
              Some events failed repeatedly; contact support.
            </AlertDescription>
          </Alert>
        ) : null}
        {groups.map(([topic, events]) => (
          <Card key={topic}>
            <CardHeader>
              <CardTitle>{topic}</CardTitle>
              <CardDescription>
                Event catalogue and notification bindings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {events?.map((event) => (
                <div key={event.type} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={event.enabled}
                        disabled={!canWrite || mutate.isPending}
                        aria-label={`Enable ${event.type}`}
                        onCheckedChange={(enabled) =>
                          mutate.mutate({
                            path: apiPaths.masterData.eventDetail(event.type),
                            method: "patch",
                            body: { enabled },
                          })
                        }
                      />
                      {canWrite ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelected(event)
                            form.reset()
                          }}
                        >
                          Add binding
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.bindings.map((binding) => (
                          <TableRow key={binding.id}>
                            <TableCell className="font-mono">
                              {binding.templateCode}
                            </TableCell>
                            <TableCell>{binding.audience}</TableCell>
                            <TableCell>{binding.channel}</TableCell>
                            <TableCell>
                              {binding.enabled ? "Enabled" : "Disabled"}
                            </TableCell>
                            <TableCell>
                              {canWrite ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    mutate.mutate({
                                      path: apiPaths.masterData.eventBinding(
                                        event.type,
                                        binding.id
                                      ),
                                      method: "delete",
                                    })
                                  }
                                >
                                  Remove
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        <Dialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add notification binding</DialogTitle>
              <DialogDescription>
                Choose a matching template, audience and delivery channel.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(submit)}
            >
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="channel"
                  label="Channel"
                  required
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="templateCode"
                  label="Template"
                  required
                  render={({ field, fieldState }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {templates.data
                            ?.filter((item) => item.channel === channel)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.code}>
                                {item.code}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audience"
                  label="Audience"
                  required
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {["MAKER", "STEP_APPROVERS", "TAXPAYER", "ROLE"].map(
                            (item) => (
                              <SelectItem key={item} value={item}>
                                {item.replaceAll("_", " ")}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {audience === "ROLE" ? (
                  <FormField
                    control={form.control}
                    name="roleCode"
                    label="Role"
                    required
                    render={({ field, fieldState }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {roles.data?.map((role) => (
                              <SelectItem key={role.id} value={role.code}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : null}
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutate.isPending}>
                  Add binding
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
