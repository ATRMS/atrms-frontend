/**
 * Permission strings from the auth API / JWT `permissions` claim (`resource:action`).
 * Sync with `GET …/permissions` (or equivalent) — order follows backend modules.
 */
export const PermissionCodes = {
  attachmentRead: "attachment:read",
  attachmentUpload: "attachment:upload",
  auditExport: "audit:export",
  auditRead: "audit:read",
  masterDataRead: "master-data:read",
  masterDataWrite: "master-data:write",
  masterDataApprove: "master-data:approve",
  masterDataSignOff: "master-data:sign-off",
  reportExport: "report:export",
  reportGenerate: "report:generate",
  reportRead: "report:read",
  roleCreate: "role:create",
  roleDelete: "role:delete",
  roleRead: "role:read",
  roleUpdate: "role:update",

  systemRead: "system:read",
  systemWrite: "system:write",
  taxpayerApproveTin: "taxpayer:approve-tin",
  taxpayerCreate: "taxpayer:create",
  taxpayerDelete: "taxpayer:delete",
  taxpayerRead: "taxpayer:read",
  taxpayerUpdate: "taxpayer:update",

  userAssignRole: "user:assign-role",
  userCreate: "user:create",
  userDelete: "user:delete",
  userRead: "user:read",
  userResetPassword: "user:reset-password",
  userUpdate: "user:update",
  workflowInbox: "workflow:inbox",
  workflowRead: "workflow:read",
  workflowConfigure: "workflow:configure",
} as const

export type PermissionCode =
  (typeof PermissionCodes)[keyof typeof PermissionCodes]

export const ALL_PERMISSION_CODES = Object.values(
  PermissionCodes
) as PermissionCode[]
