"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { activateOrganization } from "@/features/organizations/api/organizations-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useActivateOrganizationMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activateOrganization(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.organizationsRoot(),
      })
      notify.success("Organization activated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
