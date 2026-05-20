"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createTinRequest } from "@/features/tin-requests/api/tin-requests-api"
import type { TinRequestCreatePayload } from "@/features/tin-requests/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateTinRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TinRequestCreatePayload) =>
      createTinRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.tinRequestsRoot(),
      })
      notify.success("TIN request submitted.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
