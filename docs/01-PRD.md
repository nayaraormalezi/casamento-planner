# Wedding Planner — Product Requirements Document (PRD)

**Versão:** 1.0  
**Status:** Aprovado — arquitetura em andamento  
**Data:** 06 de agosto de 2026  
**Produto:** Wedding Planner  
**Tipo:** SaaS B2C (com evolução B2B futura)  
**Estágio:** MVP comercializável  

---

## 1. Visão do Produto

### 1.1 One-liner

Wedding Planner é um sistema de **gerenciamento de projetos** para casamentos: orçamento mensurável, decisões rastreadas, fornecedores controlados e um plano de execução que responde, o tempo todo, o que falta fazer, quanto falta gastar e o que é prioridade.

### 1.2 Problema

Casais planejam casamentos com planilhas, WhatsApp, anotações e checklists genéricos. Isso gera:

| Dor | Consequência |
|-----|--------------|
| Orçamento espalhado | Estouro sem aviso precoce |
| Decisões sem registro | Retrabalho e conflito entre o casal |
| Fornecedores em chats | Contratos e pagamentos perdidos |
| Checklist estático | Não adapta ao tempo restante nem à prioridade |
| Falta de visão única | Ansiedade: “será que esqueci algo?” |

Ferramentas genéricas (Notion, Trello, Monday) resolvem parte do problema, mas exigem o casal montar o sistema. O Wedding Planner entrega o **sistema pronto**, com domínio de casamento embutido.

### 1.3 Solução

Um workspace por casamento onde tarefas, dinheiro, pessoas, documentos e decisões são entidades conectadas — não listas isoladas. Cada ação atualiza indicadores. A IA atua como copiloto financeiro e operacional, nunca como chatbot genérico.

### 1.4 Princípio norteador

> Toda tela deve responder: **próximo passo**, **pendências**, **custo** e **impacto**.

Se uma feature não responde pelo menos uma dessas perguntas, ela não entra no MVP.

---

## 2. Objetivos de Negócio

| Objetivo | Métrica de sucesso (MVP) |
|----------|--------------------------|
| Validar disposição a pagar | ≥ 50 casais ativos em 90 dias pós-lançamento |
| Engajamento | ≥ 3 sessões/semana por casal ativo |
| Retenção | ≥ 60% ainda ativos 30 dias após onboarding |
| Valor percebido | NPS ≥ 40 |
| Conversão (quando houver paywall) | Trial → pago ≥ 8% |

### 2.1 Não-objetivos do MVP

- Marketplace de fornecedores
- App nativo iOS/Android
- Multi-eventos por conta (aniversário, corporativo)
- Portal do cerimonialista / white-label
- RSVP público com site do casamento
- Integração bancária automática (Open Finance)

Esses itens entram no roadmap pós-MVP (ver seção 12).

---

## 3. Personas

### 3.1 Primária — O Casal Planejador (Ana & Bruno)

- 28–35 anos, casamento em 6–18 meses  
- Orçamento R$ 40k–150k  
- Dividem tarefas; um é mais “financeiro”, outro mais “estético”  
- Querem controle sem virar project managers  

**Jobs to be done**
- Saber se estão no prazo e no orçamento em 10 segundos  
- Decidir o que cortar se o dinheiro apertar  
- Não perder comprovante/contrato  

### 3.2 Secundária — Família financiadora (futuro)

Pais que ajudam a pagar. No MVP: apenas convidados como colaboradores com permissão limitada (leitura / tarefas atribuídas). Papel “finance viewer” fica no roadmap.

### 3.3 Terciária — Cerimonialista (pós-MVP)

Profissional que gerencia vários casamentos. Fora do MVP; arquitetura deve permitir multi-tenant e “agency mode” depois.

---

## 4. Proposta de Valor

| Para | Valor |
|------|-------|
| Casal | Um único lugar que mede progresso, dinheiro e risco |
| Diferente de checklist | Prioridade + flexibilidade + impacto emocional + dependências |
| Diferente de planilha | Alertas, timeline, documentos e decisões ligados |
| Diferente de Notion | Domínio pronto; zero setup de templates |

**Posicionamento:** “Monday do casamento” — gestão de projeto, não lista de tarefas.

---

## 5. Escopo do MVP

### 5.1 Incluso

