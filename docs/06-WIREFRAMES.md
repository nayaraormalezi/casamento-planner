# Wedding Planner — Wireframes

**Versão:** 1.0  
**Status:** Aprovado — Design System em andamento  
**Data:** 06 de agosto de 2026  
**Fidelidade:** Média (estrutura, hierarquia, zonas — sem visual final)  
**Base:** [Sitemap](./05-SITEMAP.md) · [Fluxos](./04-USER-FLOWS.md) · [PRD](./01-PRD.md)  

---

## 1. Convenções

| Símbolo | Significado |
|---------|-------------|
| `[====]` | Botão / CTA primário |
| `(....)` | Botão secundário / ghost |
| `[~~~~]` | Input / campo |
| `{....}` | Badge / chip |
| `······` | Texto secundário / helper |
| `████` | Área de conteúdo / card zona |
| `← →` | Navegação / drawer |

### Regras de composição (wire → produto)

1. **Uma composição por viewport** — não dashboard de widgets soltos.  
2. **Page header** em toda tela app: título + 1 frase de próximo passo + ações.  
3. **Detalhe = drawer** (direita, ~420–480px), não página nova.  
4. **Empty state** = 1 mensagem + 1 CTA.  
5. **Mobile:** bottom nav; drawers viram full-screen sheets.

Telas wireframadas neste doc:

| ID | Tela |
|----|------|
| W01 | Landing |
| W02 | Login / Signup |
| W03 | Onboarding |
| W04 | App Shell |
| W05 | Dashboard |
| W06 | Orçamento |
| W07 | Sala de cortes |
| W08 | Tarefas |
| W09 | Cronograma |
| W10 | Fornecedores |
| W11 | Convidados |
| W12 | Decisões |
| W13 | Alertas |
| W14 | Assistente IA |
| W15 | Documentos |
| W16 | Settings |

Presentes, lua de mel e analytics reutilizam o padrão de W06/W10 (lista + header + drawer).

---

## 2. W01 — Landing `/`

**Objetivo:** marca como herói; um CTA; sem clutter no first viewport.

```text
┌─────────────────────────────────────────────────────────────┐
│  Wedding Planner          Entrar    [==== Criar conta ====] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              WEDDING PLANNER          ← brand hero          │
│                                                             │
│         O projeto do seu casamento,                         │
│         não só uma lista.                                   │
│                                                             │
│         ······ Orçamento, tarefas e decisões                │
│                em um só lugar.                              │
│                                                             │
│              [==== Começar planejamento ====]               │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║         FULL-BLEED VISUAL PLANE                       ║  │
│  ║         (atmosfera do produto / casamento)            ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓ abaixo da dobra (não compete com hero)
┌─────────────────────────────────────────────────────────────┐
│  Seção 1: O que o sistema responde                          │
│  (4 perguntas norteadoras — uma coluna limpa)               │
├─────────────────────────────────────────────────────────────┤
│  Seção 2: Módulos em overview                               │
├─────────────────────────────────────────────────────────────┤
│  Footer: termos, privacy, CTA                               │
└─────────────────────────────────────────────────────────────┘
```

**Notas:** sem stats, sem cards no hero, sem badges flutuantes.

---

## 3. W02 — Auth `/login` · `/signup`

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ┌─────────────────────────┐                    │
│              │  Wedding Planner        │                    │
│              │  Entrar na sua conta    │                    │
│              │                         │                    │
│              │  Email  [~~~~~~~~~~~~]  │                    │
│              │  Senha  [~~~~~~~~~~~~]  │                    │
│              │                         │                    │
│              │  [==== Entrar ====]     │                    │
│              │  (.... Magic link ....) │                    │
│              │  ··· Criar conta        │                    │
│              └─────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Signup = mesmo card + campo Nome. Convite `/invite/[token]` = card com nome do casamento + CTA aceitar.

---

## 4. W03 — Onboarding `/onboarding`

