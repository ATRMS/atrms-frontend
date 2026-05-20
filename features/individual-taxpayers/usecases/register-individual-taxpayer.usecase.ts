"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { registerIndividualTaxpayer } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import type { RegisterIndividualPayload } from "@/features/individual-taxpayers/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useRegisterIndividualTaxpayerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterIndividualPayload) =>
      registerIndividualTaxpayer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.all,
      })
      notify.success("Individual taxpayer registered.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
