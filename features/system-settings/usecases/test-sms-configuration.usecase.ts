"use client"

import { useMutation } from "@tanstack/react-query"

import { testSmsConfiguration } from "@/features/system-settings/api/system-settings-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"

export function useTestSmsConfigurationMutation() {
  return useMutation({
    mutationFn: testSmsConfiguration,
    onSuccess: () => notify.success("Test SMS sent successfully."),
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
