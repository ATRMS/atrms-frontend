"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateProfession } from "@/features/professions/api/professions-api"
import type { ProfessionWritePayload } from "@/features/professions/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useUpdateProfessionMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProfessionWritePayload) =>
      updateProfession(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.professionsRoot(),
      })
      notify.success("Profession updated.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
