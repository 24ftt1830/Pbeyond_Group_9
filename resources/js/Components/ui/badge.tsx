import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "ui-badge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "ui-badge-info",
        secondary:
          "ui-badge-neutral",
        destructive:
          "ui-badge-danger",
        outline: "border-input bg-white text-slate-600",
        success: "ui-badge-success",
        warning: "ui-badge-warning",
        info: "ui-badge-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
