"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateIndividualTaxpayer } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import type { UpdateIndividualTaxpayerPayload } from "@/features/individual-taxpayers/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateIndividualTaxpayerMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateIndividualTaxpayerPayload) =>
      updateIndividualTaxpayer(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.all,
      })
      notify.success("Profile updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
