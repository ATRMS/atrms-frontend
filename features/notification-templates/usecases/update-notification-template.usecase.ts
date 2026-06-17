"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateNotificationTemplate } from "@/features/notification-templates/api/notification-templates-api"
import type { UpdateNotificationTemplatePayload } from "@/features/notification-templates/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateNotificationTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateNotificationTemplatePayload
    }) => updateNotificationTemplate(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationTemplates.all,
      })
      notify.success("Template saved.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
