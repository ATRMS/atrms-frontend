"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createCurrency } from "@/features/currencies/api/currencies-api"
import type { CurrencyWritePayload } from "@/features/currencies/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateCurrencyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CurrencyWritePayload) => createCurrency(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.currenciesRoot(),
      })
      notify.success("Currency created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
