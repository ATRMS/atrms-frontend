import type { RegistryTaxpayerType } from "@/features/taxpayers/types"
import { Badge } from "@/components/ui/badge"

export function RegistryTaxpayerTypeBadge({
  taxpayerType,
}: {
  taxpayerType: RegistryTaxpayerType
}) {
  if (taxpayerType === "INDIVIDUAL") {
    return (
      <Badge variant="outline" className="font-normal">
        Individual
      </Badge>
    )
  }

  return <Badge variant="secondary">Corporate</Badge>
}
