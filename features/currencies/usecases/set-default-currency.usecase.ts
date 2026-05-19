"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { setDefaultCurrency } from "@/features/currencies/api/currencies-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useSetDefaultCurrencyMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => setDefaultCurrency(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.currenciesRoot(),
      })
      notify.success("Default currency updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
