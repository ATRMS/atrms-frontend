import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ApiError } from "@/types/api"

export function ApiErrorAlert({
  error,
  title = "Something went wrong",
}: {
  error: Pick<ApiError, "message" | "traceId">
  title?: string
}) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-1">
        <span>{error.message}</span>
        {error.traceId ? (
          <span className="text-xs">Reference: {error.traceId}</span>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
