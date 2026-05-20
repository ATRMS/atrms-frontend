"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { approveTinRequest } from "@/features/tin-requests/api/tin-requests-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useApproveTinRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveTinRequest(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.tinRequestsRoot(),
      })
      const tin = data.generatedTin ?? ""
      notify.success(tin ? `TIN Issued: ${tin}` : "TIN request approved.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
