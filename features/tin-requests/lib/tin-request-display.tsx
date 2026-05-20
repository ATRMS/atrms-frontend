import { format, parseISO } from "date-fns"

import { Badge } from "@/components/ui/badge"
import type {
  TinRequestStatus,
  TinRequestTaxpayerType,
} from "@/features/tin-requests/types"

export function formatTinRequestDate(iso: string): string {
  try {
    return format(parseISO(iso), "PPp")
  } catch {
    return iso
  }
}

export function TinRequestStatusBadge({ status }: { status: TinRequestStatus }) {
  const variant =
    status === "PENDING"
      ? "pending"
      : status === "APPROVED"
        ? "success"
        : status === "REJECTED"
          ? "destructive"
          : "secondary"

  const label =
    status === "PENDING"
      ? "Pending"
      : status === "APPROVED"
        ? "Approved"
        : status === "REJECTED"
          ? "Rejected"
          : "Cancelled"

  return <Badge variant={variant}>{label}</Badge>
}

export function TinRequestTaxpayerTypeBadge({
  type,
}: {
  type: TinRequestTaxpayerType
}) {
  return (
    <Badge variant="outline">
      {type === "INDIVIDUAL" ? "Individual" : "Corporate"}
    </Badge>
  )
}

export function UuidPreview({
  id,
  maxLen = 10,
}: {
  id: string
  maxLen?: number
}) {
  const preview =
    id.length <= maxLen ? id : `${id.slice(0, maxLen)}…`

  return (
    <span className="font-mono text-xs" title={id}>
      {preview}
    </span>
  )
}
