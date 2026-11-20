import { ParameterDetailPage } from "@/features/parameters/ui/parameter-detail.page"
export default async function ParameterDetailRoute({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return <ParameterDetailPage code={code} />
}