```text
┌─────────────────────────────────────────────────────────────┐
│  Wedding Planner                    Passo 3 de 7            │
│  ● ● ● ○ ○ ○ ○                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Quando é o grande dia?                              │
│         ······ Usamos a data para montar fases              │
│                e prazos do checklist.                       │
│                                                             │
│              Data  [~~~~ calendario ~~~~]                   │
│                                                             │
│         (.... Voltar ....)     [==== Continuar ====]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Step final “Gerando plano”: progress indeterminado + copy “Montando categorias e tarefas…”.  
Step “Primeiros 3 passos”: lista numerada com CTAs para `/app/budget`, `/app/vendors`, `/app/tasks`.

---

## 5. W04 — App Shell

### Desktop

```text
┌──────┬──────────────────────────────────────────────────────┐
│ LOGO │  Ana & Bruno     128 dias   34%   R$82k/100k   🔔 ✨ │
│      │                                               (avatar)│
├──────┼──────────────────────────────────────────────────────┤
│ OPER │                                                      │
│ Iníc │                 PAGE CONTENT                         │
│ Aler │                                                      │
│ IA   │                                                      │
│      │                                                      │
│ PLAN │                                                      │
│ Tare │                                                      │
│ Cron │                                                      │
│ Deci │                                                      │
│      │                                                      │
│ $$$$ │                                                      │
│ Orça │                                                      │
│ Prio │                                                      │
│ Anal │                                                      │
│      │                                                      │
│ PESS │                                                      │
│ Forn │                                                      │
│ Conv │                                                      │
│ Pres │                                                      │
│      │                                                      │
│ EXTRA│                                                      │
│ Lua  │                                                      │
│ Docs │                                                      │
│──────│                                                      │
│ Conf │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

Sidebar ~240px; colapsável para ícones (~72px).

### Mobile

```text
┌─────────────────────┐
│ Ana & Bruno    🔔 ✨│
│ 128d · 34% · meta $ │
├─────────────────────┤
│                     │
│   PAGE CONTENT      │
│                     │
├─────────────────────┤
│ Início Taref $ 🔔 ⋯ │
└─────────────────────┘
```

---

## 6. W05 — Dashboard `/app/dashboard`

**Composição:** 1 narrativa vertical — status → próximo passo → dinheiro → risco → tempo.

```text
┌─ Page header ───────────────────────────────────────────────┐
│  Início                                                     │
│  ······ Próximo: confirmar pagamento do buffet (vence amanhã)│
│                                    [==== Resolver ====]     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 34%      │ │ 128 dias │ │ Comprom. │ │ Atrasadas│        │
│  │ plano    │ │ restante │ │ R$ 82k   │ │ 3 tarefas│        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ······ Previsto · Contratado · Pago · Restante (linha)     │
├─────────────────────────────────────────────────────────────┤
│  PENDÊNCIAS CRÍTICAS                                        │
│  ! Pagamento buffet overdue          [Ir]                   │
│  ! Fotógrafo essencial sem contrato  [Ir]                   │
│  · Decisão: paleta pendente           [Ir]                   │
├─────────────────────────────────────────────────────────────┤
│  PRÓXIMOS 14 DIAS                    DECISÕES PENDENTES     │
│  · Timeline lista (3–5)              · 2 cards compactos    │
│                                      [Ver todas]            │
└─────────────────────────────────────────────────────────────┘
```

**Não fazer:** grid de 12 widgets equivalentes; charts pesados (vão para Analytics).

---

## 7. W06 — Orçamento `/app/budget`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Orçamento                                                  │
│  ······ Comprometido R$82k de R$100k · 18% livre            │
│  (Tabela) (Categorias) (Gráficos)     [==== Novo item ====] │
├─ Filtros ───────────────────────────────────────────────────┤
│  [busca]  {categoria▾} {status▾} {prioridade▾}              │
├─ Tabela ────────────────────────────────────────────────────┤
│  Cat │ Descrição      │ Prev │ Contr │ Pago │ Pri │ Flex │⋯ │
│ ·····│················│······│·······│······│·····│······│·· │
│ ·····│················│······│·······│······│·····│······│·· │
├─ Footer sticky ─────────────────────────────────────────────┤
│  Σ Previsto  Σ Contratado  Σ Pago  Restante caixa           │
└─────────────────────────────────────────────────────────────┘
         → click row abre DRAWER
