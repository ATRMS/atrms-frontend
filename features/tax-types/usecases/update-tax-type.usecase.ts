"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateTaxType } from "@/features/tax-types/api/tax-types-api"
import type { TaxTypeWritePayload } from "@/features/tax-types/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateTaxTypeMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxTypeWritePayload) => updateTaxType(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxTypesRoot(),
      })
      notify.success("Tax type updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
