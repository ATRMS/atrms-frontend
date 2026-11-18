"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { BackLink } from "@/components/shared/back-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  fetchCitation,
  fetchCitationVersions,
} from "@/features/legal-citations/api/legal-citations-api"
import type { CitationVersion } from "@/features/legal-citations/types"
import { CitationFormDialog } from "@/features/legal-citations/ui/citation-form-dialog"
import { runWorkflowAction } from "@/features/workflow/api/workflow-api"
import { StatusHistory } from "@/features/workflow/ui/status-history"
import { VersionActionBar } from "@/features/workflow/ui/version-action-bar"
import type { WorkflowAction } from "@/features/workflow/types"
import { apiClient, normaliseError } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"
export function LegalCitationDetailPage({ code }: { code: string }) {
  const client = useQueryClient()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const citation = useQuery({
    queryKey: queryKeys.masterData.resourceDetail("legal-citations", code),
    queryFn: () => fetchCitation(code),
  })
  const versions = useQuery({
    queryKey: [
      ...queryKeys.masterData.resourceDetail("legal-citations", code),
      "versions",
    ],
    queryFn: () => fetchCitationVersions(code),
  })
  const [selected, setSelected] = useState<CitationVersion | null>(null)
  const [open, setOpen] = useState(false)
  const current = selected ?? versions.data?.[0] ?? null
  const action = useMutation({
    mutationFn: ({
      next,
      remarks,
    }: {
      next: WorkflowAction
      remarks?: string
    }) =>
      runWorkflowAction(
        `${apiPaths.masterData.legalCitationVersion(code, current?.version ?? 0)}/${next}`,
        remarks
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("legal-citations"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
    },
    onError: (caught) => notify.error(normaliseError(caught).message),
  })
  const toggle = useMutation({
    mutationFn: () =>
      apiClient.patch(
        `${apiPaths.masterData.legalCitationDetail(code)}/${citation.data?.active ? "deactivate" : "activate"}`
      ),
    onSuccess: async () =>
      client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("legal-citations"),
      }),
  })
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/legal-citations">
        Back to legal citations
      </BackLink>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{code}</h1>
          <p className="text-muted-foreground">
            {citation.data?.inForce?.title ?? "No approved wording in force"}
          </p>
        </div>
        <div className="flex gap-2">
          {canWrite ? (
            <>
              <Button variant="outline" onClick={() => toggle.mutate()}>
                {citation.data?.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                onClick={() => {
                  setSelected(null)
                  setOpen(true)
                }}
              >
                Propose new wording
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="history">Status history</TabsTrigger>
        </TabsList>
        <TabsContent value="versions" className="flex flex-col gap-3">
          {versions.data?.map((version) => (
            <Button
              key={version.version}
              variant="outline"
              className="h-auto justify-start py-3"
              onClick={() => setSelected(version)}
            >
              <Badge variant="outline">v{version.version}</Badge>
              <span>{version.title}</span>
              <span>
                {version.effectiveFrom}
                {version.effectiveTo ? ` → ${version.effectiveTo}` : ""}
              </span>
              <Badge>{version.status}</Badge>
            </Button>
          ))}
          {current ? (
            <VersionActionBar
              status={current.status}
              proposedBy={current.proposedBy}
              pending={action.isPending}
              onEdit={() => setOpen(true)}
              onAction={(next, remarks) => action.mutate({ next, remarks })}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="history">
          <StatusHistory instanceId={current?.instanceId ?? null} />
        </TabsContent>
      </Tabs>
      <CitationFormDialog
        code={code}
        version={selected?.status === "RETURNED" ? selected : null}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
