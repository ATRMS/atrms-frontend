"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchUserStatus } from "@/features/users/api/users-api"
import type { PatchUserStatusPayload, UserDetail } from "@/features/users/types"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/types/api"

export function usePatchUserStatusMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation<UserDetail, ApiError, PatchUserStatusPayload>({
    mutationFn: (payload) => patchUserStatus(userId, payload),
    onSuccess: () => {
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
