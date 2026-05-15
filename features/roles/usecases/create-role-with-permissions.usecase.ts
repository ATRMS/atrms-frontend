"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createRole,
  putRolePermissions,
} from "@/features/roles/api/roles-api"
import type { CreateRoleDetailsValues } from "@/features/roles/schemas"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export type CreateRoleWithPermissionsInput = {
  draft: CreateRoleDetailsValues
  permissionIds: string[]
}

export function useCreateRoleWithPermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      draft,
      permissionIds,
    }: CreateRoleWithPermissionsInput) => {
      const roleId = await createRole({
        code: draft.code,
        name: draft.name,
        description: draft.description,
      })

      await putRolePermissions(roleId, { permissionIds })
      return roleId
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.referenceSelectOptions.roles(),
      })
      notify.success("Role created.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
