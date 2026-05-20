import type { ReactNode } from "react"

import { TaxpayersRegistryLayout } from "@/features/taxpayers/ui/taxpayers-registry-layout"

export default function AdminTaxpayersLayout({
  children,
}: {
  children: ReactNode
}) {
  return <TaxpayersRegistryLayout>{children}</TaxpayersRegistryLayout>
}
