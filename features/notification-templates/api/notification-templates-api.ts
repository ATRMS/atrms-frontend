import { templateBodyFromApi } from "@/features/notification-templates/lib/template-body"
import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  CreateNotificationTemplatePayload,
  NotificationTemplateListItem,
  NotificationTemplatePreviewPayload,
  NotificationTemplatePreviewResult,
  PatchNotificationTemplateStatusPayload,
  UpdateNotificationTemplatePayload,
} from "@/features/notification-templates/types"
import type { ApiResponse } from "@/types/api"

export type NotificationTemplatesListParams = {
  channel?: "SMS" | "EMAIL"
}

export async function fetchNotificationTemplatesList(
  params?: NotificationTemplatesListParams
): Promise<NotificationTemplateListItem[]> {
  const res = await apiClient.get<ApiResponse<NotificationTemplateListItem[]>>(
    apiPaths.notificationTemplates.collection,
    { params }
  )

  return unwrapApiPayload(res.data)
}

export async function createNotificationTemplate(
  payload: CreateNotificationTemplatePayload
): Promise<NotificationTemplateListItem> {
  const res = await apiClient.post<ApiResponse<NotificationTemplateListItem>>(
    apiPaths.notificationTemplates.collection,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateNotificationTemplate(
  id: string,
  payload: UpdateNotificationTemplatePayload
): Promise<NotificationTemplateListItem> {
  const res = await apiClient.put<ApiResponse<NotificationTemplateListItem>>(
    apiPaths.notificationTemplates.detail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function patchNotificationTemplateStatus(
  id: string,
  payload: PatchNotificationTemplateStatusPayload
): Promise<NotificationTemplateListItem> {
  const res = await apiClient.patch<ApiResponse<NotificationTemplateListItem>>(
    apiPaths.notificationTemplates.status(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function previewNotificationTemplate(
  id: string,
  payload: NotificationTemplatePreviewPayload
): Promise<NotificationTemplatePreviewResult> {
  const res = await apiClient.post<
    ApiResponse<NotificationTemplatePreviewResult>
  >(apiPaths.notificationTemplates.preview(id), payload)

  const { rendered } = unwrapApiPayload(res.data)
  return { rendered: templateBodyFromApi(rendered) }
}
