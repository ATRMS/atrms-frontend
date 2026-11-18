"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { FormField } from "@/components/shared/form-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { requestPasswordReset } from "@/features/authentication/actions/session.actions"
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/authentication/schemas"
import { PreLoginLanguageSelect } from "@/features/authentication/ui/pre-login-language-select"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: ForgotPasswordValues) {
    startTransition(async () => {
      await requestPasswordReset(values.email).catch(() => undefined)
      setSent(true)
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address to request a password reset.
          </p>
        </div>
        <div className="mb-4">
          <PreLoginLanguageSelect />
        </div>
        {sent ? (
          <Alert>
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              If that email is registered, a reset link is on its way.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormField
                control={form.control}
                name="email"
                label="Email address"
                required
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Send reset link
              </Button>
            </FieldGroup>
          </form>
        )}
        <Button asChild variant="link" className="mt-4 px-0">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </section>
    </main>
  )
}
