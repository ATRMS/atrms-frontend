"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateOrganization } from "@/features/organizations/api/organizations-api"
import type { OrganizationUpdatePayload } from "@/features/organizations/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateOrganizationMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OrganizationUpdatePayload) =>
      updateOrganization(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.organizationsRoot(),
      })
      notify.success("Organization updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
