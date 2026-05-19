"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deactivateTaxType } from "@/features/tax-types/api/tax-types-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeactivateTaxTypeMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deactivateTaxType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxTypesRoot(),
      })
      notify.success("Tax type deactivated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
