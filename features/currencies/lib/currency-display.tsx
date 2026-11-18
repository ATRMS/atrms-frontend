"use client"

import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function CurrencyDefaultStar({ isDefault }: { isDefault: boolean }) {
  return (
    <span
      className="inline-flex justify-center"
      aria-label={isDefault ? "Default currency" : "Not default"}
    >
      <StarIcon
        className={cn(
          "size-4",
          isDefault
            ? "fill-amber-500 text-amber-600"
            : "text-muted-foreground/40"
        )}
      />
    </span>
  )
}
