"use client"

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
import { changePassword } from "@/features/authentication/actions/session.actions"
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/features/authentication/schemas"
import { useAuthStore } from "@/features/authentication/store/auth-store"

export function ChangePasswordPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: ChangePasswordValues) {
    setError(null)
    startTransition(async () => {
      try {
        const session = await changePassword(
          values.currentPassword,
          values.newPassword
        )
        setSession(session)
        router.replace("/dashboard")
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Password change failed."
        if (message.toLowerCase().includes("current")) {
          form.setError("currentPassword", { type: "server", message })
        } else {
          setError(message)
        }
      }
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Change your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a private password before continuing to ATRMS.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormField
              control={form.control}
              name="currentPassword"
              label="Current password"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
              )}
            />
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
              label="Confirm new password"
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
                title="Password not changed"
              />
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Save and continue
            </Button>
          </FieldGroup>
        </form>
      </section>
    </main>
  )
}
