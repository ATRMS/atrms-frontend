"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateRole } from "@/features/roles/api/roles-api"
import type { UpdateRoleFormValues } from "@/features/roles/schemas"
import type { RoleListItem } from "@/features/roles/types"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import { ApiError } from "@/types/api"

export type UpdateRoleMutationInput = {
  roleId: string
  values: UpdateRoleFormValues
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<RoleListItem, ApiError, UpdateRoleMutationInput>({
    mutationFn: ({ roleId, values }) =>
      updateRole(roleId, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.referenceSelectOptions.roles(),
      })
      notify.success("Role updated.")
    },
    onError: (error) => {
      notify.error(error.message)
    },
  })
}
