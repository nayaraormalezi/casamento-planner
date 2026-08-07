import { cn } from "@/utils/cn";

const priorityClass: Record<number, string> = {
  5: "bg-priority-5/10 text-priority-5",
  4: "bg-priority-4/10 text-priority-4",
  3: "bg-priority-3/15 text-priority-3",
  2: "bg-priority-2/15 text-priority-2",
  1: "bg-priority-1/20 text-priority-1",
};

const labels: Record<number, string> = {
  5: "Essencial",
  4: "Muito importante",
  3: "Importante",
  2: "Desejável",
  1: "Luxo",
};

type PriorityBadgeProps = {
  priority: 1 | 2 | 3 | 4 | 5;
  showLabel?: boolean;
  className?: string;
};

export function PriorityBadge({
  priority,
  showLabel = false,
  className,
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        priorityClass[priority],
        className,
      )}
      title={labels[priority]}
    >
      P{priority}
      {showLabel ? ` · ${labels[priority]}` : null}
    </span>
  );
}
