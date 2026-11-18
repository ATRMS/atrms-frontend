import { Suspense } from "react"
import { RevenueHeadsPage } from "@/features/revenue-heads/ui/revenue-heads.page"
export default function RevenueHeadsRoute() {
  return (
    <Suspense>
      <RevenueHeadsPage />
    </Suspense>
  )
}
