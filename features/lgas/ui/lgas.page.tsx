"use client"
import { CodeNameMasterDataPage } from "@/components/shared/code-name-master-data-page"
import { apiPaths } from "@/lib/api/endpoints"
export function LgasPage() {
  return (
    <CodeNameMasterDataPage
      resource="lgas"
      title="LGAs"
      description="Manage local government areas used in master data."
      singular="LGA"
      collectionPath={apiPaths.masterData.lgas}
      detailPath={apiPaths.masterData.lgaDetail}
      activatePath={apiPaths.masterData.lgaActivate}
      deactivatePath={apiPaths.masterData.lgaDeactivate}
      codeTakenKey="master-data.lga.code-taken"
    />
  )
}
