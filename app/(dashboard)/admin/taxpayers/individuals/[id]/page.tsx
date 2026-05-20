import { IndividualTaxpayerDetailPage } from "@/features/individual-taxpayers/ui/individual-taxpayer-detail.page"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminIndividualTaxpayerDetailPage({
  params,
}: PageProps) {
  const { id } = await params

  return <IndividualTaxpayerDetailPage taxpayerId={id} />
}
