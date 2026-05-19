"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createRegion } from "@/features/regions/api/regions-api"
import type { RegionWritePayload } from "@/features/regions/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateRegionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegionWritePayload) => createRegion(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.regionsRoot(),
      })
      notify.success("Region created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
