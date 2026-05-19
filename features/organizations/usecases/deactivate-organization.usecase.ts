"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deactivateOrganization } from "@/features/organizations/api/organizations-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeactivateOrganizationMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deactivateOrganization(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.organizationsRoot(),
      })
      notify.success("Organization deactivated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