1. Autenticação (casal + colaboradores)  
2. Onboarding guiado (data, orçamento, estilo, cidade)  
3. Dashboard executivo  
4. Orçamento completo + gráficos  
5. Matriz de prioridade (influencia alertas e IA)  
6. Checklist inteligente por fases temporais  
7. Fornecedores  
8. Convidados + filtros  
9. Presentes  
10. Lua de mel (módulo leve)  
11. Documentos (upload Supabase Storage)  
12. Cronograma (Kanban + Calendário + Timeline/Gantt leve)  
13. Central de decisões  
14. Analytics operacional  
15. Assistente de IA (5 intents principais)  
16. Design System base + app shell  

### 5.2 Excluído do MVP (explícito)

| Item | Motivo |
|------|--------|
| Site público do casamento | Escopo de produto separado |
| Pagamentos in-app | Complexidade regulatória |
| Chat interno | WhatsApp já cobre; baixo ROI |
| Multi-idioma | PT-BR primeiro |
| Offline-first | Complexidade prematura |
| App mobile nativo | PWA responsivo basta no MVP |

---

## 6. Módulos — Requisitos Funcionais

### 6.0 Entidade raiz: Wedding Project

Todo o sistema gira em torno de um **Wedding** (projeto).

Campos mínimos:

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | |
| name | string | Ex.: “Ana & Bruno” |
| wedding_date | date | Obrigatório após onboarding |
| total_budget | money | Orçamento teto |
| currency | enum | BRL default |
| city / venue | string | Opcional |
| style_tags | string[] | Ex.: clássico, moderno |
| status | enum | planning / week_of / done / archived |
| created_by | user_id | |

**Decisão de produto:** no MVP, **1 casamento ativo por workspace**. Arquitetura preparada para N casamentos (cerimonialistas).

---

### 6.1 Dashboard

**Objetivo:** resposta em < 5s às perguntas norteadoras.

#### KPIs obrigatórios

| KPI | Cálculo |
|-----|---------|
| % planejamento concluído | tarefas concluídas / tarefas totais (ponderado por prioridade no v1.1) |
| Dias restantes | wedding_date − today |
| Valor previsto | Σ budget_items.planned |
| Valor contratado | Σ budget_items.contracted |
| Valor pago | Σ budget_items.paid |
| Valor restante (caixa) | total_budget − paid |
| Valor comprometido | contracted (ou planned se não contratado) |
| Tarefas: total / feitas / atrasadas | por status + due_date < today |
| Fornecedores contratados | status = contracted \| paid |
| Pendências críticas | prioridade ≥ 4 AND (atrasado OR sem fornecedor) |
| Próximas decisões | decisions.status = pending, ordenadas por prazo |
| Alertas | motor de regras (seção 7) |
| Timeline | próximos 7–14 dias de milestones |

#### UX

- Acima da dobra: 4–6 KPIs + “próximo passo” sugerido  
- Sem dashboard de “widgets soltos” — uma composição hierárquica  
- Empty states com CTA de onboarding incompleto  

---

### 6.2 Gestão de Orçamento

#### Item orçamentário

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| category | sim | Buffet, Decoração, Foto, etc. (catálogo seed) |
| subcategory | não | |
| description | sim | |
| planned_amount | sim | Valor previsto |
| contracted_amount | não | |
| paid_amount | não | |
| balance | calculado | planned − paid (ou contracted − paid) |
| payment_date | não | Próximo pagamento |
| vendor_id | não | FK |
| installments | não | n parcelas + valores |
| payment_method | não | pix, cartão, boleto, transferência |
| receipt_file_ids | não | Storage |
| notes | não | |
| status | sim | planned / quoted / contracted / partially_paid / paid / cancelled |
| priority | sim | 1–5 (matriz) |
| flexibility | sim | cannot_cut / can_reduce / can_remove |
| emotional_return | sim | 1–5 estrelas |

#### Views

1. Tabela filtrável (default)  
2. Por categoria (agrupada)  
3. Gráficos: pizza/barra por categoria, previsto × realizado, evolução de pagos no tempo  

#### Regras

- Alerta se `Σ contracted > total_budget`  
- Alerta se `Σ planned > total_budget * 1.05` (buffer 5%)  
- Status “parcialmente pago” quando 0 < paid < contracted  

**Decisão:** valores sempre em centavos no banco; exibição formatada BRL.

---

### 6.3 Matriz de Prioridade

Não é um módulo isolado com tela única — é um **sistema transversal**.

Cada entidade financeira (e opcionalmente tarefa/fornecedor) carrega:

```
priority: 1 | 2 | 3 | 4 | 5
flexibility: cannot_cut | can_reduce | can_remove
emotional_return: 1..5
```

