"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createUserTransfer } from "@/features/users/api/users-api"
import type { TransferUserPayload } from "@/features/users/types"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/types/api"

export function useCreateUserTransferMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, TransferUserPayload>({
    mutationFn: (payload) => createUserTransfer(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.transfers(userId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    onError: (error: ApiError) => {
      notify.error(error.message)
    },
  })
}
