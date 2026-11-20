"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { FormField } from "@/components/shared/form-field"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { NumberFormat } from "@/features/number-formats/types"
import { apiClient, normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"
import { useForm } from "react-hook-form"

export function NumberFormatsPage() {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.systemWrite)
  )
  const [editing, setEditing] = useState<NumberFormat | null>(null)
  const form = useForm<{ pattern: string }>({ defaultValues: { pattern: "" } })
  const query = useQuery({
    queryKey: queryKeys.masterData.resourceRoot("number-formats"),
    queryFn: async () =>
      unwrapApiPayload(
        (
          await apiClient.get<ApiResponse<NumberFormat[]>>(
            apiPaths.masterData.numberFormats
          )
        ).data
      ),
  })
  const save = useMutation({
    mutationFn: async (values: { pattern: string }) =>
      unwrapApiPayload(
        (
          await apiClient.put<ApiResponse<NumberFormat>>(
            apiPaths.masterData.numberFormatDetail(editing?.code ?? ""),
            values
          )
        ).data
      ),
    onSuccess: async (saved) => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("number-formats"),
      })
      setEditing(saved)
      form.reset({ pattern: saved.pattern })
      notify.success(`Saved. Next number: ${saved.preview}`)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      form.setError("pattern", { type: "server", message: error.message })
    },
  })
  function edit(item: NumberFormat) {
    setEditing(item)
    form.reset({ pattern: item.pattern })
  }
  return (
    <PermissionGate
      permission={PermissionCodes.systemRead}
      fallback={<PermissionDeniedFallback resourceLabel="number formats" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Number formats"
          description="Configure the fixed system numbering patterns."
        />
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Next number</TableHead>
                <TableHead>Resets</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="font-mono">{item.pattern}</TableCell>
                  <TableCell className="font-mono">{item.preview}</TableCell>
                  <TableCell>{item.reset}</TableCell>
                  <TableCell>
                    {item.locked ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button size="sm" variant="outline" disabled>
                              Edit
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          This format is locked because numbers have been
                          issued.
                        </TooltipContent>
                      </Tooltip>
                    ) : canWrite ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => edit(item)}
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
              <DialogTitle>Edit {editing?.name}</DialogTitle>
              <DialogDescription>
                Use one {`{SEQ:n}`} token. Optional tokens: {`{YYYY}`},{" "}
                {`{STATE}`}, {`{TYPE}`}, {`{LINE:n}`}; {`{CHECK}`} must be last.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
            >
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="pattern"
                  label="Pattern"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      className="font-mono"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
              </FieldGroup>
              {editing ? (
                <p className="text-sm text-muted-foreground">
                  Preview: <span className="font-mono">{editing.preview}</span>
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Close
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
