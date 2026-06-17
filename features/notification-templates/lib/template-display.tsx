import type { NotificationChannel } from "@/features/notification-templates/types"
import { Badge } from "@/components/ui/badge"

export function NotificationChannelBadge({
  channel,
}: {
  channel: NotificationChannel
}) {
  return (
    <Badge variant={channel === "EMAIL" ? "outline" : "secondary"}>
      {channel}
    </Badge>
  )
}

export function NotificationTemplateStatusBadge({
  isActive,
}: {
  isActive: boolean
}) {
  return (
    <Badge variant={isActive ? "success" : "destructive"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}
