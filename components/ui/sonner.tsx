"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-canvas-elevated text-ink shadow-md font-sans",
          title: "text-sm font-medium",
          description: "text-sm text-ink-tertiary",
          success: "border-success/20",
          error: "border-danger/20",
        },
      }}
    />
  );
}
