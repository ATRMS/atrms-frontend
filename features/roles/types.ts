/** Catalog permission row (`GET /permissions` or role assignment lists). */
export interface PermissionCatalogItem {
  id: string
  code: string
  name: string
  module: string
}

/** Row from `GET /roles`. */
export interface RoleListItem {
  id: string
  code: string
  name: string
  description?: string | null
  isSystem?: boolean
}

/** Alias for reference selects — same row as `GET /roles`. */
export type RoleOption = RoleListItem

/** POST `/roles`. */
export interface CreateRolePayload {
  code: string
  name: string
  description?: string
}

/** PATCH `/roles/:id` (name/description only). */
export interface UpdateRolePayload {
  name: string
  description?: string
}

/** PUT `/roles/:id/permissions`. */
export interface SetRolePermissionsPayload {
  permissionIds: string[]
}
