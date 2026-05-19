"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deactivateBusinessLine } from "@/features/business-lines/api/business-lines-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeactivateBusinessLineMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deactivateBusinessLine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.businessLinesRoot(),
      })
      notify.success("Business line deactivated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
