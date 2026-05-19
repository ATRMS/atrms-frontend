"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createOrganization } from "@/features/organizations/api/organizations-api"
import type { OrganizationCreatePayload } from "@/features/organizations/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OrganizationCreatePayload) =>
      createOrganization(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.organizationsRoot(),
      })
      notify.success("Organization created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
