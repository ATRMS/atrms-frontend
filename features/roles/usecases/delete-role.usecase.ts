"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteRole } from "@/features/roles/api/roles-api"
import { normaliseError } from "@/lib/api/client"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.referenceSelectOptions.roles(),
      })
      notify.success("Role deleted.")
    },
    onError: (error: unknown) => {
      notify.error(normaliseError(error).message)
    },
  })
}
