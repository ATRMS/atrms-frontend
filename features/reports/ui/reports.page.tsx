"use client"
import { useQuery } from "@tanstack/react-query"
import { BarChart3Icon } from "lucide-react"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import type { ReportCategory } from "@/features/reports/types"
import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"
export function ReportsPage() {
  const query = useQuery({
    queryKey: queryKeys.reports.available(),
    queryFn: async () =>
      unwrapApiPayload(
        (
          await apiClient.get<ApiResponse<ReportCategory[]>>(
            apiPaths.reports.available
          )
        ).data
      ),
  })
  return (
    <PermissionGate
      permission={PermissionCodes.reportRead}
      fallback={<PermissionDeniedFallback resourceLabel="reports" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Reports"
          description="Open reports available to your roles."
        />
        {query.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {category.reports.map((report) => (
                    <div key={report.code} className="rounded-lg border p-3">
                      <p className="font-medium">{report.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {report.code}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3Icon />
              </EmptyMedia>
              <EmptyTitle>No reports are available yet</EmptyTitle>
              <EmptyDescription>
                Reports will appear here when they are enabled for your role.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </PermissionGate>
  )
}
