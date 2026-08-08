/**
 * Seed data catalogs — used by prisma/seed.ts and onboarding.
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

/** Days before wedding_date for phase fallback (legacy) */
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

export type TaskGroupSlug =
  | "planning"
  | "venue"
  | "vendors"
  | "bride"
  | "groom"
  | "people"
  | "guests"
  | "communication"
  | "docs"
  | "party"
  | "org"
  | "honeymoon"
  | "post";

export const TASK_GROUP_META: Record<
  TaskGroupSlug,
  { label: string; emoji: string; sortOrder: number }
> = {
  planning: { label: "Planejamento inicial", emoji: "💍", sortOrder: 10 },
  venue: { label: "Local", emoji: "🏛️", sortOrder: 20 },
  vendors: { label: "Fornecedores", emoji: "🍽️", sortOrder: 30 },
  bride: { label: "Noiva", emoji: "👰", sortOrder: 40 },
  groom: { label: "Noivo", emoji: "🤵", sortOrder: 50 },
  people: { label: "Pessoas", emoji: "👥", sortOrder: 60 },
  guests: { label: "Convidados", emoji: "💌", sortOrder: 70 },
  communication: { label: "Comunicação", emoji: "🌐", sortOrder: 80 },
  docs: { label: "Documentação", emoji: "⚖️", sortOrder: 90 },
  party: { label: "Festa", emoji: "🎀", sortOrder: 100 },
  org: { label: "Organização", emoji: "📋", sortOrder: 110 },
  honeymoon: { label: "Lua de mel", emoji: "✈️", sortOrder: 120 },
  post: { label: "Pós-casamento", emoji: "🏁", sortOrder: 130 },
};

/** Feature modules that auto-sync with linked checklist tasks */
export type TaskFeatureLink =
  | "budget"
  | "date"
  | "style"
  | "priorities"
  | "guest_count"
  | "venue"
  | "guest_list"
  | "rsvp"
  | "final_guests"
  | "seating"
  | "gifts"
  | "honeymoon"
  | "honeymoon_booking"
  | "vendor:venue"
  | "vendor:catering"
  | "vendor:photo_video"
  | "vendor:video"
  | "vendor:decoration"
  | "vendor:music"
  | "vendor:cake"
  | "vendor:drinks"
  | "vendor:flowers"
  | "vendor:ceremony"
  | "vendor:transport"
  | "vendor:attire"
  | "vendor:beauty"
  | "vendor:stationery"
  | "vendor:favors"
  | "vendor:entertainment"
  | "payments"
  | "schedule"
  | "thank_you";

export type TaskSeed = {
  templateKey: string;
  title: string;
  group: TaskGroupSlug;
  /** Days relative to wedding date: positive = before, negative = after */
  dueOffsetDays: number;
  /** Human label shown in task description */
  dueLabel: string;
  priority: 1 | 2 | 3 | 4 | 5;
  categorySlug?: string;
  isMilestone?: boolean;
  featureLink?: TaskFeatureLink;
  description?: string;
  phase?: keyof typeof PHASE_OFFSET_DAYS;
};

const MONTH = 30;

function phaseFromOffset(
  days: number,
  group: TaskGroupSlug,
): keyof typeof PHASE_OFFSET_DAYS {
  if (group === "honeymoon" && days >= 0) return "honeymoon";
  if (days >= 450) return "m18";
  if (days >= 300) return "m12";
  if (days >= 225) return "m9";
  if (days >= 135) return "m6";
  if (days >= 60) return "m3";
  if (days >= 22) return "m1";
  if (days >= 12) return "d15";
  if (days >= 5) return "d7";
  if (days >= 2) return "d3";
  if (days >= 0) return "day_of";
  return "post";
}

function task(
  partial: Omit<TaskSeed, "phase"> & { phase?: TaskSeed["phase"] },
): TaskSeed {
  return {
    ...partial,
    phase: partial.phase ?? phaseFromOffset(partial.dueOffsetDays, partial.group),
  };
}

/**
 * Default wedding checklist — organized by area with relative deadlines.
 * templateKey format: br.<group>.<action>
 */
