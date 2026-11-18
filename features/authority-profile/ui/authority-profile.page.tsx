"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ImageUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { FormField } from "@/components/shared/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  fetchAuthorityProfile,
  fetchPublicBranding,
  updateAuthorityProfile,
  uploadBranding,
} from "@/features/authority-profile/api/authority-profile-api"
import {
  authorityProfileSchema,
  type AuthorityProfileInput,
  type AuthorityProfileValues,
} from "@/features/authority-profile/schemas"
import type { BrandingAsset } from "@/features/authority-profile/types"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { normaliseError } from "@/lib/api/client"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

const assets: BrandingAsset[] = ["logo", "banner", "emblem", "signature"]
export function AuthorityProfilePage() {
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const client = useQueryClient()
  const [checking, setChecking] = useState(false)
  const profile = useQuery({
    queryKey: queryKeys.masterData.resourceDetail(
      "authority-profile",
      "current"
    ),
    queryFn: fetchAuthorityProfile,
  })
  const branding = useQuery({
    queryKey: queryKeys.masterData.resourceDetail("branding", "public"),
    queryFn: fetchPublicBranding,
    refetchInterval: checking ? 2000 : false,
  })
  const form = useForm<AuthorityProfileInput, unknown, AuthorityProfileValues>({
    resolver: zodResolver(authorityProfileSchema),
    defaultValues: {
      name: "",
      shortName: "",
      authorityCode: "",
      stateCode: "",
      address: "",
      headName: "",
      headTitle: "",
      phone: "",
      email: "",
      website: "",
    },
  })
  useEffect(() => {
    if (profile.data)
      form.reset({
        ...profile.data,
        shortName: profile.data.shortName ?? "",
        phone: profile.data.phone ?? "",
        website: profile.data.website ?? "",
      })
  }, [form, profile.data])
  const save = useMutation({
    mutationFn: updateAuthorityProfile,
    onSuccess: async (data) => {
      form.reset({
        ...data,
        shortName: data.shortName ?? "",
        phone: data.phone ?? "",
        website: data.website ?? "",
      })
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("authority-profile"),
      })
      notify.success("Authority profile saved.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.authority-profile.state-code-invalid": "stateCode",
        })
      )
        notify.error(error.message)
    },
  })
  const upload = useMutation({
    mutationFn: ({ asset, file }: { asset: BrandingAsset; file: File }) =>
      uploadBranding(asset, file),
    onSuccess: () => {
      setChecking(true)
      notify.success("Checking the file…")
      window.setTimeout(() => setChecking(false), 30000)
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      const message =
        error.messageKey === "master-data.branding.not-an-image"
          ? "Branding images must be PNG or JPEG"
          : error.message
      notify.error(message)
    },
  })
  if (profile.isPending)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="authority profile" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Authority profile"
          description="Manage the authority identity used across Tax IDs and official documents."
        />
        <Card>
          <CardHeader>
            <CardTitle>Authority details</CardTitle>
            <CardDescription>
              These values identify the revenue authority.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((values) => save.mutate(values))}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      disabled={!canWrite}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="shortName"
                    label="Short name"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id={field.name}
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="authorityCode"
                    label="Authority code"
                    required
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                        onChange={(event) =>
                          field.onChange(event.target.value.toUpperCase())
                        }
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stateCode"
                    label="State code"
                    required
                    description="Used in every new Tax ID and document number."
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        maxLength={2}
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                        onChange={(event) =>
                          field.onChange(event.target.value.toUpperCase())
                        }
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    label="Email"
                    required
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  label="Address"
                  required
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      id={field.name}
                      disabled={!canWrite}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="headName"
                    label="Head name"
                    required
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headTitle"
                    label="Head title"
                    required
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
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
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    label="Website"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id={field.name}
                        type="url"
                        disabled={!canWrite}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                </div>
                {canWrite ? (
                  <Button type="submit" disabled={save.isPending}>
                    Save profile
                  </Button>
                ) : null}
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              PNG or JPEG, up to 2 MB. Uploaded files are scanned before use.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map((asset) => {
              const image =
                asset === "logo"
                  ? branding.data?.logo
                  : asset === "banner"
                    ? branding.data?.banner
                    : null
              return (
                <div
                  key={asset}
                  className="flex min-h-44 flex-col gap-3 rounded-lg border p-4"
                >
                  <div className="flex min-h-24 items-center justify-center rounded-md bg-muted">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={`Current ${asset}`}
                        width={240}
                        height={96}
                        unoptimized
                        className="max-h-24 w-auto object-contain"
                      />
                    ) : (
                      <ImageUpIcon aria-hidden />
                    )}
                  </div>
                  <p className="font-medium capitalize">{asset}</p>
                  {canWrite ? (
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      aria-label={`Upload ${asset}`}
                      disabled={upload.isPending}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) upload.mutate({ asset, file })
                      }}
                    />
                  ) : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
        {checking ? (
          <Alert>
            <AlertDescription>
              Checking the uploaded file for safety…
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </PermissionGate>
  )
}
