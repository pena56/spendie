"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Render a styled label element using Radix UI's Label primitive.
 *
 * Renders a LabelPrimitive.Root with default layout, typography, and disabled-state styles,
 * merges any provided `className`, sets `data-slot="label"`, and forwards all other props.
 *
 * @param className - Additional CSS class names to merge with the component's default styles
 * @param props - Additional props forwarded to `LabelPrimitive.Root`
 * @returns The configured `LabelPrimitive.Root` element with merged classes and forwarded props
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }