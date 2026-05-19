"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { activateTaxType } from "@/features/tax-types/api/tax-types-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useActivateTaxTypeMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activateTaxType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxTypesRoot(),
      })
      notify.success("Tax type activated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
