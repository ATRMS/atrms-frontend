"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createTaxOffice } from "@/features/tax-offices/api/tax-offices-api"
import type { TaxOfficeWritePayload } from "@/features/tax-offices/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateTaxOfficeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxOfficeWritePayload) => createTaxOffice(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.taxOfficesRoot(),
      })
      notify.success("Tax office created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
