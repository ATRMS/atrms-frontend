import { CorporateTaxpayersPage } from "@/features/corporate-taxpayers/ui/corporate-taxpayers.page"

type PageProps = {
  searchParams: Promise<{ tin?: string | string[] }>
}

export default async function AdminCorporateTaxpayersPage({
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

  return <CorporateTaxpayersPage tin={tin} />
}
