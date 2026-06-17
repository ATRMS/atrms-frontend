"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createNotificationTemplate } from "@/features/notification-templates/api/notification-templates-api"
import type { CreateNotificationTemplatePayload } from "@/features/notification-templates/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateNotificationTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNotificationTemplatePayload) =>
      createNotificationTemplate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationTemplates.all,
      })
      notify.success("Notification template created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
