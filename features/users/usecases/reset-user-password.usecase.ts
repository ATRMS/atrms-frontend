"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { resetUserPassword } from "@/features/users/api/users-api"
import type { ResetPasswordResponseData } from "@/features/users/types"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/types/api"

export function useResetUserPasswordMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation<ResetPasswordResponseData, ApiError, void>({
    mutationFn: () => resetUserPassword(userId),
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
