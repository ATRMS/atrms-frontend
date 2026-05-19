"use client"

import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import {
  isEligibleRegionParent,
  regionShowsParentField,
} from "@/features/regions/lib/region-parent-types"
import { REGION_TYPE_LABELS } from "@/features/regions/lib/region-display"
import { toRegionWritePayload } from "@/features/regions/lib/region-payload"
import {
  regionFormSchema,
  type RegionFormInputValues,
  type RegionFormValues,
} from "@/features/regions/schemas"
import type { RegionListItem } from "@/features/regions/types"
import { REGION_TYPE_VALUES } from "@/features/regions/types"
import { useCreateRegionMutation } from "@/features/regions/usecases/create-region.usecase"
import { useUpdateRegionMutation } from "@/features/regions/usecases/update-region.usecase"
import { OPTIONAL_SELECT_NONE } from "@/features/users/schemas"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { regionsReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

const emptyDefaults: RegionFormInputValues = {
  code: "",
  name: "",
  type: "STATE",
  parentId: OPTIONAL_SELECT_NONE,
}

export type RegionUpsertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  region: RegionListItem | null
}

export function RegionUpsertDialog({
  open,
  onOpenChange,
  region,
}: RegionUpsertDialogProps) {
  const createMutation = useCreateRegionMutation()
  const updateMutation = useUpdateRegionMutation(region?.id ?? "")

  const { data: allRegions = [] } = useQuery(regionsReferenceQueryOptions())

  const form = useForm<RegionFormInputValues, unknown, RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: emptyDefaults,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedType = form.watch("type")

  useEffect(() => {
    if (!regionShowsParentField(watchedType)) {
      form.setValue("parentId", OPTIONAL_SELECT_NONE, {
        shouldValidate: true,
      })
    }
  }, [watchedType, form])

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
      return
    }

    if (region) {
      form.reset({
        code: region.code,
        name: region.name,
        type: region.type,
        parentId: region.parentId ?? OPTIONAL_SELECT_NONE,
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [open, region, form])

  const parentCandidates = useMemo(() => {
    return allRegions
      .filter(
        (r) =>
          r.id !== region?.id &&
          isEligibleRegionParent(watchedType, r.type)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allRegions, region?.id, watchedType])

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: RegionFormValues) {
    const payload = toRegionWritePayload(values)

    if (region) {
      updateMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const showParent = regionShowsParentField(watchedType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {region ? "Edit region" : "Add region"}
          </DialogTitle>
          <DialogDescription>
            {region
              ? "Codes cannot be changed after creation. Adjust hierarchy using parent where applicable."
              : "Define a geographic division. Parent links only apply below state level."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            {region ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Code
                </span>
                <span className="font-mono text-sm">{region.code}</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="code"
                label="Code"
                required
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. ENU-N-LGA"
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              label="Name"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Display name"
                />
              )}
            />

            <FormField
              control={form.control}
              name="type"
              label="Type"
              required
              render={({ field, fieldState }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Region type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {REGION_TYPE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {REGION_TYPE_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            {showParent ? (
              <FormField
                control={form.control}
                name="parentId"
                label="Parent region"
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Optional — state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={OPTIONAL_SELECT_NONE}>
                          None
                        </SelectItem>
                        {parentCandidates.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.code} — {r.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            ) : null}
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