export const TASK_TEMPLATE_SEED: TaskSeed[] = [
  // ─── Planejamento inicial ───
  task({
    templateKey: "br.planning.set_budget",
    title: "Definir orçamento do casamento",
    group: "planning",
    dueOffsetDays: 12 * MONTH,
    dueLabel: "12 meses antes",
    priority: 5,
    categorySlug: "other",
    isMilestone: true,
    featureLink: "budget",
  }),
  task({
    templateKey: "br.planning.set_date",
    title: "Definir data e horário do casamento",
    group: "planning",
    dueOffsetDays: 12 * MONTH,
    dueLabel: "12 meses antes",
    priority: 5,
    isMilestone: true,
    featureLink: "date",
  }),
  task({
    templateKey: "br.planning.set_style",
    title: "Definir estilo do casamento",
    group: "planning",
    dueOffsetDays: 12 * MONTH,
    dueLabel: "12 meses antes",
    priority: 5,
    isMilestone: true,
    featureLink: "style",
  }),
  task({
    templateKey: "br.planning.guest_count",
    title: "Definir número de convidados",
    group: "planning",
    dueOffsetDays: 11 * MONTH,
    dueLabel: "11 meses antes",
    priority: 4,
    featureLink: "guest_count",
  }),
  task({
    templateKey: "br.planning.set_priorities",
    title: "Definir prioridades do casamento",
    group: "planning",
    dueOffsetDays: 12 * MONTH,
    dueLabel: "12 meses antes",
    priority: 4,
    featureLink: "priorities",
  }),

  // ─── Local ───
  task({
    templateKey: "br.venue.lock_venue",
    title: "Definir local da cerimônia e festa",
    group: "venue",
    dueOffsetDays: 10 * MONTH,
    dueLabel: "10–12 meses antes",
    priority: 5,
    categorySlug: "venue",
    isMilestone: true,
    featureLink: "venue",
  }),
  task({
    templateKey: "br.venue.rain_plan",
    title: "Definir plano B para chuva",
    group: "venue",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3 meses antes",
    priority: 4,
    categorySlug: "venue",
  }),

  // ─── Fornecedores ───
  task({
    templateKey: "br.vendors.hire_catering",
    title: "Definir buffet",
    group: "vendors",
    dueOffsetDays: 9 * MONTH,
    dueLabel: "9–10 meses antes",
    priority: 5,
    categorySlug: "catering",
    isMilestone: true,
    featureLink: "vendor:catering",
  }),
  task({
    templateKey: "br.vendors.hire_photo",
    title: "Definir fotógrafo",
    group: "vendors",
    dueOffsetDays: 9 * MONTH,
    dueLabel: "9–10 meses antes",
    priority: 5,
    categorySlug: "photo_video",
    isMilestone: true,
    featureLink: "vendor:photo_video",
  }),
  task({
    templateKey: "br.vendors.hire_video",
    title: "Definir videomaker",
    group: "vendors",
    dueOffsetDays: 8 * MONTH,
    dueLabel: "8–10 meses antes",
    priority: 4,
    categorySlug: "photo_video",
    featureLink: "vendor:video",
  }),
  task({
    templateKey: "br.vendors.hire_decor",
    title: "Definir decoração",
    group: "vendors",
    dueOffsetDays: 7 * MONTH,
    dueLabel: "7–9 meses antes",
    priority: 5,
    categorySlug: "decoration",
    isMilestone: true,
    featureLink: "vendor:decoration",
  }),
  task({
    templateKey: "br.vendors.hire_music",
    title: "Definir DJ ou banda",
    group: "vendors",
    dueOffsetDays: 7 * MONTH,
    dueLabel: "7–9 meses antes",
    priority: 4,
    categorySlug: "music",
    featureLink: "vendor:music",
  }),
  task({
    templateKey: "br.vendors.ceremony_music",
    title: "Definir música da cerimônia",
    group: "vendors",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3 meses antes",
    priority: 3,
    categorySlug: "music",
  }),
  task({
    templateKey: "br.vendors.hire_cake",
    title: "Definir bolo",
    group: "vendors",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 3,
    categorySlug: "cake",
    featureLink: "vendor:cake",
  }),
  task({
    templateKey: "br.vendors.hire_sweets",
    title: "Definir doces",
    group: "vendors",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 3,
    categorySlug: "cake",
  }),
  task({
    templateKey: "br.vendors.hire_drinks",
    title: "Definir bebidas",
    group: "vendors",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "drinks",
    featureLink: "vendor:drinks",
  }),
  task({
    templateKey: "br.vendors.hire_flowers",
    title: "Definir flores",
    group: "vendors",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "flowers",
    featureLink: "vendor:flowers",
  }),
  task({
    templateKey: "br.vendors.hire_officiant",
    title: "Definir celebrante",
    group: "vendors",
    dueOffsetDays: 6 * MONTH,
    dueLabel: "6–8 meses antes",
    priority: 4,
    categorySlug: "ceremony",
    featureLink: "vendor:ceremony",
  }),
  task({
    templateKey: "br.vendors.hire_transport",
    title: "Definir transporte",
    group: "vendors",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "transport",
    featureLink: "vendor:transport",
  }),
  task({
    templateKey: "br.vendors.hire_lodging",
    title: "Definir hospedagem",
    group: "vendors",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "other",
  }),

  // ─── Noiva ───
  task({
    templateKey: "br.bride.bride_dress",
    title: "Definir vestido da noiva",
    group: "bride",
    dueOffsetDays: 8 * MONTH,
    dueLabel: "8–10 meses antes",
    priority: 5,
    categorySlug: "attire",
    isMilestone: true,
    featureLink: "vendor:attire",
  }),
  task({
    templateKey: "br.bride.bride_accessories",
    title: "Definir acessórios da noiva",
    group: "bride",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "attire",
  }),
  task({
    templateKey: "br.bride.bride_makeup",
    title: "Definir maquiagem da noiva",
    group: "bride",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 4,
    categorySlug: "beauty",
    featureLink: "vendor:beauty",
  }),
  task({
    templateKey: "br.bride.bride_hair",
    title: "Definir cabelo da noiva",
    group: "bride",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 4,
    categorySlug: "beauty",
  }),
  task({
    templateKey: "br.bride.bride_beauty",
    title: "Definir cuidados de beleza da noiva",
    group: "bride",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3 meses antes",
    priority: 3,
    categorySlug: "beauty",
  }),

  // ─── Noivo ───
  task({
    templateKey: "br.groom.groom_suit",
    title: "Definir traje do noivo",
    group: "groom",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 4,
    categorySlug: "attire",
    featureLink: "vendor:attire",
  }),
  task({
    templateKey: "br.groom.groom_accessories",
    title: "Definir acessórios do noivo",
    group: "groom",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2–3 meses antes",
    priority: 3,
    categorySlug: "attire",
  }),
  task({
    templateKey: "br.groom.groom_grooming",
    title: "Definir cabelo e barba do noivo",
    group: "groom",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "1 mês antes",
    priority: 3,
    categorySlug: "beauty",
  }),

  // ─── Pessoas ───
  task({
    templateKey: "br.people.wedding_party",
    title: "Definir padrinhos e madrinhas",
    group: "people",
    dueOffsetDays: 9 * MONTH,
    dueLabel: "9–10 meses antes",
    priority: 4,
  }),
  task({
    templateKey: "br.people.flower_girls",
    title: "Definir damas e pajens",
    group: "people",
    dueOffsetDays: 6 * MONTH,
    dueLabel: "6–8 meses antes",
    priority: 3,
  }),
  task({
    templateKey: "br.people.witnesses",
    title: "Definir testemunhas",
    group: "people",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3 meses antes",
    priority: 4,
  }),
  task({
    templateKey: "br.people.day_of_roles",
    title: "Definir responsáveis pelo dia do casamento",
    group: "people",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2 meses antes",
    priority: 4,
  }),

  // ─── Convidados ───
  task({
    templateKey: "br.guests.guest_list",
    title: "Criar lista de convidados",
    group: "guests",
    dueOffsetDays: 10 * MONTH,
    dueLabel: "10–12 meses antes",
    priority: 5,
    isMilestone: true,
    featureLink: "guest_list",
  }),
  task({
    templateKey: "br.guests.define_invite",
    title: "Definir convite",
    group: "guests",
    dueOffsetDays: 6 * MONTH,
    dueLabel: "6–7 meses antes",
    priority: 4,
    categorySlug: "stationery",
    featureLink: "vendor:stationery",
  }),
  task({
    templateKey: "br.guests.send_invites",
    title: "Enviar convites",
    group: "guests",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 5,
    categorySlug: "stationery",
    isMilestone: true,
  }),
  task({
    templateKey: "br.guests.chase_rsvp",
    title: "Gerenciar confirmações dos convidados",
    group: "guests",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "a partir de 3 meses antes",
    priority: 5,
    featureLink: "rsvp",
  }),
  task({
    templateKey: "br.guests.final_guest_count",
    title: "Fechar lista final de convidados",
    group: "guests",
    dueOffsetDays: 30,
    dueLabel: "30 dias antes",
    priority: 5,
    featureLink: "final_guests",
  }),
  task({
    templateKey: "br.guests.seating_chart",
    title: "Definir mapa de mesas",
    group: "guests",
    dueOffsetDays: 15,
    dueLabel: "15 dias antes",
    priority: 4,
    featureLink: "seating",
  }),

  // ─── Comunicação ───
  task({
    templateKey: "br.communication.wedding_site",
    title: "Criar site do casamento",
    group: "communication",
    dueOffsetDays: 5 * MONTH,
    dueLabel: "5–6 meses antes",
    priority: 3,
  }),
  task({
    templateKey: "br.communication.gift_list",
    title: "Definir lista de presentes",
    group: "communication",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–5 meses antes",
    priority: 4,
    featureLink: "gifts",
  }),
  task({
    templateKey: "br.communication.guest_info",
    title: "Definir informações para os convidados",
    group: "communication",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3 meses antes",
    priority: 3,
  }),

  // ─── Documentação ───
  task({
    templateKey: "br.docs.civil_marriage",
    title: "Resolver casamento civil",
    group: "docs",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2–3 meses antes",
    priority: 5,
    description:
      "Os prazos do casamento civil variam conforme o cartório. Confirme com antecedência os documentos e a agenda local.",
  }),
  task({
    templateKey: "br.docs.religious_ceremony",
    title: "Resolver cerimônia religiosa",
    group: "docs",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 4,
    categorySlug: "ceremony",
    description:
      "Os prazos da cerimônia religiosa variam conforme a igreja ou celebrante. Confirme exigências e ensaios com antecedência.",
  }),

  // ─── Festa ───
  task({
    templateKey: "br.party.favors",
    title: "Definir lembrancinhas",
    group: "party",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 2,
    categorySlug: "favors",
    featureLink: "vendor:favors",
  }),
  task({
    templateKey: "br.party.stationery",
    title: "Definir papelaria",
    group: "party",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2–3 meses antes",
    priority: 3,
    categorySlug: "stationery",
  }),
  task({
    templateKey: "br.party.party_layout",
    title: "Definir layout da festa",
    group: "party",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2 meses antes",
    priority: 4,
    categorySlug: "decoration",
  }),
  task({
    templateKey: "br.party.cake_table",
    title: "Definir mesa do bolo e doces",
    group: "party",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "2 meses antes",
    priority: 3,
    categorySlug: "cake",
  }),
  task({
    templateKey: "br.party.party_attractions",
    title: "Definir atrações da festa",
    group: "party",
    dueOffsetDays: 3 * MONTH,
    dueLabel: "3–4 meses antes",
    priority: 3,
    categorySlug: "entertainment",
    featureLink: "vendor:entertainment",
  }),

  // ─── Organização ───
  task({
    templateKey: "br.org.organize_contracts",
    title: "Organizar contratos dos fornecedores",
    group: "org",
    dueOffsetDays: 2 * MONTH,
    dueLabel: "durante todo o planejamento",
    priority: 4,
  }),
  task({
    templateKey: "br.org.review_payments",
    title: "Organizar pagamentos dos fornecedores",
    group: "org",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "durante todo o planejamento",
    priority: 5,
    categorySlug: "other",
    featureLink: "payments",
  }),
  task({
    templateKey: "br.org.day_schedule",
    title: "Definir cronograma do casamento",
    group: "org",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "1 mês antes",
    priority: 5,
    isMilestone: true,
    featureLink: "schedule",
  }),
  task({
    templateKey: "br.org.ceremony_script",
    title: "Definir roteiro da cerimônia",
    group: "org",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "1–2 meses antes",
    priority: 4,
    categorySlug: "ceremony",
  }),
  task({
    templateKey: "br.org.party_script",
    title: "Definir roteiro da festa",
    group: "org",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "1 mês antes",
    priority: 4,
  }),
  task({
    templateKey: "br.org.ceremony_rehearsal",
    title: "Organizar ensaio da cerimônia",
    group: "org",
    dueOffsetDays: 1 * MONTH,
    dueLabel: "1 mês antes",
    priority: 3,
    categorySlug: "ceremony",
  }),
  task({
    templateKey: "br.org.day_of_items",
    title: "Organizar itens do dia do casamento",
    group: "org",
    dueOffsetDays: 7,
    dueLabel: "1 semana antes",
    priority: 4,
  }),
  task({
    templateKey: "br.org.confirm_vendors",
    title: "Confirmar fornecedores",
    group: "org",
    dueOffsetDays: 7,
    dueLabel: "7–14 dias antes",
    priority: 5,
    isMilestone: true,
  }),

  // ─── Lua de mel ───
  task({
    templateKey: "br.honeymoon.define_honeymoon",
    title: "Definir lua de mel",
    group: "honeymoon",
    dueOffsetDays: 6 * MONTH,
    dueLabel: "6–8 meses antes",
    priority: 4,
    categorySlug: "honeymoon",
    isMilestone: true,
    featureLink: "honeymoon",
  }),
  task({
    templateKey: "br.honeymoon.book_honeymoon",
    title: "Reservar viagem da lua de mel",
    group: "honeymoon",
    dueOffsetDays: 4 * MONTH,
    dueLabel: "4–6 meses antes",
    priority: 4,
    categorySlug: "honeymoon",
    featureLink: "honeymoon_booking",
  }),

  // ─── Pós-casamento ───
  task({
    templateKey: "br.post.close_contracts",
    title: "Encerrar contratos e pagamentos",
    group: "post",
    dueOffsetDays: -30,
    dueLabel: "até 30 dias depois",
    priority: 4,
    featureLink: "payments",
  }),
  task({
    templateKey: "br.post.receive_media",
    title: "Receber fotos e vídeos",
    group: "post",
    dueOffsetDays: -60,
    dueLabel: "conforme contrato",
    priority: 3,
    categorySlug: "photo_video",
  }),
  task({
    templateKey: "br.post.finalize_album",
    title: "Finalizar álbum",
    group: "post",
    dueOffsetDays: -120,
    dueLabel: "3–6 meses depois",
    priority: 2,
    categorySlug: "photo_video",
  }),
  task({
    templateKey: "br.post.organize_gifts",
    title: "Organizar presentes",
    group: "post",
    dueOffsetDays: -30,
    dueLabel: "até 30 dias depois",
    priority: 3,
    featureLink: "gifts",
  }),
  task({
    templateKey: "br.post.thank_you",
    title: "Enviar agradecimentos",
    group: "post",
    dueOffsetDays: -30,
    dueLabel: "até 30 dias depois",
    priority: 3,
    featureLink: "thank_you",
  }),
  task({
    templateKey: "br.post.return_rentals",
    title: "Devolver itens alugados",
    group: "post",
    dueOffsetDays: -3,
    dueLabel: "1–7 dias depois",
    priority: 4,
  }),
  task({
    templateKey: "br.post.rate_vendors",
    title: "Avaliar fornecedores",
    group: "post",
    dueOffsetDays: -30,
    dueLabel: "até 30 dias depois",
    priority: 2,
  }),
];

export function taskSeedDescription(seed: TaskSeed): string {
  const parts = [`Definir até: ${seed.dueLabel}.`];
  if (seed.description) parts.push(seed.description);
  return parts.join(" ");
}

export function groupSlugFromTemplateKey(
  templateKey: string | null | undefined,
): TaskGroupSlug | null {
  if (!templateKey) return null;
  const parts = templateKey.split(".");
  const group = parts[1];
  if (group && group in TASK_GROUP_META) return group as TaskGroupSlug;
  return null;
}
