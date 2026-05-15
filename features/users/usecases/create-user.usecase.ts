"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createUser,
  type CreateUserApiResult,
} from "@/features/users/api/users-api"
import type { CreateUserPayload } from "@/features/users/types"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/types/api"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<CreateUserApiResult, ApiError, CreateUserPayload>({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    onError: (error: ApiError) => {
      notify.error(error.message)
    },
  })
}
