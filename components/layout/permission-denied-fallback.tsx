import type { ReactNode } from "react"
import { ShieldOffIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type PermissionDeniedFallbackProps = {
  /**
   * Area the user tried to open (e.g. "tax types", "users").
   * Used in the default description unless `description` is provided.
   */
  resourceLabel: string
  /** Card heading — defaults to "Access restricted" (`variant="panel"` only). */
  title?: string
  /** Replace the default description entirely. */
  description?: ReactNode
  className?: string
  /**
   * Full-page style card vs compact notice (e.g. inside a sheet).
   * @default "panel"
   */
  variant?: "panel" | "inline"
  /**
   * Verbs for the default description copy.
   * @default "view"
   */
  accessVerb?: "view" | "update"
}

function DefaultPermissionDeniedDescription({
  resourceLabel,
  accessVerb,
}: {
  resourceLabel: string
  accessVerb: "view" | "update"
}) {
  const verb = accessVerb === "update" ? "update" : "view"

  return (
    <>
      You don&apos;t have permission to {verb}{" "}
      <span className="font-medium text-foreground">{resourceLabel}</span>. Ask
      an administrator if you need access.
    </>
  )
}

/**
 * Empty state when `PermissionGate` denies access — clearer than a lone paragraph.
 */
export function PermissionDeniedFallback({
  resourceLabel,
  title = "Access restricted",
  description,
  className,
  variant = "panel",
  accessVerb = "view",
}: PermissionDeniedFallbackProps) {
  const body = description ?? (
    <DefaultPermissionDeniedDescription
      resourceLabel={resourceLabel}
      accessVerb={accessVerb}
    />
  )

  if (variant === "inline") {
    return (
      <div
        role="note"
        className={cn(
          "flex gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm",
          className
        )}
      >
        <ShieldOffIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <p className="min-w-0 leading-relaxed text-muted-foreground">{body}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-[min(320px,45vh)] items-center justify-center py-8",
        className
      )}
    >
      <Card
        size="sm"
        className="w-full max-w-lg overflow-hidden shadow-none ring-border/80"
      >
        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 sm:flex-row sm:items-start">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
            aria-hidden
          >
            <ShieldOffIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-2 text-center sm:text-left">
            <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed text-pretty">
              {body}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
