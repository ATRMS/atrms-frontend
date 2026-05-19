"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateTaxOffice } from "@/features/tax-offices/api/tax-offices-api"
import type { TaxOfficeWritePayload } from "@/features/tax-offices/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateTaxOfficeMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxOfficeWritePayload) => updateTaxOffice(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxOfficesRoot(),
      })
      notify.success("Tax office updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
