import { Suspense } from "react"

import { RolesPage } from "@/features/roles/ui/roles.page"
import { Skeleton } from "@/components/ui/skeleton"

function RolesFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  )
}

export default function AdminRolesRoutePage() {
  return (
    <Suspense fallback={<RolesFallback />}>
      <RolesPage />
    </Suspense>
  )
}
