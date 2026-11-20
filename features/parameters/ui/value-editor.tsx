"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Band, ValueType } from "@/features/parameters/types"

export function ValueEditor({
  valueType,
  value,
  onChange,
  invalid,
}: {
  valueType: ValueType
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}) {
  if (valueType !== "BANDS")
    return (
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={valueType === "DAY_OF_YEAR" ? "text" : "number"}
        step={valueType === "RATE" || valueType === "AMOUNT" ? "0.01" : "1"}
        min={0}
        placeholder={valueType === "DAY_OF_YEAR" ? "MM-DD" : undefined}
        aria-invalid={invalid}
      />
    )
  let bands: Band[] = []
  try {
    bands = JSON.parse(value) as Band[]
  } catch {
    bands = [{ upTo: null, rate: "0" }]
  }
  const change = (next: Band[]) => onChange(JSON.stringify(next))
  return (
    <div className="flex flex-col gap-3">
      {bands.map((band, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            aria-label={`Band ${index + 1} upper limit`}
            value={band.upTo ?? ""}
            disabled={index === bands.length - 1}
            placeholder={
              index === bands.length - 1 ? "No limit" : "Upper limit"
            }
            onChange={(event) =>
              change(
                bands.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, upTo: event.target.value || null }
                    : item
                )
              )
            }
          />
          <Input
            aria-label={`Band ${index + 1} rate`}
            value={String(Number(band.rate) * 100)}
            inputMode="decimal"
            onChange={(event) =>
              change(
                bands.map((item, itemIndex) =>
                  itemIndex === index
                    ? {
                        ...item,
                        rate: String(Number(event.target.value) / 100),
                      }
                    : item
                )
              )
            }
          />
          <Button
            type="button"
            variant="outline"
            disabled={bands.length === 1}
            onClick={() =>
              change(
                bands
                  .filter((_, itemIndex) => itemIndex !== index)
                  .map((item, itemIndex, all) =>
                    itemIndex === all.length - 1
                      ? { ...item, upTo: null }
                      : item
                  )
              )
            }
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() =>
          change([
            ...bands.map((item, index) =>
              index === bands.length - 1
                ? { ...item, upTo: item.upTo ?? "0" }
                : item
            ),
            { upTo: null, rate: "0" },
          ])
        }
      >
        Add band
      </Button>
    </div>
  )
}
