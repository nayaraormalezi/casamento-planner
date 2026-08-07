import { cn } from "@/utils/cn";

type StepperProps = {
  steps: number;
  current: number;
  className?: string;
};

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden>
      {Array.from({ length: steps }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <span
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-colors",
              done && "bg-accent",
              active && "bg-ink",
              !done && !active && "bg-canvas-muted",
            )}
          />
        );
      })}
    </div>
  );
}
