"use client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWorkflowInstance } from "@/features/workflow/api/workflow-api"
import { queryKeys } from "@/lib/query-keys"

export function StatusHistory({ instanceId }: { instanceId: string | null }) {
  const query = useQuery({
    queryKey: queryKeys.workflow.instance(instanceId ?? "installation"),
    queryFn: () => fetchWorkflowInstance(instanceId ?? ""),
    enabled: Boolean(instanceId),
  })
  if (!instanceId)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Set at installation</EmptyTitle>
          <EmptyDescription>
            This value did not go through an approval workflow.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  if (query.isPending) return <Skeleton className="h-28 w-full" />
  return (
    <div className="flex flex-col gap-3">
      {query.data?.history.map((item, index) => (
        <div key={`${item.actedAt}-${index}`} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {item.actorName} · {item.action}
            </p>
            <time
              className="text-xs text-muted-foreground"
              dateTime={item.actedAt}
            >
              {format(new Date(item.actedAt), "PPp")}
            </time>
          </div>
          <p className="text-sm text-muted-foreground">
            {item.fromState} → {item.toState} · Level {item.level}
          </p>
          {item.remarks ? <p className="mt-2 text-sm">{item.remarks}</p> : null}
        </div>
      ))}
    </div>
  )
}
