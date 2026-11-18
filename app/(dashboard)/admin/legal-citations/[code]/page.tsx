import { LegalCitationDetailPage } from "@/features/legal-citations/ui/legal-citation-detail.page"
export default async function LegalCitationDetailRoute({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return <LegalCitationDetailPage code={code} />
}
