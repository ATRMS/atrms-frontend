export type NotificationChannel = "SMS" | "EMAIL"

export type NotificationTemplateListItem = {
  id: string
  code: string
  channel: NotificationChannel
  subject: string | null
  body: string
  availableVariables: string[]
  isSystem: boolean
  isActive: boolean
}

export type CreateNotificationTemplatePayload = {
  code: string
  channel: NotificationChannel
  subject?: string | null
  body: string
  availableVariables: string[]
}

export type UpdateNotificationTemplatePayload = {
  subject?: string | null
  body: string
  isActive?: boolean
}

export type PatchNotificationTemplateStatusPayload = {
  isActive: boolean
}

export type NotificationTemplatePreviewPayload = {
  subject?: string | null
  body: string
}

export type NotificationTemplatePreviewResult = {
  rendered: string
}
