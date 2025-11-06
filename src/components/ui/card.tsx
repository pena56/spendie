import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card container element with base styling and a `data-slot="card"` attribute for composing card layouts.
 *
 * @returns The rendered card element.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card's header container with layout classes and a `data-slot="card-header"` attribute.
 *
 * @param className - Additional CSS classes to merge with the component's default header classes.
 * @returns A `div` element configured as the card header with composed class names and any forwarded props.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a div intended for a card title with the component's base title styling.
 *
 * @param className - Additional CSS classes to merge with the component's base `leading-none font-semibold` styles
 * @returns A `div` element with `data-slot="card-title"` and a composed `className`
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the card description slot.
 *
 * @returns A div element with `data-slot="card-description"` that applies the `"text-muted-foreground text-sm"` base styles merged with `className` and forwards remaining div props.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders a div that serves as the card's action slot and is positioned for header-aligned actions.
 *
 * @param className - Additional CSS classes to merge with the component's positioning classes
 * @param props - Other standard div props to apply to the rendered element
 * @returns A div element configured as the card action slot (includes `data-slot="card-action"` and positioning classes)
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card's content region.
 *
 * Applies horizontal padding and merges any provided `className` onto the wrapper div.
 *
 * @param className - Additional CSS classes to apply to the content container
 * @returns The content container `div` with `data-slot="card-content"`
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders a footer container for a Card with a data-slot attribute and base layout styling.
 *
 * @returns A `div` element for the card footer with horizontal padding, centered items, and top-border spacing, which merges additional classes and props provided by the caller.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}