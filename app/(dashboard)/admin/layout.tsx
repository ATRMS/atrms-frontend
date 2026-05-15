import type { ReactNode } from "react"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { prefetchAdminReferenceSelectQueries } from "@/lib/prefetch/admin-reference-select-queries"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const queryClient = new QueryClient()

  await prefetchAdminReferenceSelectQueries(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
  )
}
