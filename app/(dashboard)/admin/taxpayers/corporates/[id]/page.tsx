import { CorporateTaxpayerDetailPage } from "@/features/corporate-taxpayers/ui/corporate-taxpayer-detail.page"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCorporateTaxpayerDetailPage({
  params,
}: PageProps) {
  const { id } = await params

  return <CorporateTaxpayerDetailPage taxpayerId={id} />
}
