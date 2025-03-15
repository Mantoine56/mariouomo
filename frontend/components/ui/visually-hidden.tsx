/**
 * VisuallyHidden Component
 * 
 * This component visually hides content but keeps it accessible to screen readers.
 * It's useful for providing additional context to assistive technologies
 * without affecting the visual presentation.
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
          // Hide element visually but still allow screen readers to read it
          'clip-[rect(0,0,0,0)]',
          className
        )}
        {...props}
      />
    )
  }
)

VisuallyHidden.displayName = 'VisuallyHidden' 