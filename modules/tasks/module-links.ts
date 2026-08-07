import type { Task } from "@/types/domain";

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
  if (key.includes("guest") || key.includes("rsvp") || key.includes("invite")) {
    return {
      href: "/app/guests",
      label: "Convidados",
      actionLabel: "Abrir convidados",
    };
  }
  if (key.includes("honey") || slug === "honeymoon") {
    return {
      href: "/app/honeymoon",
      label: "Lua de mel",
      actionLabel: "Abrir lua de mel",
    };
  }
  if (key.includes("run_of_show") || key.includes("confirm_vendors")) {
    return {
      href: key.includes("confirm_vendors") ? "/app/vendors" : "/app/schedule",
      label: key.includes("confirm_vendors") ? "Fornecedores" : "Cronograma",
      actionLabel: key.includes("confirm_vendors")
        ? "Abrir fornecedores"
        : "Abrir cronograma",
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
    ].includes(slug)
  ) {
    return {
      href: `/app/vendors?category=${slug}`,
      label: "Fornecedor",
      actionLabel: "Cadastrar fornecedor",
    };
  }
  if (key.includes("set_date") || key.includes("style")) {
    return {
      href: "/app/settings",
      label: "Configurações",
      actionLabel: "Editar casamento",
    };
  }

  return {
    href: `/app/tasks?highlight=${task.id}`,
    label: "Tarefa",
    actionLabel: "Abrir tarefa",
  };
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
