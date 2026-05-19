"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { activateProfession } from "@/features/professions/api/professions-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useActivateProfessionMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activateProfession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.professionsRoot(),
      })
      notify.success("Profession activated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