#### Como influencia o produto

| Motor | Uso da matriz |
|-------|----------------|
| Dashboard | Pendências críticas = priority ≥ 4 |
| Analytics | Ranking custo × prioridade |
| IA “o que cortar” | Ordena por flexibility + baixo emotional_return + alto custo |
| Checklist | Sugere foco nas priority 5 próximas do prazo |
| Alertas | Item essencial sem fornecedor 90 dias antes |

**Tela dedicada (MVP):** “Sala de cortes” — simulação: se precisar reduzir X%, quais itens o sistema recomenda.

---

### 6.4 Checklist Inteligente

#### Fases (relativas à data do casamento)

| Fase | Janela |
|------|--------|
| 18m | ≤ 18 meses |
| 12m | ≤ 12 meses |
| 9m | ≤ 9 meses |
| 6m | ≤ 6 meses |
| 3m | ≤ 3 meses |
| 1m | ≤ 30 dias |
| 15d | ≤ 15 dias |
| 7d | ≤ 7 dias |
| 3d | ≤ 3 dias |
| day_of | dia do evento |
| post | pós-casamento (agradecimentos, etc.) |

#### Tarefa

| Campo | Notas |
|-------|-------|
| title | |
| phase | enum acima |
| assignee_id | membro do workspace |
| category | alinhada ao orçamento quando possível |
| priority | 1–5 |
| due_date | |
| status | todo / doing / blocked / done / cancelled |
| dependency_ids | outras tarefas |
| file_ids | |
| comments | thread simples |
| history | audit log (status changes) |
| budget_item_id | opcional — liga tarefa a gasto |
| vendor_id | opcional |

#### Inteligência (MVP, regras + templates)

- Seed de template BR com ~80–120 tarefas padrão no onboarding  
- Auto-marcar fase atual com base em `wedding_date`  
- Bloqueio visual se dependência não concluída  
- “Atrasadas” = due_date < today AND status ≠ done  

**Decisão:** histórico de comentários no MVP é linear (sem @menções complexas).

---

### 6.5 Fornecedores

| Campo | Notas |
|-------|-------|
| category | foto, buffet, DJ, local, etc. |
| name | |
| contact_name | |
| phone | |
| email | |
| instagram | |
| website | |
| contract_file_ids | |
| quoted_amount / contracted_amount | |
| payment_summary | derivado do budget |
| rating | 1–5 |
| notes | |
| status | researching / contacted / quoted / contracted / rejected / cancelled |
| files | |

**Relação:** 1 fornecedor → N budget items; 1 budget item → 0..1 vendor.

---

### 6.6 Convidados

| Campo | Notas |
|-------|-------|
| name | |
| family / household | agrupamento |
| group | família noiva, noivo, amigos, trabalho |
| table | mesa (string/número) |
| rsvp | pending / yes / no / maybe |
| dietary | tags |
| attendance | confirmed / declined / unknown |
| party_size | quantidade (ex.: +1) |
| notes | |
| side | bride / groom / both |

Filtros: grupo, RSVP, restrição, mesa, lado.

**KPIs do módulo:** total convidados, confirmados, pendentes, com restrição, mesas incompletas.

**Fora do MVP:** convite digital automático / site RSVP.

---

### 6.7 Presentes

| Campo | Notas |
|-------|-------|
| name / description | |
| url | opcional |
| price | |
| purchased_by | guest ou texto |
| status | available / reserved / purchased / delivered |
| thank_you_sent | boolean |
| notes | |

---

### 6.8 Lua de Mel

Módulo **leve** no MVP (não segundo projeto completo):

- Checklist próprio (subset)  
- Documentos (passaporte, seguro, vouchers)  
- Reservas: voo, hotel, seguro, roteiro (cards)  
- Custos (liga a categoria “Lua de mel” no orçamento)  

**Decisão:** não criar segundo Wedding; honeymoon é sub-espaço do mesmo projeto.

---

### 6.9 Documentos

Repositório único com tags:

| Tipo | Exemplos |
|------|----------|
| contract | contratos |
| receipt | comprovantes |
| invoice | notas |
| photo | referências |
| pdf | genérico |
| other | |

Metadados: nome, tipo, linked_entity (budget/vendor/task/decision), uploaded_by, created_at.

Storage: Supabase Storage; limite MVP 1 GB/workspace (ajustável no plano).

---

### 6.10 Cronograma

Três visualizações da **mesma** entidade Task (+ milestones):

