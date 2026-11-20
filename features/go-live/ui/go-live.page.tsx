"use client"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { FormField } from "@/components/shared/form-field"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { GoLiveCheck, SignOffArea } from "@/features/go-live/types"
import { apiClient, normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"

const schema = z.object({
  signerName: z.string().trim().min(1, "Signer name is required"),
  signerTitle: z.string().trim().min(1, "Signer title is required"),
  signedOn: z
    .string()
    .date()
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "Signed on cannot be in the future"
    ),
  notes: z.string().trim().optional(),
})
type Values = z.infer<typeof schema>
export function GoLivePage() {
  const client = useQueryClient()
  const canSign = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataSignOff)
  )
  const [area, setArea] = useState<SignOffArea | null>(null)
  const query = useQuery({
    queryKey: queryKeys.masterData.resourceDetail("go-live", "check"),
    queryFn: async () =>
      unwrapApiPayload(
        (
          await apiClient.get<ApiResponse<GoLiveCheck>>(
            apiPaths.masterData.goLiveCheck
          )
        ).data
      ),
  })
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      signerName: "",
      signerTitle: "",
      signedOn: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  })
  const save = useMutation({
    mutationFn: (values: Values) =>
      apiClient.post(apiPaths.masterData.goLiveSignoffs, { area, ...values }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("go-live"),
      })
      setArea(null)
      notify.success("Sign-off recorded.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (error.messageKey === "master-data.signoff.future-date")
        form.setError("signedOn", { type: "server", message: error.message })
      else notify.error(error.message)
    },
  })
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="go-live check" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Go-live check"
          description="Confirm that statutory values and legal wording are ready for production."
          action={
            <Badge variant={query.data?.ready ? "default" : "destructive"}>
              {query.data?.ready ? "Ready" : "Not ready"}
            </Badge>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {query.data?.modules.map((module) => (
            <Card key={module.module}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  {module.module}
                  <Badge variant={module.ready ? "default" : "secondary"}>
                    {module.ready ? "Ready" : "Missing values"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {module.missing.length ? (
                  module.missing.map((code) => (
                    <Button key={code} asChild variant="outline" size="sm">
                      <Link href={`/admin/parameters/${code}`}>{code}</Link>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing missing.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(["PARAMETERS", "CITATIONS"] as const).map((signArea) => {
            const status = query.data?.signOffs.find(
              (item) => item.area === signArea
            )
            return (
              <Card key={signArea}>
                <CardHeader>
                  <CardTitle>
                    {signArea === "PARAMETERS"
                      ? "Parameters"
                      : "Legal citations"}{" "}
                    sign-off
                  </CardTitle>
                  <CardDescription>
                    {status?.signed && status.latest
                      ? `Signed by ${status.latest.signerName} on ${status.latest.signedOn}`
                      : "Needs a sign-off"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {canSign ? (
                    <Button
                      variant={status?.signed ? "outline" : "default"}
                      onClick={() => setArea(signArea)}
                    >
                      Record sign-off
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Dialog
          open={Boolean(area)}
          onOpenChange={(open) => {
            if (!open) setArea(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record {area?.toLowerCase()} sign-off</DialogTitle>
              <DialogDescription>
                Record the responsible officer and date.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
            >
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="signerName"
                  label="Signer name"
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
                  name="signerTitle"
                  label="Signer title"
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
                  name="signedOn"
                  label="Signed on"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  label="Notes"
                  render={({ field, fieldState }) => (
                    <Textarea
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
                  onClick={() => setArea(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  Record sign-off
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
