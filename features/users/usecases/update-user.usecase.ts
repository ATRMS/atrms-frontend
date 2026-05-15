"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateUser } from "@/features/users/api/users-api"
import type { UpdateUserPayload, UserDetail } from "@/features/users/types"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/types/api"

export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation<UserDetail, ApiError, UpdateUserPayload>({
    mutationFn: (payload) => updateUser(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      })
    },
  })
}