┌──────────────────────────────┐
│ Item · Buffet premium     ✕  │
│ Categoria [~~~~]             │
│ Previsto / Contratado / Pago │
│ Prioridade ●●●●○  Flex ▾     │
│ Retorno emocional ★★★★☆      │
│ Fornecedor [~~~~]            │
│ Parcelas · Comprovante       │
│ [Salvar]  (Excluir)          │
└──────────────────────────────┘
```

Empty: ilustração mínima + “Comece pelo local e buffet” + CTA.

---

## 8. W07 — Sala de cortes `/app/priority`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Prioridades · Sala de cortes                               │
│  ······ Orçamento 12% acima · quanto quer recuperar?        │
├─────────────────────────────────────────────────────────────┤
│  Meta de corte:  (○ %)  (● R$)   [~~~~ 12000 ~~~~]          │
│  [==== Simular ====]                                        │
├─ Resultados ────────────────────────────────────────────────┤
│  ☐ Lembrancinhas     Luxo · pode remover · -R$4.200         │
│  ☐ Upgrade flores    Desejável · reduzir · -R$3.000         │
│  ☐ Banda extra       ······ cannot_cut (bloqueado)          │
├─ Preview ───────────────────────────────────────────────────┤
│  Novo comprometido: R$88k / 100k   Selecionado: -R$7.2k     │
│  [==== Aplicar cortes ====]   (.... Limpar ....)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. W08 — Tarefas `/app/tasks`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Tarefas                                                    │
│  ······ Fase atual: 3 meses · 8 abertas · 2 atrasadas       │
│  {Todas} {Fase atual} {Atrasadas} {Minhas}  [==== Nova ====]│
├─ Phase rail ────────────────────────────────────────────────┤
│  18m  12m  9m  [6m]  3m  1m  15d  7d  3d  Dia  Pós  Lua     │
├─ Lista ─────────────────────────────────────────────────────┤
│  ☐ Contratar DJ          P4  · 12/mai  · Ana   {doing}      │
│  ⚠ Enviar convites       P5  · atrasada · —    {todo}       │
│  🔒 Degustação (dep: buffet) ················ {blocked}     │
└─────────────────────────────────────────────────────────────┘
```

Drawer: título, fase, prioridade, prazo, responsável, deps, arquivos, comentários, histórico.

---

## 10. W09 — Cronograma `/app/schedule`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Cronograma                                                 │
│  ······ Mesmas tarefas · escolha a visão                    │
│  (Kanban) (Calendário) (Timeline)                           │
├─────────────────────────────────────────────────────────────┤
│  KANBAN                                                     │
│  ┌ Todo ┐  ┌ Doing ┐  ┌ Blocked ┐  ┌ Done ┐                 │
│  │ card │  │ card  │  │ card    │  │ card │                 │
│  │ card │  │       │  │         │  │ card │                 │
│  └──────┘  └───────┘  └─────────┘  └──────┘                 │
└─────────────────────────────────────────────────────────────┘
```

Calendário = grid mensal com dots. Timeline = linhas horizontais por fase/tarefa.

---

## 11. W10 — Fornecedores `/app/vendors`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Fornecedores                                               │
│  ······ 4 contratados · 2 em cotação · 1 essencial faltando │
│  [==== Novo fornecedor ====]                                │
├─ Filtros: categoria · status · busca ───────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐                    │
│  │ Nome · Cat      │ │ Nome · Cat      │                    │
│  │ Status {····}   │ │ Status {····}   │                    │
│  │ R$ cotado       │ │ R$ cotado       │                    │
│  │ ★★★★☆           │ │ —               │                    │
│  └─────────────────┘ └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

Lista densa preferível a “cards decorativos”; no wire, blocos = linhas clicáveis. Drawer com contato, status pipeline, contrato upload, link budget/decision.

---

## 12. W11 — Convidados `/app/guests`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Convidados                                                 │
│  ······ 120 pessoas · 68 confirmados · 40 pendentes         │
│  [==== Adicionar ====]                                      │
├─ Filtros: grupo · RSVP · mesa · lado · dietary · busca ─────┤
│  Nome          Grupo      Mesa  RSVP    Qtd  Restrições     │
│  ············  ·········  ····  {yes}   2    vegetariano    │
│  ············  ·········  ····  {pend}  1    —              │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. W12 — Decisões `/app/decisions`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Decisões                                                   │
│  ······ 3 pendentes · registre o motivo das escolhas        │
│  {Pendentes} {Decididas}              [==== Nova ====]      │
├─────────────────────────────────────────────────────────────┤
│  ○ Buffet escolhido?        due 10/mai    [Decidir]         │
│  ○ Paleta de cores          due —         [Decidir]         │
│  ● DJ escolhido             02/abr · Ana  motivo…           │
└─────────────────────────────────────────────────────────────┘
```

Drawer “Decidir”: opções consideradas, escolhida, rationale, vendor, budget link.

---

