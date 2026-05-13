"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { login } from "@/features/authentication/actions/session.actions"
import { loginFormSchema, type LoginFormValues } from "@/features/authentication/schemas"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export type LoginPageProps = {
  appName: string
}

export function LoginPage({ appName }: LoginPageProps) {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [isPending, startTransition] = useTransition()
  const [loginError, setLoginError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: LoginFormValues) {
    setLoginError(null)

    startTransition(async () => {
      try {
        const session = await login(values.email, values.password)
        setSession(session)
        router.replace("/dashboard")
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Sign in failed. Please try again."

        setLoginError(message)
      }
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground">
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{appName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
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
            <FormField
              control={form.control}
              name="password"
              label="Password"
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
            {loginError ? (
              <div
                role="alert"
                aria-live="assertive"
                className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/8 px-3 py-3 text-sm shadow-sm dark:bg-destructive/15 dark:border-destructive/45"
              >
                <CircleAlertIcon
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden
                />
                <p className="min-w-0 leading-snug text-destructive">
                  {loginError}
                </p>
              </div>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link href="/forgot-password">Forgot password?</Link>
        </Button>
      </section>
    </main>
  )
}
