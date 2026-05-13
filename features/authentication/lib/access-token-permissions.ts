/**
 * Decode JWT payload (middle segment) without verifying the signature.
 * Used only to read non-sensitive claims the backend embedded (e.g. permission codes).
 */
export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )

    const json =
      typeof globalThis.atob === "function"
        ? globalThis.atob(padded)
        : Buffer.from(padded, "base64").toString("utf8")

    const parsed = JSON.parse(json) as unknown

    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** Normalize common JWT / Spring / OAuth shapes into permission strings. */
export function extractPermissionCodesFromPayload(
  payload: Record<string, unknown>
): string[] {
  const out = new Set<string>()

  const permissions = payload.permissions
  if (Array.isArray(permissions)) {
    for (const item of permissions) {
      if (typeof item === "string" && item.length > 0) out.add(item)
    }
  }

  const permission = payload.permission
  if (typeof permission === "string" && permission.length > 0) {
    out.add(permission)
  }

  const scope = payload.scope
  if (typeof scope === "string" && scope.length > 0) {
    for (const s of scope.split(/\s+/)) {
      if (s) out.add(s)
    }
  }

  const authorities = payload.authorities
  if (Array.isArray(authorities)) {
    for (const item of authorities) {
      if (typeof item === "string" && item.length > 0) out.add(item)
      else if (
        typeof item === "object" &&
        item !== null &&
        "authority" in item
      ) {
        const a = (item as { authority?: unknown }).authority
        if (typeof a === "string" && a.length > 0) out.add(a)
      }
    }
  }

  const realmAccess = payload.realm_access
  if (typeof realmAccess === "object" && realmAccess !== null) {
    const roles = (realmAccess as { roles?: unknown }).roles
    if (Array.isArray(roles)) {
      for (const r of roles) {
        if (typeof r === "string" && r.length > 0) out.add(r)
      }
    }
  }

  return [...out]
}

export function extractPermissionsFromAccessToken(token: string): string[] {
  const payload = decodeJwtPayload(token)
  if (!payload) return []

  return extractPermissionCodesFromPayload(payload)
}
