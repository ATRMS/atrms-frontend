import { Suspense } from "react"

import { UsersPage } from "@/features/users/ui/users.page"
import { Skeleton } from "@/components/ui/skeleton"

function UsersTableFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-[160px]" />
        <Skeleton className="h-9 w-[180px]" />
        <Skeleton className="h-9 w-[160px]" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  )
}

export default function AdminUsersRoutePage() {
  return (
    <Suspense fallback={<UsersTableFallback />}>
      <UsersPage />
    </Suspense>
  )
}
