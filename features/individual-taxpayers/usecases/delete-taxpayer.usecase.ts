"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteTaxpayer } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeleteTaxpayerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaxpayer(id),
    onSuccess: (_data, id) => {
      void queryClient.removeQueries({
        queryKey: queryKeys.taxpayers.taxpayerDetail(id),
      })
      void queryClient.removeQueries({
        queryKey: queryKeys.taxpayers.corporateTaxpayerDetail(id),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taxpayers.all,
      })
      notify.success("Taxpayer deleted.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
