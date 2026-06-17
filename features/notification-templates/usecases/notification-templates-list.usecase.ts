"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchNotificationTemplatesList,
  type NotificationTemplatesListParams,
} from "@/features/notification-templates/api/notification-templates-api"
import { queryKeys } from "@/lib/query-keys"

export function useNotificationTemplatesQuery(
  params?: NotificationTemplatesListParams
) {
  return useQuery({
    queryKey: queryKeys.notificationTemplates.lists(params?.channel),
    queryFn: () => fetchNotificationTemplatesList(params),
  })
}
