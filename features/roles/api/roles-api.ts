import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  CreateRolePayload,
  PermissionCatalogItem,
  RoleListItem,
  SetRolePermissionsPayload,
  UpdateRolePayload,
} from "@/features/roles/types"
import type { ApiResponse } from "@/types/api"

export async function fetchRolesList(): Promise<RoleListItem[]> {
  const res = await apiClient.get<ApiResponse<RoleListItem[]>>(
    apiPaths.roles.collection
  )

  return unwrapApiPayload(res.data)
}

export async function createRole(payload: CreateRolePayload): Promise<string> {
  const res = await apiClient.post<ApiResponse<string>>(
    apiPaths.roles.collection,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateRole(
  id: string,
  payload: UpdateRolePayload
): Promise<RoleListItem> {
  const res = await apiClient.put<ApiResponse<RoleListItem>>(
    apiPaths.roles.detail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(apiPaths.roles.detail(id))
}

export async function fetchPermissionCatalog(): Promise<
  PermissionCatalogItem[]
> {
  const res = await apiClient.get<ApiResponse<PermissionCatalogItem[]>>(
    apiPaths.permissions.collection
  )

  return unwrapApiPayload(res.data)
}

export async function fetchRolePermissions(
  roleId: string
): Promise<PermissionCatalogItem[]> {
  const res = await apiClient.get<ApiResponse<PermissionCatalogItem[]>>(
    apiPaths.roles.permissions(roleId)
  )

  return unwrapApiPayload(res.data)
}

export async function putRolePermissions(
  roleId: string,
  payload: SetRolePermissionsPayload
): Promise<void> {
  await apiClient.put(apiPaths.roles.permissions(roleId), payload)
}
