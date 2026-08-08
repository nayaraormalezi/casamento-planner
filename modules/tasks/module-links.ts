import type { Task } from "@/types/domain";
import {
  groupSlugFromTemplateKey,
  TASK_GROUP_META,
} from "@/prisma/seed-catalog";

export type TaskModule = {
  href: string;
  label: string;
  actionLabel: string;
};

/** Maps each task to the functional module where work actually happens. */
export function moduleForTask(task: Task): TaskModule {
  const key = task.templateKey ?? "";
  const slug = task.categorySlug;

  if (key.includes("set_budget") || key.includes("review_payments")) {
    return {
      href: "/app/budget",
      label: "Orçamento",
      actionLabel: "Abrir orçamento",
    };
  }
  if (
    key.includes("guest_list") ||
    key.includes("guest_count") ||
    key.includes("chase_rsvp") ||
    key.includes("send_invites") ||
    key.includes("final_guest") ||
    key.includes("seating")
  ) {
    return {
      href: "/app/guests",
      label: "Convidados",
      actionLabel: "Abrir convidados",
    };
  }
  if (key.includes("gift_list") || key.includes("thank_you") || key.includes("organize_gifts")) {
    return {
      href: "/app/gifts",
      label: "Presentes",
      actionLabel: "Abrir presentes",
    };
  }
  if (key.includes("honey") || slug === "honeymoon") {
    return {
      href: "/app/honeymoon",
      label: "Lua de mel",
      actionLabel: "Abrir lua de mel",
    };
  }
  if (
    key.includes("day_schedule") ||
    key.includes("run_of_show") ||
    key.includes("ceremony_script") ||
    key.includes("party_script")
  ) {
    return {
      href: "/app/schedule",
      label: "Cronograma",
      actionLabel: "Abrir cronograma",
    };
  }
  if (key.includes("confirm_vendors") || key.includes("organize_contracts")) {
    return {
      href: "/app/vendors",
      label: "Fornecedores",
      actionLabel: "Abrir fornecedores",
    };
  }
  if (
    key.includes("set_date") ||
    key.includes("set_style") ||
    key.includes("set_priorities") ||
    key.includes("lock_venue")
  ) {
    return {
      href: "/app/settings",
      label: "Casamento",
      actionLabel: "Editar casamento",
    };
  }
  if (
    slug &&
    [
      "venue",
      "catering",
      "photo_video",
      "music",
      "decoration",
      "attire",
      "flowers",
      "beauty",
      "cake",
      "stationery",
      "drinks",
      "transport",
      "ceremony",
      "favors",
      "entertainment",
    ].includes(slug)
  ) {
    return {
      href: `/app/vendors?category=${slug}`,
      label: "Fornecedor",
      actionLabel: "Cadastrar fornecedor",
    };
  }

  return {
    href: `/app/tasks?highlight=${task.id}`,
    label: "Tarefa",
    actionLabel: "Abrir tarefa",
  };
}

export function areaLabelForTask(task: Task): string | null {
  const group = groupSlugFromTemplateKey(task.templateKey);
  if (!group) return null;
  const meta = TASK_GROUP_META[group];
  return `${meta.emoji} ${meta.label}`;
}

export const PHASE_LABEL: Record<Task["phase"], string> = {
  m18: "18 meses",
  m12: "12 meses",
  m9: "9 meses",
  m6: "6 meses",
  m3: "3 meses",
  m1: "1 mês",
  d15: "15 dias",
  d7: "7 dias",
  d3: "3 dias",
  day_of: "Dia do casamento",
  post: "Pós-casamento",
  honeymoon: "Lua de mel",
};
