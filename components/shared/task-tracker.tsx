"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { moduleForTask, PHASE_LABEL } from "@/modules/tasks/module-links";
import { estimateTaskSpend } from "@/modules/tasks/estimates";
import type { Task, WeddingWorkspace } from "@/types/domain";
import { cn, formatMoneyBRL } from "@/utils/cn";

type Props = {
  workspace: WeddingWorkspace;
  tasks: Task[];
  onToggleDone: (task: Task) => void;
  title?: string;
  emptyLabel?: string;
  showPhase?: boolean;
};

export function TaskTracker({
  workspace,
  tasks,
  onToggleDone,
  title = "Acompanhar tarefas",
  emptyLabel = "Nenhuma tarefa nesta visão.",
  showPhase = false,
}: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/tasks">Ver todas</Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-ink-tertiary">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const mod = moduleForTask(task);
            const estimate = estimateTaskSpend(task, workspace);
            const vendor = task.vendorId
              ? workspace.vendors.find((v) => v.id === task.vendorId)
              : workspace.vendors.find(
                  (v) =>
                    task.categorySlug != null &&
                    v.categorySlug === task.categorySlug,
                );
            const overdue =
              task.status !== "done" &&
              task.dueDate != null &&
              task.dueDate < new Date().toISOString().slice(0, 10);
            const chosen = task.budgetOptions?.find((o) => o.isSelected);

            return (
              <li
                key={task.id}
                className="rounded-lg border border-border bg-canvas-elevated p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--wp-accent)]"
                    checked={task.status === "done"}
                    onChange={() => onToggleDone(task)}
                    aria-label={`Concluir ${task.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          task.status === "done" &&
                            "text-ink-tertiary line-through",
                        )}
                      >
                        {task.title}
                      </p>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      {chosen ? (
                        <StatusBadge status={chosen.paymentStatus} />
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-tertiary">
                      {showPhase ? (
                        <span>{PHASE_LABEL[task.phase]}</span>
                      ) : null}
                      {task.dueDate ? (
                        <span className={overdue ? "text-danger" : undefined}>
                          Prazo {task.dueDate}
                          {overdue ? " · atrasada" : ""}
                        </span>
                      ) : (
                        <span>Sem prazo</span>
                      )}
                      <span>{mod.label}</span>
                    </div>

                    {chosen ? (
                      <p className="mt-2 text-sm tabular-nums text-ink">
                        Orçamento definido:{" "}
                        <span className="font-medium">
                          {formatMoneyBRL(chosen.amount)}
                        </span>
                        <span className="ml-1 text-xs text-ink-tertiary">
                          ·{" "}
                          {chosen.paymentPlan === "installments"
                            ? "parcelado"
                            : "à vista"}{" "}
                          · pago {formatMoneyBRL(chosen.paidAmount)}
                        </span>
                      </p>
                    ) : estimate.estimatedCents > 0 ? (
                      <p className="mt-2 text-sm tabular-nums text-ink">
                        Estimativa:{" "}
                        <span className="font-medium">
                          {formatMoneyBRL(estimate.estimatedCents)}
                        </span>
                        <span className="ml-1 text-xs text-ink-tertiary">
                          · {estimate.label}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-tertiary">
                        {estimate.label}
                      </p>
                    )}

                    {vendor ? (
                      <div className="mt-2 rounded-md bg-canvas-muted/70 px-3 py-2 text-xs text-ink-secondary">
                        <p>
                          <span className="font-medium text-ink">Empresa:</span>{" "}
                          {vendor.name}
                        </p>
                        {vendor.contactName ? (
                          <p>
                            <span className="font-medium text-ink">
                              Responsável:
                            </span>{" "}
                            {vendor.contactName}
                          </p>
                        ) : null}
                        {vendor.phone ? (
                          <p>
                            <span className="font-medium text-ink">
                              Telefone:
                            </span>{" "}
                            {vendor.phone}
                          </p>
                        ) : null}
                      </div>
                    ) : task.categorySlug ? (
                      <p className="mt-2 text-xs text-ink-tertiary">
                        Sem fornecedor vinculado — cadastre empresa, responsável
                        e telefone.
                      </p>
                    ) : null}

                    <div className="mt-3">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={mod.href}>
                          {mod.actionLabel}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
