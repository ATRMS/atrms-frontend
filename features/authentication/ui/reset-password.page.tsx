"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { ApiErrorAlert } from "@/components/shared/api-error-alert"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { resetPassword } from "@/features/authentication/actions/session.actions"
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/authentication/schemas"
import { PreLoginLanguageSelect } from "@/features/authentication/ui/pre-login-language-select"

export function ResetPasswordPage({
  userId,
  token,
}: {
  userId?: string
  token?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  function onSubmit(values: ResetPasswordValues) {
    if (!userId || !token) {
      setError("This reset link is incomplete or has expired.")
      return
    }

    startTransition(async () => {
      try {
        await resetPassword({ userId, token, newPassword: values.newPassword })
        router.replace("/login?passwordChanged=1")
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Password reset failed."
        if (message.toLowerCase().includes("short")) {
          form.setError("newPassword", { type: "server", message })
        } else {
          setError("This link has expired or was already used.")
        }
      }
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Your reset link can be used once and expires after 30 minutes.
          </p>
        </div>
        <div className="mb-4">
          <PreLoginLanguageSelect />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormField
              control={form.control}
              name="newPassword"
              label="New password"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
              )}
            />
            {error ? (
              <ApiErrorAlert
                error={{ message: error, traceId: "" }}
                title="Reset link unavailable"
              />
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}Change
              password
            </Button>
            {error ? (
              <Button asChild variant="link">
                <Link href="/forgot-password">Request another link</Link>
              </Button>
            ) : null}
          </FieldGroup>
        </form>
      </section>
    </main>
  )
}
