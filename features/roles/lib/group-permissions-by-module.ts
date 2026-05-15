import type { PermissionCatalogItem } from "@/features/roles/types"

export function groupPermissionsByModule(
  items: PermissionCatalogItem[]
): Map<string, PermissionCatalogItem[]> {
  const map = new Map<string, PermissionCatalogItem[]>()

  for (const p of items) {
    const key = p.module || "OTHER"
    const bucket = map.get(key)

    if (bucket) {
      bucket.push(p)
    } else {
      map.set(key, [p])
    }
  }

  for (const bucket of map.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name))
  }

  return map
}

export function sortedModuleKeys(map: Map<string, PermissionCatalogItem[]>) {
  return [...map.keys()].sort((a, b) => a.localeCompare(b))
}
