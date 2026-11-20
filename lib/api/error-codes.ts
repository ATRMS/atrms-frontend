export const ApiErrorCodes = {
  workflowSegregationOfDuties: "WORKFLOW_SEGREGATION_OF_DUTIES",
  workflowNotTheMaker: "WORKFLOW_NOT_THE_MAKER",
  workflowPermissionRequired: "WORKFLOW_PERMISSION_REQUIRED",
  workflowRemarksRequired: "WORKFLOW_REMARKS_REQUIRED",
  workflowTransitionNotAllowed: "WORKFLOW_TRANSITION_NOT_ALLOWED",
  workflowConcurrentUpdate: "WORKFLOW_CONCURRENT_UPDATE",
  workflowAlreadyOpen: "WORKFLOW_ALREADY_OPEN",
  workflowDefinitionChanged: "WORKFLOW_DEFINITION_CHANGED",
  workflowInvalidDefinition: "WORKFLOW_INVALID_DEFINITION",
  workflowConfigureNeedsStateScope: "WORKFLOW_CONFIGURE_NEEDS_STATE_SCOPE",
  attachmentScanPending: "ATTACHMENT_SCAN_PENDING",
  attachmentScanInfected: "ATTACHMENT_SCAN_INFECTED",
  regionHasActiveOffices: "REGION_HAS_ACTIVE_OFFICES",
  sectorHasActiveLines: "SECTOR_HAS_ACTIVE_LINES",
} as const

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes]