## 14. W13 — Alertas `/app/alerts`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Alertas                                                    │
│  ······ 2 críticos · 3 avisos                               │
├─────────────────────────────────────────────────────────────┤
│  ■ CRITICAL  Pagamento buffet vencido           [Resolver]  │
│  ■ CRITICAL  Foto sem fornecedor (P5)           [Resolver]  │
│  ■ warning   12 tarefas atrasadas               [Ver]       │
│  ■ info      Pagamento decoração em 5 dias      [Ver]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. W14 — Assistente IA `/app/ai`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Assistente                                                 │
│  ······ Sugestões com base nos seus números · você confirma │
├─ Intents ───────────────────────────────────────────────────┤
│  [ Estourou orçamento ] [ O que contratar ]                 │
│  [ Gerar tarefas ] [ Custo-benefício ] [ Distribuir $ ]     │
├─ Painel ────────────────────────────────────────────────────┤
│  Input contextual (ex.: meta de corte)  [~~~~]              │
│  [==== Gerar sugestão ====]                                 │
├─ Preview ───────────────────────────────────────────────────┤
│  Evidência: comprometido 112% do teto                       │
│  ☐ item A  ☐ item B  ☐ item C                               │
│  [==== Aplicar selecionados ====]  (Descartar)              │
└─────────────────────────────────────────────────────────────┘
```

Não é chat livre infinito no MVP — intents guiados.

---

## 16. W15 — Documentos `/app/documents`

```text
┌─ Header ────────────────────────────────────────────────────┐
│  Documentos                                                 │
│  ······ 240 MB de 1 GB                                      │
│  [==== Enviar ====]                                         │
├─ Filtros: tipo · vinculado a · busca ───────────────────────┤
│  📄 contrato-buffet.pdf   contract   Buffet   12/mar        │
│  🖼  ref-decor.jpg        photo      Decor    01/abr        │
└─────────────────────────────────────────────────────────────┘
```

Upload = dropzone no drawer/modal.

---

## 17. W16 — Settings

```text
┌─ Subnav ────────────────────────────────────────────────────┐
│  (Geral)  (Equipe)  (Dados)                                 │
├─ Geral ─────────────────────────────────────────────────────┤
│  Nome do casamento [~~~~]                                   │
│  Data [~~~~]   Orçamento teto [~~~~]                        │
│  Cidade [~~~~] Venue [~~~~]                                 │
│  Estilo {tags}                                              │
│  [Salvar]                                                   │
└─────────────────────────────────────────────────────────────┘
```

Equipe: lista membros + role select + convitar email.  
Dados: Exportar · Excluir workspace (confirm type-name).

---

## 18. Padrões reutilizáveis

### P01 — Page header

```text
Título
······ Próximo passo / status em uma linha
                         ações secundárias · [CTA primário]
```

### P02 — Drawer de entidade

Largura fixa; header sticky com nome + status; footer sticky Salvar/Excluir; body scroll.

### P03 — KPI strip

Máx. 4 blocos no dashboard; tipografia grande no número; label pequena abaixo.

### P04 — Tabela densa

Preferir tabela em orçamento/convidados; evitar card grid para dados financeiros.

### P05 — Confirm destrutivo

Modal centrado: título risco · consequência · type-to-confirm se delete workspace.

### P06 — Toast

Canto inferior; 1 linha; some 4s; não bloqueia.

---

## 19. Responsive breakpoints (wire)

| Breakpoint | Comportamento |
|------------|---------------|
| ≥ 1024 | Sidebar + drawer |
| 768–1023 | Sidebar icon rail + drawer |
| < 768 | Bottom nav + full sheet; tabelas → lista stacked |

---

## 20. Critérios de aceite — Wireframes

- [x] Shell desktop/mobile  
- [x] Onboarding + auth + landing (first viewport limpo)  
- [x] Dashboard orientado a próximo passo  
- [x] Orçamento + sala de cortes + tarefas + cronograma  
- [x] Demais módulos em padrão lista/header/drawer  
- [x] IA por intents (não chat genérico)  
- [x] Padrões reutilizáveis documentados  

---

## 21. Próxima etapa

**Etapa 7 — Design System**

Tokens (cor, tipo, espaço), componentes base (botões, inputs, badges, KPIs, tabelas, drawer, toast, charts) e direção visual luxuosa/minimalista alinhada ao PRD.

**Não iniciaremos implementação de componentes de produto até o Design System ser revisado.**

---

### Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-08-06 | Wireframes média fidelidade iniciais |
