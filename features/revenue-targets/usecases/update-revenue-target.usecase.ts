"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateRevenueTarget } from "@/features/revenue-targets/api/revenue-targets-api"
import type { RevenueTargetWritePayload } from "@/features/revenue-targets/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateRevenueTargetMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RevenueTargetWritePayload) =>
      updateRevenueTarget(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.revenueTargetsRoot(),
      })
      notify.success("Revenue target updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
