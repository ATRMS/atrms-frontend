"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchTaxpayerStatus } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import type { PatchTaxpayerStatusPayload } from "@/features/individual-taxpayers/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function usePatchTaxpayerStatusMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PatchTaxpayerStatusPayload) =>
      patchTaxpayerStatus(id, payload),
    onSuccess: () => {
      /* Prefix match: invalidates detail keys, individuals/corporates lists, etc. */
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.all,
      })
      notify.success("Status updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
