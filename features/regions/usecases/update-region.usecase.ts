"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateRegion } from "@/features/regions/api/regions-api"
import type { RegionWritePayload } from "@/features/regions/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateRegionMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegionWritePayload) => updateRegion(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.regionsRoot(),
      })
      notify.success("Region updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
