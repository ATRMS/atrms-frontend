"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { registerCorporateTaxpayer } from "@/features/corporate-taxpayers/api/corporate-taxpayers-api"
import type { RegisterCorporatePayload } from "@/features/corporate-taxpayers/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useRegisterCorporateTaxpayerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterCorporatePayload) =>
      registerCorporateTaxpayer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.all,
      })
      notify.success("Corporate taxpayer registered.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
