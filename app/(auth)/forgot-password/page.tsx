import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
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
        <form className="flex flex-col gap-4">
          <Input type="email" name="email" placeholder="Email address" />
          <Button type="submit">Send reset link</Button>
        </form>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </section>
    </main>
  )
}
