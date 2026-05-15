"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { putRolePermissions } from "@/features/roles/api/roles-api"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
import { ApiError } from "@/types/api"
import { SetRolePermissionsPayload } from "@/features/roles/types"

export function useSaveRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApiError,
    SetRolePermissionsPayload & { roleId: string }
  >({
    mutationFn: ({ roleId, permissionIds }) =>
      putRolePermissions(roleId, { permissionIds }),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.roles.permissions(payload.roleId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      notify.success("Permissions saved.")
    },
    onError: (error) => {
      notify.error(error.message)
    },
  })
}
