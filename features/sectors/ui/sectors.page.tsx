"use client"

import { CodeNameMasterDataPage } from "@/components/shared/code-name-master-data-page"
import { apiPaths } from "@/lib/api/endpoints"
import { ApiErrorCodes } from "@/lib/api/error-codes"

export function SectorsPage() {
  return (
    <CodeNameMasterDataPage
      resource="sectors"
      title="Sectors"
      description="Manage the sectors that group business lines."
      singular="Sector"
      collectionPath={apiPaths.masterData.sectors}
      detailPath={apiPaths.masterData.sectorDetail}
      activatePath={apiPaths.masterData.sectorActivate}
      deactivatePath={apiPaths.masterData.sectorDeactivate}
      codeTakenKey="master-data.sector.code-taken"
      blockedCode={ApiErrorCodes.sectorHasActiveLines}
      blockedMessage="Move or deactivate this sector's business lines first."
      blockedHref={(sector) => `/admin/business-lines?sectorId=${sector.id}`}
    />
  )
}
