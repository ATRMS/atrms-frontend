"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchNotificationTemplateStatus } from "@/features/notification-templates/api/notification-templates-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeactivateNotificationTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      patchNotificationTemplateStatus(id, { isActive: false }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationTemplates.all,
      })
      notify.success("Template deactivated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
