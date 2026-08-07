import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

type EmotionalReturnProps = {
  value: 1 | 2 | 3 | 4 | 5;
  className?: string;
};

export function EmotionalReturn({ value, className }: EmotionalReturnProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Retorno emocional ${value} de 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              filled ? "fill-accent text-accent" : "text-ink-disabled",
            )}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}
