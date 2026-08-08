"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { estimateTaskSpend } from "@/modules/tasks/estimates";
import {
  CHECKLIST_BUCKET_COPY,
  type ChecklistBucket,
  type ChecklistGroups,
  type ChecklistItem,
} from "@/modules/tasks/checklist";
import type { Task, WeddingWorkspace } from "@/types/domain";
import { cn, formatMoneyBRL } from "@/utils/cn";

export type ChecklistView = ChecklistBucket | "all" | "focus";

type ChecklistBoardProps = {
  workspace: WeddingWorkspace;
  groups: ChecklistGroups;
  view: ChecklistView;
  onToggleDone: (task: Task) => void;
  onOpenTask: (task: Task) => void;
};

function TaskRow({
  item,
  workspace,
  onToggleDone,
  onOpenTask,
}: {
  item: ChecklistItem;
  workspace: WeddingWorkspace;
  onToggleDone: (task: Task) => void;
  onOpenTask: (task: Task) => void;
}) {
  const { task } = item;
  const estimate = estimateTaskSpend(task, workspace);
  const chosen = task.budgetOptions.find((o) => o.isSelected);
  const tone =
    item.bucket === "now"
      ? "text-danger"
      : item.bucket === "soon"
        ? "text-warning"
        : "text-ink-tertiary";

  return (
    <li className="rounded-lg border border-border bg-canvas-elevated px-3 py-3 sm:px-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--wp-accent)] sm:h-4 sm:w-4"
          checked={task.status === "done"}
          onChange={() => onToggleDone(task)}
          aria-label={`Concluir ${task.title}`}
        />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onOpenTask(task)}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <p
                className={cn(
                  "text-sm font-medium text-ink",
                  task.status === "done" && "text-ink-tertiary line-through",
                )}
              >
                {task.title}
              </p>
              <p className="text-xs tabular-nums text-ink-tertiary">
                {item.effortLabel}
              </p>
            </div>
            {task.status !== "done" ? (
              <p className="mt-1 line-clamp-2 text-sm text-ink-secondary sm:line-clamp-none">
                {item.why}
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className={tone}>{item.dueLabel}</span>
              <span className="text-ink-tertiary">{item.moduleLabel}</span>
              {task.status === "doing" ? (
                <StatusBadge status="doing" />
              ) : null}
              {chosen ? (
                <span className="tabular-nums text-ink-secondary">
                  {formatMoneyBRL(chosen.amount)} definidos
                </span>
              ) : estimate.estimatedCents > 0 ? (
                <span className="hidden tabular-nums text-ink-tertiary sm:inline">
                  ~{formatMoneyBRL(estimate.estimatedCents)}
                </span>
              ) : null}
            </div>
          </button>
          <div className="mt-3 flex gap-2 sm:mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 sm:hidden"
              onClick={() => onOpenTask(task)}
            >
              Detalhes
            </Button>
            <Button size="sm" className="flex-1 sm:hidden" asChild>
              <Link href={item.href}>{item.ctaLabel}</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href={item.href}>{item.ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Section({
  bucket,
  items,
  workspace,
  onToggleDone,
  onOpenTask,
}: {
  bucket: Exclude<ChecklistBucket, "done">;
  items: ChecklistItem[];
  workspace: WeddingWorkspace;
  onToggleDone: (task: Task) => void;
  onOpenTask: (task: Task) => void;
}) {
  if (items.length === 0) return null;
  const copy = CHECKLIST_BUCKET_COPY[bucket];
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-base font-semibold text-ink sm:text-lg">
          {copy.title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-tertiary">{copy.subtitle}</p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <TaskRow
            key={item.task.id}
            item={item}
            workspace={workspace}
            onToggleDone={onToggleDone}
            onOpenTask={onOpenTask}
          />
        ))}
      </ul>
    </section>
  );
}

export function ChecklistBoard({
  workspace,
  groups,
  view,
  onToggleDone,
  onOpenTask,
}: ChecklistBoardProps) {
  if (view === "done") {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-base font-semibold text-ink sm:text-lg">
            Já concluídas
          </h2>
          <p className="mt-0.5 text-sm text-ink-tertiary">
            Olha o quanto você já avançou.
          </p>
        </div>
        {groups.done.length === 0 ? (
          <p className="text-sm text-ink-tertiary">
            Ainda não há conclusões — o primeiro check-in já conta.
          </p>
        ) : (
          <ul className="space-y-2">
            {groups.done.map((item) => (
              <TaskRow
                key={item.task.id}
                item={item}
                workspace={workspace}
                onToggleDone={onToggleDone}
                onOpenTask={onOpenTask}
              />
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (view === "all") {
    const all = [...groups.now, ...groups.soon, ...groups.later];
    return (
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-base font-semibold text-ink sm:text-lg">
            Todas as abertas
          </h2>
          <p className="mt-0.5 text-sm text-ink-tertiary">
            Ordenadas do que mais importa agora para o que pode esperar.
          </p>
        </div>
        {all.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Nenhuma tarefa aberta. Que tal aproveitar e respirar?
          </p>
        ) : (
          <ul className="space-y-2">
            {all.map((item) => (
              <TaskRow
                key={item.task.id}
                item={item}
                workspace={workspace}
                onToggleDone={onToggleDone}
                onOpenTask={onOpenTask}
              />
            ))}
          </ul>
        )}
      </section>
    );
  }

  const openCount =
    groups.now.length + groups.soon.length + groups.later.length;
  if (openCount === 0) {
    return (
      <p className="rounded-lg border border-border bg-canvas-elevated p-5 text-sm text-ink-secondary sm:p-6">
        Checklist em dia. Quando surgir algo novo, organizamos por prioridade
        aqui.
      </p>
    );
  }

  if (view === "now" || view === "soon" || view === "later") {
    return (
      <Section
        bucket={view}
        items={groups[view]}
        workspace={workspace}
        onToggleDone={onToggleDone}
        onOpenTask={onOpenTask}
      />
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <Section
        bucket="now"
        items={groups.now}
        workspace={workspace}
        onToggleDone={onToggleDone}
        onOpenTask={onOpenTask}
      />
      <Section
        bucket="soon"
        items={groups.soon}
        workspace={workspace}
        onToggleDone={onToggleDone}
        onOpenTask={onOpenTask}
      />
      <Section
        bucket="later"
        items={groups.later}
        workspace={workspace}
        onToggleDone={onToggleDone}
        onOpenTask={onOpenTask}
      />
      <p className="text-sm text-ink-tertiary">
        Não precisa resolver tudo de uma vez. Foque no bloco de agora.
      </p>
    </div>
  );
}
