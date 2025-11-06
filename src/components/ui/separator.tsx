import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Renders a styled separator element that wraps Radix UI's SeparatorPrimitive.Root.
 *
 * @param className - Additional CSS classes to apply to the separator
 * @param orientation - Layout direction of the separator; "horizontal" or "vertical"
 * @param decorative - Whether the separator is purely decorative (accessible API will reflect this)
 * @returns The configured SeparatorPrimitive.Root element
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }