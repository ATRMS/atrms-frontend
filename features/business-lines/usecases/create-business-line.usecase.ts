"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createBusinessLine } from "@/features/business-lines/api/business-lines-api"
import type { CreateBusinessLinePayload } from "@/features/business-lines/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateBusinessLineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBusinessLinePayload) =>
      createBusinessLine(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.businessLinesRoot(),
      })
      notify.success("Business line created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