| View | Uso |
|------|-----|
| Kanban | status columns |
| Calendário | due_date |
| Timeline / Gantt leve | fases + barras por due_date |

Milestones: eventos-chave (prova do vestido, tasting, etc.) — subtype de task ou entidade `Milestone`.

**Decisão MVP:** Gantt simplificado (barra por tarefa com início/fim; sem resource leveling).

---

### 6.11 Central de Decisões

Cada decisão:

| Campo | Notas |
|-------|-------|
| title | Ex.: “Buffet escolhido” |
| category | |
| status | pending / decided / revisited |
| options_considered | texto / lista |
| chosen_option | |
| rationale | motivo |
| decided_at | |
| decided_by | |
| linked_vendor_id | |
| linked_budget_item_id | |
| emotional_return | |
| attachments | |

**UX:** feed de decisões + filtro por status. Dashboard mostra “próximas decisões”.

---

### 6.12 Analytics

Não é vanity metrics — é **diagnóstico operacional**.

Painéis:

1. Share do orçamento por categoria  
2. Top custos  
3. Alta prioridade × alto custo  
4. Itens atrasados (tarefas + pagamentos)  
5. Críticos (priority 5 + risco)  
6. Alertas inteligentes (agregado)  

Export CSV no MVP (orçamento + convidados).

---

### 6.13 Assistente de IA

#### Intents do MVP

| Intent | Input | Output |
|--------|-------|--------|
| budget_overflow | % ou valor estouro | Lista ordenada do que reduzir/remover |
| what_to_hire | estado atual | Categorias sem fornecedor contratado + prazo |
| generate_tasks | fase ou descrição | Tarefas sugeridas (usuário confirma) |
| vendor_value | vendors + quotes | Ranking custo-benefício heurístico |
| budget_allocation | total_budget + estilo | Sugestão % por categoria (benchmark BR) |

#### Princípios

- IA **nunca grava** sem confirmação do usuário  
- Sempre mostra **evidência** (números do workspace)  
- Fallback para regras se API indisponível  
- Logs de prompts para melhoria (sem dados sensíveis desnecessários)  

**Decisão técnica (a detalhar na arquitetura):** provider pluggable (OpenAI/Anthropic); prompts versionados; context = snapshot agregado do wedding, não dump bruto de PII.

---

## 7. Motor de Alertas (regras)

| ID | Condição | Severidade |
|----|----------|------------|
| A1 | Σ contracted > total_budget | critical |
| A2 | Σ planned > total_budget × 1.05 | warning |
| A3 | Pagamento com payment_date nos próximos 7 dias | info |
| A4 | Pagamento overdue | critical |
| A5 | Task due_date passada | warning/critical se priority≥4 |
| A6 | Priority 5 sem vendor a ≤90 dias do casamento | critical |
| A7 | Decisão pending com prazo | warning |
| A8 | RSVP pending > 50% a ≤30 dias | warning |

Alertas aparecem no Dashboard e em `/alerts`.

---

## 8. Requisitos Não-Funcionais

| Área | Requisito |
|------|-----------|
| Performance | LCP < 2.5s nas rotas principais (desktop) |
| Disponibilidade | 99.5% MVP |
| Segurança | RLS por workspace; Auth Supabase; HTTPS |
| Privacidade | LGPD: export + delete account |
| Acessibilidade | WCAG 2.1 AA nas telas core |
| Responsividade | Mobile-first para consulta; desktop para edição pesada |
| Escalabilidade | Multi-tenant por workspace_id; indexes em FKs |
| i18n | PT-BR only no MVP; strings externalizáveis |

---

## 9. Autenticação, Papéis e Permissões

### 9.1 Papéis (MVP)

| Role | Permissões |
|------|------------|
| owner | Tudo + billing futuro + deletar wedding |
| partner | Quase tudo (casal) |
| collaborator | CRUD em tarefas atribuídas; leitura orçamento (configurável) |
| viewer | Somente leitura |

### 9.2 Auth

- Email/senha + magic link (Supabase Auth)  
- Convite por email para colaboradores  
- Sessão JWT; middleware Next.js  

---

## 10. Onboarding

Fluxo obrigatório (reduz empty state):

1. Criar conta  
2. Nome do casal / casamento  
3. Data do casamento  
4. Orçamento total estimado  
5. Cidade  
6. Estilo (tags)  
7. Gerar template de checklist + categorias de orçamento  
8. Convidar parceiro(a) (opcional, skipável)  
9. Dashboard com “próximos 3 passos”  

