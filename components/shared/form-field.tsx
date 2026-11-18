"use client"

import type { ReactNode } from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type SharedFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues = TFieldValues,
> = Omit<ControllerProps<TFieldValues, TName, TTransformedValues>, "render"> & {
  description?: ReactNode
  label: string
  required?: boolean
  render: ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
}

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  description,
  label,
  required = false,
  render,
  ...controllerProps
}: SharedFormFieldProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...controllerProps}
      render={(renderProps) => {
        const error = renderProps.fieldState.error

        return (
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={renderProps.field.name}>
              {label}
              {required ? <span aria-hidden="true">*</span> : null}
            </FieldLabel>
            {render(renderProps)}
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            <FieldError errors={error ? [error] : undefined} />
          </Field>
        )
      }}
    />
  )
}
