"use client"

import { useMutation } from "@tanstack/react-query"

import { testMailConfiguration } from "@/features/system-settings/api/system-settings-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"

export function useTestMailConfigurationMutation() {
  return useMutation({
    mutationFn: testMailConfiguration,
    onSuccess: () => notify.success("Test email sent successfully."),
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
