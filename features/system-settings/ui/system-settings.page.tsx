"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import {
  formValuesToUpdatePayload,
  mailCredentialsConfigured,
  SECRET_FIELD_PLACEHOLDER,
  smsCredentialsConfigured,
  systemSettingsToFormValues,
} from "@/features/system-settings/lib/settings-form"
import { integerInputFieldProps } from "@/features/system-settings/lib/integer-input-field"
import {
  systemSettingsFormSchema,
  type SystemSettingsFormInputValues,
  type SystemSettingsFormValues,
} from "@/features/system-settings/schemas"
import type { SystemSettings } from "@/features/system-settings/types"
import { useSystemSettingsQuery } from "@/features/system-settings/usecases/system-settings-query.usecase"
import { useTestMailConfigurationMutation } from "@/features/system-settings/usecases/test-mail-configuration.usecase"
import { useTestSmsConfigurationMutation } from "@/features/system-settings/usecases/test-sms-configuration.usecase"
import { useUpdateSystemSettingsMutation } from "@/features/system-settings/usecases/update-system-settings.usecase"
import { FormField } from "@/components/shared/form-field"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/features/authentication/store/auth-store"

function SettingsForm({
  settings,
  readOnly,
}: {
  settings: SystemSettings
  readOnly: boolean
}) {
  const hadMailPassword = mailCredentialsConfigured(settings)
  const hadSmsApiKey = smsCredentialsConfigured(settings)

  const updateMutation = useUpdateSystemSettingsMutation()
  const testMailMutation = useTestMailConfigurationMutation()
  const testSmsMutation = useTestSmsConfigurationMutation()

  const form = useForm<
    SystemSettingsFormInputValues,
    unknown,
    SystemSettingsFormValues
  >({
    resolver: zodResolver(systemSettingsFormSchema),
    defaultValues: systemSettingsToFormValues(settings),
  })

  useEffect(() => {
    form.reset(systemSettingsToFormValues(settings))
  }, [settings, form])

  const isDirty = form.formState.isDirty

  function onSubmit(values: SystemSettingsFormValues) {
    updateMutation.mutate(
      formValuesToUpdatePayload(values, { hadMailPassword, hadSmsApiKey }),
      {
        onSuccess: (data) => {
          form.reset(systemSettingsToFormValues(data))
        },
      }
    )
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="gap-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="mail">Mail</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <FieldGroup className="max-w-lg gap-4">
              <Alert>
                <AlertDescription>
                  The authority&apos;s name and codes are under Organisation →{" "}
                  <Link href="/admin/authority-profile">Authority profile</Link>
                  .
                </AlertDescription>
              </Alert>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="security">
            <FieldGroup className="max-w-lg gap-4">
              <FormField
                control={form.control}
                name="sessionTimeoutMinutes"
                label="Session timeout (minutes)"
                description="5 to 480 minutes."
                render={({ field, fieldState }) => (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={5}
                    max={480}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    {...integerInputFieldProps(field.value, field.onChange)}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="failedLoginAttempts"
                label="Failed login attempts"
                description="3 to 10 attempts before lockout."
                render={({ field, fieldState }) => (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={3}
                    max={10}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    {...integerInputFieldProps(field.value, field.onChange)}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="passwordExpirationDays"
                label="Password expiration (days)"
                description="0 means passwords never expire."
                render={({ field, fieldState }) => (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    {...integerInputFieldProps(field.value, field.onChange)}
                  />
                )}
              />
            </FieldGroup>
          </TabsContent>

          <TabsContent value="mail">
            <FieldGroup className="max-w-lg gap-4">
              <FormField
                control={form.control}
                name="mailServer"
                label="Email server"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="mailSender"
                label="Email sender"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="email"
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="mailUser"
                label="Email username"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="mailPassword"
                label="Email password"
                description={
                  hadMailPassword
                    ? "Leave blank to keep the existing password."
                    : undefined
                }
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    disabled={readOnly}
                    placeholder={
                      hadMailPassword ? SECRET_FIELD_PLACEHOLDER : undefined
                    }
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={testMailMutation.isPending}
                  onClick={() => testMailMutation.mutate()}
                >
                  {testMailMutation.isPending
                    ? "Sending test…"
                    : "Test email configuration"}
                </Button>
              ) : null}
            </FieldGroup>
          </TabsContent>

          <TabsContent value="sms">
            <FieldGroup className="max-w-lg gap-4">
              <FormField
                control={form.control}
                name="smsGatewayUrl"
                label="SMS gateway URL"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    disabled={readOnly}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="smsApiKey"
                label="SMS API key"
                description={
                  hadSmsApiKey
                    ? "Leave blank to keep the existing API key."
                    : undefined
                }
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="off"
                    disabled={readOnly}
                    placeholder={
                      hadSmsApiKey ? SECRET_FIELD_PLACEHOLDER : undefined
                    }
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={testSmsMutation.isPending}
                  onClick={() => testSmsMutation.mutate()}
                >
                  {testSmsMutation.isPending
                    ? "Sending test…"
                    : "Test SMS configuration"}
                </Button>
              ) : null}
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </div>

      {!readOnly ? (
        <div className="shrink-0 border-t bg-muted/30 px-0 py-4">
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : null}
    </form>
  )
}

export function SystemSettingsPage() {
  const settingsQuery = useSystemSettingsQuery()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.systemWrite)
  )

  return (
    <PermissionGate
      permission={PermissionCodes.systemRead}
      fallback={<PermissionDeniedFallback resourceLabel="global settings" />}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <PageHeader
          title="Global settings"
          description="Configure authority identity, security policy, and outbound mail and SMS."
        />

        {settingsQuery.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full max-w-lg" />
          </div>
        ) : settingsQuery.isError ? (
          <p className="text-sm text-destructive">
            {(settingsQuery.error as Error)?.message ??
              "Failed to load settings."}
          </p>
        ) : settingsQuery.data ? (
          <SettingsForm settings={settingsQuery.data} readOnly={!canWrite} />
        ) : null}
      </div>
    </PermissionGate>
  )
}
