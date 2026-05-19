"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateBankAccount } from "@/features/bank-accounts/api/bank-accounts-api"
import type { BankAccountUpdatePayload } from "@/features/bank-accounts/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateBankAccountMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BankAccountUpdatePayload) =>
      updateBankAccount(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.bankAccountsRoot(),
      })
      notify.success("Bank account updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
