"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
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
import type { RegistryReport } from "@/features/reports/types"
import { fetchRolesList } from "@/features/roles/api/roles-api"
import { apiClient, normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"
export function ReportRegistryPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.systemWrite)
  )
  const [editing, setEditing] = useState<RegistryReport | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [enabled, setEnabled] = useState(false)
  const reports = useQuery({
    queryKey: queryKeys.masterData.resourceRoot("report-registry"),
    queryFn: async () =>
      unwrapApiPayload(
        (
          await apiClient.get<ApiResponse<RegistryReport[]>>(
            apiPaths.masterData.reports
          )
        ).data
      ),
  })
  const roleOptions = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: fetchRolesList,
  })
  const save = useMutation({
    mutationFn: () =>
      apiClient.put(apiPaths.masterData.reportDetail(editing?.code ?? ""), {
        allowedRoles: roles,
        enabled,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("report-registry"),
      })
      setEditing(null)
      notify.success("Report registry updated.")
    },
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  function edit(report: RegistryReport) {
    setEditing(report)
    setRoles(report.allowedRoles)
    setEnabled(report.enabled)
  }
  return (
    <PermissionGate
      permission={PermissionCodes.systemRead}
      fallback={<PermissionDeniedFallback resourceLabel="report registry" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Report registry"
          description="Control which reports are enabled and which roles may see them."
        />
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.data?.map((report) => (
                <TableRow key={report.code}>
                  <TableCell>
                    <p className="font-medium">{report.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {report.code}
                    </p>
                  </TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {report.allowedRoles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={report.enabled}
                      disabled
                      aria-label={`${report.title} enabled`}
                    />
                  </TableCell>
                  <TableCell>
                    {canWrite ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => edit(report)}
                      >
                        Edit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editing?.title}</DialogTitle>
              <DialogDescription>
                Both enabled status and allowed roles are saved together.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="report-enabled">Enabled</FieldLabel>
                <Switch
                  id="report-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </Field>
              <FieldSet>
                <FieldLegend>Allowed roles</FieldLegend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {roleOptions.data?.map((role) => (
                    <Field key={role.id} orientation="horizontal">
                      <Checkbox
                        id={`report-role-${role.code}`}
                        checked={roles.includes(role.code)}
                        onCheckedChange={(checked) =>
                          setRoles((current) =>
                            checked
                              ? [...current, role.code]
                              : current.filter((item) => item !== role.code)
                          )
                        }
                      />
                      <FieldLabel htmlFor={`report-role-${role.code}`}>
                        {role.name}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              </FieldSet>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
