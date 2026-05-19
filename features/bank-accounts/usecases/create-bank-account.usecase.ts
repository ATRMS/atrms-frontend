"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createBankAccount } from "@/features/bank-accounts/api/bank-accounts-api"
import type { BankAccountCreatePayload } from "@/features/bank-accounts/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateBankAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BankAccountCreatePayload) =>
      createBankAccount(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.bankAccountsRoot(),
      })
      notify.success("Bank account created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
