import * as React from "react";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm text-ink tabular-nums transition-colors placeholder:text-ink-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
