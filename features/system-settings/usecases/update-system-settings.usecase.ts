"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateSystemSettings } from "@/features/system-settings/api/system-settings-api"
import type { UpdateSystemSettingsPayload } from "@/features/system-settings/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateSystemSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsPayload) =>
      updateSystemSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.system.settings(),
      })
      notify.success("Settings saved.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
