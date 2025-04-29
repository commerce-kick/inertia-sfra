"use client"

import { memo } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VariationAttribute } from "@/types/productFactory"

interface VariationAttributesProps {
  attributes: VariationAttribute[]
  onVariationChange?: (url: string) => void
}

// Componente para un valor de variación tipo swatch (color)
const SwatchValue = memo(
  ({
    value,
    onSelect,
  }: {
    value: VariationAttribute["values"][0]
    onSelect: () => void
  }) => {
    return (
      <button
        disabled={!value.selectable}
        onClick={onSelect}
        className={cn(
          "relative h-10 w-10 rounded-full border-2 transition-all",
          value.selected ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
          !value.selectable && "cursor-not-allowed opacity-50",
        )}
        title={value.displayValue}
        aria-label={`Select ${value.displayValue}`}
        aria-disabled={!value.selectable}
        aria-selected={value.selected}
      >
        {value.images?.swatch?.at(0) ? (
          <img
            src={value.images.swatch[0].url || "/placeholder.svg"}
            alt={value.displayValue}
            className="h-full w-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full rounded-full" style={{ backgroundColor: value.value.toLowerCase() }} />
        )}
        {value.selected && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check className="h-4 w-4 text-white drop-shadow-md" />
          </span>
        )}
      </button>
    )
  },
)
SwatchValue.displayName = "SwatchValue"

// Componente para un valor de variación tipo texto
const TextValue = memo(
  ({
    value,
    onSelect,
  }: {
    value: VariationAttribute["values"][0]
    onSelect: () => void
  }) => {
    return (
      <button
        disabled={!value.selectable}
        onClick={onSelect}
        className={cn(
          "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          value.selected
            ? "border-primary bg-primary/10 text-primary"
            : "border-muted bg-popover hover:bg-muted hover:text-muted-foreground",
          !value.selectable && "cursor-not-allowed opacity-50",
        )}
        aria-label={`Select ${value.displayValue}`}
        aria-disabled={!value.selectable}
        aria-selected={value.selected}
      >
        {value.displayValue}
      </button>
    )
  },
)
TextValue.displayName = "TextValue"

// Componente para un atributo de variación
const VariationAttributeComponent = memo(
  ({
    attribute,
    onVariationChange,
  }: {
    attribute: VariationAttribute
    onVariationChange?: (url: string) => void
  }) => {
    const handleVariationSelect = (url: string) => {
      if (onVariationChange) {
        onVariationChange(url)
      }
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{attribute.displayName}</h4>
          {attribute.resetUrl && (
            <button
              onClick={() => handleVariationSelect(attribute.resetUrl!)}
              className="text-xs text-primary hover:underline"
              aria-label={`Reset ${attribute.displayName}`}
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {attribute.values.map((value) => {
            const handleSelect = () => {
              if (value.selectable) {
                handleVariationSelect(value.url)
              }
            }

            return attribute.swatchable ? (
              <SwatchValue key={value.id} value={value} onSelect={handleSelect} />
            ) : (
              <TextValue key={value.id} value={value} onSelect={handleSelect} />
            )
          })}
        </div>
      </div>
    )
  },
)
VariationAttributeComponent.displayName = "VariationAttribute"

const VariationAttributes = memo(({ attributes, onVariationChange }: VariationAttributesProps) => {
  if (!attributes || attributes.length === 0) return null

  return (
    <div className="space-y-6">
      {attributes.map((attribute) => (
        <VariationAttributeComponent key={attribute.id} attribute={attribute} onVariationChange={onVariationChange} />
      ))}
    </div>
  )
})
VariationAttributes.displayName = "VariationAttributes"

export default VariationAttributes
