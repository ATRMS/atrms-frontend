"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { activateBankAccount } from "@/features/bank-accounts/api/bank-accounts-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useActivateBankAccountMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activateBankAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.bankAccountsRoot(),
      })
      notify.success("Bank account activated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
