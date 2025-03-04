/**
 * Tooltip Component
 * 
 * A tooltip component that displays additional information when hovering over an element.
 * Built using Radix UI Tooltip primitive for accessibility and customization.
 */
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

/**
 * Tooltip Provider Component
 * 
 * A provider component that wraps all tooltip instances to ensure 
 * consistent behavior and styling across the application.
 */
const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip Component
 * 
 * A component that shows a tooltip when the user hovers over an element.
 */
const Tooltip = TooltipPrimitive.Root

/**
 * Tooltip Trigger Component
 * 
 * The element that triggers the tooltip to be shown when hovered.
 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Tooltip Content Component
 * 
 * The actual tooltip content that appears when the trigger is hovered.
 * 
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>
 *       <p>Tooltip content</p>
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } 