"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateBusinessLine } from "@/features/business-lines/api/business-lines-api"
import type { UpdateBusinessLinePayload } from "@/features/business-lines/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateBusinessLineMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBusinessLinePayload) =>
      updateBusinessLine(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.businessLinesRoot(),
      })
      notify.success("Business line updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
