"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateCurrency } from "@/features/currencies/api/currencies-api"
import type { CurrencyWritePayload } from "@/features/currencies/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateCurrencyMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CurrencyWritePayload) => updateCurrency(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.currenciesRoot(),
      })
      notify.success("Currency updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
