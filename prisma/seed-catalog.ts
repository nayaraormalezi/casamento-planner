/**
 * Seed data catalogs — used by prisma/seed.ts at implementation time.
 * Categories are copied per-wedding on onboarding.
 */

export const BUDGET_CATEGORY_SEED = [
  { slug: "venue", name: "Local / Espaço", sortOrder: 10 },
  { slug: "catering", name: "Buffet / Catering", sortOrder: 20 },
  { slug: "drinks", name: "Bebidas", sortOrder: 30 },
  { slug: "decoration", name: "Decoração", sortOrder: 40 },
  { slug: "flowers", name: "Flores", sortOrder: 50 },
  { slug: "photo_video", name: "Foto e Vídeo", sortOrder: 60 },
  { slug: "music", name: "Música / DJ / Banda", sortOrder: 70 },
  { slug: "attire", name: "Trajes", sortOrder: 80 },
  { slug: "beauty", name: "Beleza", sortOrder: 90 },
  { slug: "stationery", name: "Papelaria / Convites", sortOrder: 100 },
  { slug: "cake", name: "Bolo e Doces", sortOrder: 110 },
  { slug: "favors", name: "Lembrancinhas", sortOrder: 120 },
  { slug: "transport", name: "Transporte", sortOrder: 130 },
  { slug: "ceremony", name: "Cerimônia", sortOrder: 140 },
  { slug: "entertainment", name: "Entretenimento", sortOrder: 150 },
  { slug: "honeymoon", name: "Lua de Mel", sortOrder: 160 },
  { slug: "fees", name: "Taxas e Gorjetas", sortOrder: 170 },
  { slug: "contingency", name: "Reserva / Contingência", sortOrder: 180 },
  { slug: "other", name: "Outros", sortOrder: 190 },
] as const;

export const BUDGET_ALLOCATION_BENCHMARK: Record<string, number> = {
  venue: 30,
  catering: 20,
  decoration: 10,
  photo_video: 8,
  music: 5,
  attire: 7,
  honeymoon: 8,
  contingency: 5,
};

/** Days before wedding_date for due_date derivation */
export const PHASE_OFFSET_DAYS: Record<string, number> = {
  m18: 540,
  m12: 365,
  m9: 270,
  m6: 180,
  m3: 90,
  m1: 30,
  d15: 15,
  d7: 7,
  d3: 3,
  day_of: 0,
  post: -7,
  honeymoon: 60,
};

export type TaskSeed = {
  templateKey: string;
  title: string;
  phase: keyof typeof PHASE_OFFSET_DAYS;
  priority: 1 | 2 | 3 | 4 | 5;
  categorySlug?: string;
  isMilestone?: boolean;
};

/** Starter subset — full ~100 tasks expanded at implementation */
export const TASK_TEMPLATE_SEED: TaskSeed[] = [
  { templateKey: "br.m18.set_budget", title: "Definir orçamento total", phase: "m18", priority: 5, categorySlug: "other", isMilestone: true },
  { templateKey: "br.m18.set_date_style", title: "Definir data e estilo do casamento", phase: "m18", priority: 5, isMilestone: true },
  { templateKey: "br.m12.lock_venue", title: "Fechar local da cerimônia/festa", phase: "m12", priority: 5, categorySlug: "venue", isMilestone: true },
  { templateKey: "br.m12.research_catering", title: "Pesquisar e cotar buffets", phase: "m12", priority: 4, categorySlug: "catering" },
  { templateKey: "br.m9.hire_photo", title: "Contratar fotógrafo/videomaker", phase: "m9", priority: 5, categorySlug: "photo_video", isMilestone: true },
  { templateKey: "br.m9.guest_list_draft", title: "Montar lista preliminar de convidados", phase: "m9", priority: 4 },
  { templateKey: "br.m6.attire", title: "Escolher e encomendar trajes", phase: "m6", priority: 4, categorySlug: "attire" },
  { templateKey: "br.m6.hire_music", title: "Contratar DJ ou banda", phase: "m6", priority: 4, categorySlug: "music" },
  { templateKey: "br.m6.hire_decor", title: "Contratar decoração", phase: "m6", priority: 4, categorySlug: "decoration", isMilestone: true },
  { templateKey: "br.m3.send_invites", title: "Enviar convites", phase: "m3", priority: 5, categorySlug: "stationery", isMilestone: true },
  { templateKey: "br.m3.tasting", title: "Degustação do buffet", phase: "m3", priority: 4, categorySlug: "catering" },
  { templateKey: "br.m1.chase_rsvp", title: "Confirmar RSVPs pendentes", phase: "m1", priority: 5 },
  { templateKey: "br.m1.review_payments", title: "Revisar pagamentos em aberto", phase: "m1", priority: 5, categorySlug: "other" },
  { templateKey: "br.d15.confirm_vendors", title: "Confirmar todos os fornecedores", phase: "d15", priority: 5, isMilestone: true },
  { templateKey: "br.d7.final_guest_count", title: "Entregar contagem final ao buffet", phase: "d7", priority: 5, categorySlug: "catering" },
  { templateKey: "br.d3.emergency_kit", title: "Montar kit emergência do dia", phase: "d3", priority: 3 },
  { templateKey: "br.day.run_of_show", title: "Seguir timeline do dia", phase: "day_of", priority: 5, isMilestone: true },
  { templateKey: "br.post.thank_you", title: "Enviar agradecimentos", phase: "post", priority: 3 },
  { templateKey: "br.honey.passport", title: "Verificar passaportes/vistos", phase: "honeymoon", priority: 5, categorySlug: "honeymoon" },
  { templateKey: "br.honey.insurance", title: "Contratar seguro viagem", phase: "honeymoon", priority: 4, categorySlug: "honeymoon" },
];
