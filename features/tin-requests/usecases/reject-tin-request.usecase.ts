"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { rejectTinRequest } from "@/features/tin-requests/api/tin-requests-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useRejectTinRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectTinRequest(id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.tinRequestsRoot(),
      })
      notify.success("TIN request rejected.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