**Decisão:** sem data do casamento, o checklist por fases não ativa — forçar no onboarding.

---

## 11. Modelo de Monetização (direção)

Não implementa paywall no código do dia 1, mas o PRD define:

| Plano | Ideia |
|-------|-------|
| Free | 1 casamento, limites (convidados/docs) |
| Pro | Ilimitado no essencial + IA |
| Agency (futuro) | Multi-casamentos |

Feature flags preparadas na arquitetura.

---

## 12. Roadmap

### Fase 0 — Fundação (esta sequência de entregas)

PRD → Arquitetura → DB → Fluxos → Sitemap → Wireframes → DS → Componentes → Implementação

### Fase 1 — MVP (este documento)

Módulos da seção 6.

### Fase 2 — Crescimento

- Site/RSVP público  
- App PWA instalável polished  
- Notificações email/push  
- Templates por faixa de orçamento  

### Fase 3 — Plataforma

- Modo cerimonialista  
- Portal fornecedor  
- Marketplace / diretório  
- Multi-eventos  

---

## 13. Métricas de Produto (instrumentação)

Eventos mínimos (analytics de produto, não Clarity):

- `onboarding_completed`  
- `budget_item_created`  
- `task_completed`  
- `vendor_contracted`  
- `decision_recorded`  
- `ai_suggestion_accepted`  
- `alert_clicked`  

---

## 14. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Escopo inchado | Freeze de MVP; roadmap explícito |
| IA cara / imprecisa | Caps + fallback regras + confirmação humana |
| Casal não preenche dados | Onboarding + templates + empty states com CTA |
| Complexidade de Gantt | Timeline leve primeiro |
| LGPD / documentos sensíveis | RLS + Storage policies + retenção |

---

## 15. Critérios de Aceite do MVP

O MVP está pronto quando:

1. Casal completa onboarding e vê Dashboard com KPIs reais  
2. Consegue CRUD completo de orçamento, tarefas, fornecedores, convidados  
3. Matriz de prioridade altera a “Sala de cortes” e alertas  
4. Documentos sobem e vinculam a entidades  
5. Três views de cronograma funcionam sobre as mesmas tarefas  
6. Decisões ficam registradas e aparecem no Dashboard  
7. IA responde aos 5 intents com dados do workspace  
8. Design System aplicado; UI coerente desktop + mobile  
9. Auth + convite de parceiro funcionando  
10. Deploy staging com Postgres + Supabase  

---

## 16. Decisões de Produto Consolidadas

1. **É project management**, não checklist — entidades conectadas e KPIs.  
2. **Um wedding por workspace no MVP**; multi-wedding na arquitetura.  
3. **Matriz de prioridade é transversal**, não um gadget.  
4. **IA sugere; humano confirma.**  
5. **PT-BR, BRL, templates Brasil.**  
6. **Mobile para consulta; desktop para operação pesada.**  
7. **Sem marketplace / RSVP público / app nativo no MVP.**  
8. **Luxo visual minimalista** (branco, espaço, tipografia expressiva) — detalhado no Design System.  
9. **Tudo mensurável** — se não dá para medir, não priorizamos.  
10. **Evolução comercial:** feature flags e papéis desde o dia 1.

---

## 17. Glossário

| Termo | Significado |
|-------|-------------|
| Wedding / Project | O casamento sendo planejado |
| Workspace | Contêiner multi-user do casamento |
| Budget item | Linha do orçamento |
| Phase | Janela temporal do checklist |
| Flexibility | Capacidade de corte do item |
| Emotional return | Valor afetivo (1–5) |
| Critical pending | Alta prioridade + risco (atraso/falta) |
| Decision | Escolha registrada com motivo |

---

## 18. Próxima Etapa

**Etapa 2 — Arquitetura de Software**

Incluirá:

- Diagrama de contexto e containers (C4)  
- Stack detalhada e responsabilidades  
- Estrutura de pastas (`components`, `features`, `modules`, …)  
- Auth, multi-tenancy, RLS  
- Camada de dados (Prisma + Supabase)  
- Estratégia de IA  
- Caching (TanStack Query)  
- Observabilidade e ambientes  

**Não iniciaremos modelagem de banco, fluxos, wireframes nem código até a arquitetura ser revisada.**

---

*Documento vivo. Mudanças de escopo devem atualizar esta versão e o changelog abaixo.*

### Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-08-06 | PRD inicial completo |
