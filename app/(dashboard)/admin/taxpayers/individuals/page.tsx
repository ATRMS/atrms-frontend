import { IndividualsTaxpayersPage } from "@/features/individual-taxpayers/ui/individual-taxpayers.page"

type PageProps = {
  searchParams: Promise<{ tin?: string | string[] }>
}

export default async function AdminIndividualTaxpayersPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams
  const raw = sp.tin
  const tin =
    typeof raw === "string"
      ? raw.trim() || undefined
      : Array.isArray(raw)
        ? raw[0]?.trim() || undefined
        : undefined

  return <IndividualsTaxpayersPage tin={tin} />
}
