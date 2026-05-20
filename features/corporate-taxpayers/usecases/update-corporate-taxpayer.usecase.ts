"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateCorporateTaxpayer } from "@/features/corporate-taxpayers/api/corporate-taxpayers-api"
import type { UpdateCorporateTaxpayerPayload } from "@/features/corporate-taxpayers/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateCorporateTaxpayerMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCorporateTaxpayerPayload) =>
      updateCorporateTaxpayer(id, payload),
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
