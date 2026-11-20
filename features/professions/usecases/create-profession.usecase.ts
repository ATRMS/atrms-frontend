"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createProfession } from "@/features/professions/api/professions-api"
import type { ProfessionWritePayload } from "@/features/professions/types"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useCreateProfessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProfessionWritePayload) => createProfession(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.professionsRoot(),
      })
      notify.success("Profession created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
