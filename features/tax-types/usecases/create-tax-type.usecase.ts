"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createTaxType } from "@/features/tax-types/api/tax-types-api"
import type { TaxTypeWritePayload } from "@/features/tax-types/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateTaxTypeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxTypeWritePayload) => createTaxType(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxTypesRoot(),
      })
      notify.success("Tax type created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
