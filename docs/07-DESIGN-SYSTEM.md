# Wedding Planner — Design System

**Versão:** 1.0  
**Status:** Aprovado — componentes em andamento  
**Data:** 06 de agosto de 2026  
**Tokens:** [`styles/tokens.css`](../styles/tokens.css)  
**Base:** [PRD](./01-PRD.md) · [Wireframes](./06-WIREFRAMES.md)  

---

## 1. Direção visual

### 1.1 Posicionamento

| É | Não é |
|---|-------|
| Luminoso, branco, respiração | Escuro / neon / glow |
| Luxo quieto (hotel boutique + Linear) | Wedding cliché (rosa bebê, glitter) |
| Tipografia expressiva | Inter / Roboto / Arial |
| Acento champagne-bronze | Roxo / índigo / terracota em cream |
| Uma sombra suave | Multi-layer shadows |
| Radius contido | Pill em tudo |

**Referências de sentimento:** Apple (clareza) · Linear (densidade elegante) · Stripe (confiança financeira) · Notion (espaço) · Raycast (precisão) · Airbnb (atmosfera).

### 1.2 Princípios

1. **Marca primeiro** em superfícies públicas — “Wedding Planner” é herói, não eyebrow.  
2. **Espaço é hierarquia** — padding generoso; menos caixas.  
3. **Cards só quando há interação** — lista/tabela para dados.  
4. **Números merecem tipografia** — tabular figures para dinheiro.  
5. **Motion com propósito** — 2–3 gestos (drawer, fade page, KPI count), não confete.  
6. **Atmosfera sutil** — gradiente radial champagne + cool mist no canvas; nunca flat morto nem cream genérico.

---

## 2. Fundações

### 2.1 Cor

| Token | Hex / valor | Uso |
|-------|-------------|-----|
| `canvas` | `#F5F6F8` | Fundo app |
| `canvas-elevated` | `#FFFFFF` | Superfícies / drawers |
| `ink` | `#12141A` | Texto primário + botão primary |
| `ink-secondary` | `#3C4250` | Corpo |
| `ink-tertiary` | `#6B7280` | Meta / placeholders |
| `accent` | `#9A7B4F` | Destaques, stars, focus ring, links especiais |
| `success` | `#1F6B4A` | Pago / done |
| `warning` | `#9A6700` | Atrasos leves |
| `danger` | `#B42318` | Critical / overdue |
| `info` | `#3D5A80` | Informativo |

**Prioridade 1–5:** escala de cinza → bronze → laranja queimado → vermelho (ver tokens).

**Proibido no produto:** purple/indigo gradients, glow, backgrounds `#F4F1EA` + terracota como tema default.

### 2.2 Tipografia

| Papel | Família | Peso | Uso |
|-------|---------|------|-----|
| Display | **Syne** | 600–700 | Brand, hero, títulos de página |
| Sans UI | **Manrope** | 400–600 | Corpo, labels, tabelas |
| Mono | **IBM Plex Mono** | 400–500 | Opcional em IDs; dinheiro usa Manrope tabular |

#### Escala

| Nome | Size | Line | Tracking | Uso |
|------|------|------|----------|-----|
| hero | clamp(2.75rem–4.5rem) | 1.1 | -0.03em | Landing brand |
| h1 | 1.875–2.25rem | 1.15 | -0.02em | Page title |
| h2 | 1.5rem | 1.25 | -0.02em | Section |
| h3 | 1.25rem | 1.3 | -0.01em | Drawer title |
| body | 1rem | 1.5 | 0 | Texto |
| sm | 0.875rem | 1.45 | 0 | Meta, tabela |
| xs | 0.75rem | 1.4 | 0.04em | Labels uppercase raro |

**Números monetários:** `font-variant-numeric: tabular-nums`; peso 500–600.

### 2.3 Espaçamento

Base **4px**. Escala: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24.

| Contexto | Token |
|----------|-------|
| Gap interno botão | 2–3 |
| Campo form | 3 entre label e input |
| Section padding | 8–12 |
| Page padding desktop | 8–10 |
| Page padding mobile | 4–5 |
| Sidebar item | 3 vertical |

### 2.4 Grid & layout

| Zona | Largura |
|------|---------|
| Sidebar | 240px (72 collapsed) |
| Content max | 1200px |
| Reading (onboarding/marketing copy) | 680px |
| Drawer | 440px |
| Topbar | 56px height |
| Colunas tabela | fluido; sticky primeira col em mobile stack |

Marketing: full-bleed hero; conteúdo abaixo em 12 col implícitas com gutter 24px.

### 2.5 Radius & elevação

| Token | Valor | Uso |
|-------|-------|-----|
| sm | 6px | Inputs, badges |
| md | 10px | Botões, menus |
| lg | 14px | Drawer, dialogs, painéis |
| xl | 20px | Marketing panels raros |
| full | pill | **Só avatar** |

Sombra: `sm` / `md` / `lg` — uma camada. Drawers: elevação + border, sem glow.

### 2.6 Motion

| Gesto | Duração | Easing | Onde |
|-------|---------|--------|------|
| Fade + slight rise page | 220ms | ease-out | Troca de rota |
| Drawer slide | 280–360ms | ease-out | Detalhe entidade |
| KPI value morph | 360ms | ease-out | Dashboard refresh |
| Hover opacity/border | 150ms | ease | Controles |
| Toast in/out | 220ms | ease | Feedback |

`prefers-reduced-motion`: durations → 0.

---

## 3. Componentes

Nomenclatura: `Wp` prefix interno; implementação sobre shadcn re-temado.

### 3.1 Botões

| Variant | Visual | Uso |
|---------|--------|-----|
| `primary` | fill ink, texto inverse | CTA principal (1 por zona) |
| `secondary` | fill white, border | Ações secundárias |
| `accent` | fill champagne | Momentos “luxo” / aplicar IA (raro) |
| `ghost` | sem fill | Nav, tertiary |
| `danger` | fill/subtle danger | Delete |
| `link` | texto + underline hover | Inline |

| Size | Height | Type |
|------|--------|------|
| sm | 32 | sm |
| md | 40 | base |
| lg | 48 | base/lg |

Icon + label gap 8px. Disabled: opacity 0.45 + `pointer-events: none`.

### 3.2 Inputs

- Label acima (sempre)  
- Height 40  
- Border `border`; focus ring `accent` 2px  
- Error: border danger + texto xs abaixo  
- Prefix/suffix para R$ e %  
- Textarea min-height 96  

Estados: default · hover · focus · error · disabled.

### 3.3 Select / Dropdown

Trigger = input height. Menu: elevated surface, shadow-md, radius-md, item height 36, check à direita. Keyboard: setas + enter + esc.

### 3.4 Checkbox / Radio / Switch

Accent color no checked. Switch para settings binários; checkbox para listas (cortes, IA).

### 3.5 Cards / Painéis

**Default: não usar card.**  
Permitido quando:

- KPI clicável no dashboard  
- Empty state container  
- Intent tile na IA  

Estilo: `canvas-elevated` + border sutil; **sem** sombra pesada; padding 6–8. Se remover borda não muda entendimento → não é card.

### 3.6 Modal / Dialog

Max-width 480 (confirm) / 640 (forms médios). Overlay 40% ink. Focus trap. Footer ações alinhadas à direita.

### 3.7 Drawer

Direita, 440px, full height. Header sticky + footer sticky. Mobile = sheet 92vh.

### 3.8 Tabelas

- Header: sm medium, tertiary, border-b  
- Row height ~48; hover muted canvas  
- Células money: alinhadas à direita, tabular  
- Bulk actions: bar aparece ao selecionar  
- Mobile: cada row → bloco stacked (label + value)

### 3.9 Badges

Radius sm (não pill). Variants: neutral, accent, success, warning, danger, outline.

Uso: status RSVP, task status, vendor pipeline, priority.

### 3.10 Toast

Bottom-right (mobile: bottom-center). Max 1–2 visíveis. Auto-dismiss 4s. Variants: default, success, danger.

### 3.11 Stepper (onboarding)

Dots ou barra fina + “Passo X de Y”. Step ativo = ink; done = accent; future = tertiary.

### 3.12 Tabs

Underline style (Linear) — não pills. Active: ink + border-b 2px. Usado em budget views, schedule views, settings.

### 3.13 Progress

- Linear thin (2–4px) para % planejamento  
- Storage quota bar  
- Não circular no MVP salvo avatar upload  

### 3.14 KPI

```text
[ label xs tertiary ]
[ value 2xl/3xl display or sans tabular ]
[ delta/helper sm ]
```

Máx. 4 no dashboard strip. Clicável → deep link quando fizer sentido.

### 3.15 Empty state

Ícone line (Lucide) stroke 1.5 · título · uma frase · **um** CTA. Sem ilustrações cartoon.

### 3.16 Upload

Dropzone border dashed; hover accent-subtle. Lista de arquivos com mime icon, size, remove.

### 3.17 Charts (Recharts)

| Série | Cor |
|-------|-----|
| 1 | ink |
| 2 | accent |
| 3 | info |
| 4 | success |
| grid | chart-grid |

Tooltip: elevated, sm text, sem borda grossa. Legenda abaixo. Sem 3D, sem gradients em barras.

### 3.18 Kanban

Colunas com header sticky; card mínimo (título, priority badge, due). Drag ghost opacity 0.8. Colunas: todo / doing / blocked / done.

### 3.19 Timeline / Gantt leve

Linhas horizontais; fase labels à esquerda; barra `accent-subtle` fill com border accent para milestones.

### 3.20 Calendário

Grid mensal; dia com event dots (max 3 + counter). Selected day = ink fill inverse.

### 3.21 Priority & stars

Priority: badge `P5`…`P1` com cor da escala.  
Emotional return: 5 glyphs star em accent (outline/fill) — acessível com `aria-label`.

### 3.22 Alert row

Barra lateral 3px (critical/warning/info) + título + CTA ghost “Resolver”.

### 3.23 Sidebar & Topbar

Sidebar: brand wordmark Syne sm; groups com label xs tracking-wide; active item = muted bg + ink.  
Topbar: métricas compactas separadas por hairline; icon buttons ghost.

### 3.24 Skeleton

Rectangles radius-sm em canvas-muted; shimmer suave opcional (desligar em reduced-motion).

---

## 4. Iconografia

- **Lucide** exclusively  
- Stroke 1.5 (UI) / 1.75 (hero empty)  
- Size: 16 (inline), 20 (buttons), 24 (empty)  
- Cor: currentColor  

---

## 5. Conteúdo & tom visual

| Tom | Exemplo |
|-----|---------|
| Orientador | “Próximo: confirmar pagamento do buffet” |
| Calmo | Evitar “URGENTE!!!” — usar severidade visual |
| Preciso | Sempre R$ com centavos em forms; arredondar em KPIs grandes |

Sem emojis na UI do produto.

---

## 6. Acessibilidade

| Regra | Detalhe |
|-------|---------|
| Contraste | Texto ink em canvas ≥ 4.5:1 |
| Focus | Ring visível accent em todos interativos |
| Hit target | ≥ 40px altura controles |
| Keyboard | Drawer, modal, menu, kanban basics |
| Labels | Todo input com `<label>` |
| Live regions | Toasts `aria-live=polite` |

---

## 7. Mapa shadcn → tokens

| shadcn | Token WP |
|--------|----------|
| `--background` | `--wp-canvas` |
| `--foreground` | `--wp-ink` |
| `--card` | `--wp-canvas-elevated` |
| `--primary` | `--wp-primary` |
| `--primary-foreground` | `--wp-primary-foreground` |
| `--secondary` | `--wp-canvas-muted` |
| `--accent` | `--wp-accent-subtle` |
| `--destructive` | `--wp-danger` |
| `--border` | `--wp-border` |
| `--ring` | `--wp-ring` |
| `--radius` | `--wp-radius-md` |

Componentes shadcn a instalar na Etapa 8: button, input, label, textarea, select, checkbox, switch, dialog, sheet, dropdown-menu, tabs, table, badge, toast/sonner, separator, tooltip, progress, skeleton, popover, calendar, command (opcional).

---

## 8. Motion checklist (produto)

Implementar no MVP:

1. Page transition fade-rise (Framer Motion)  
2. Drawer/sheet slide  
3. KPI number animate on data change  

Opcional depois: kanban layout animation.

---

## 9. Do / Don’t

| Do | Don’t |
|----|-------|
| Branco luminoso + bronze | Roxo gradient |
| Syne + Manrope | Inter everywhere |
| 1 CTA primary por header | 3 botões filled competindo |
| Tabela para orçamento | Cards financeiros decorativos |
| Full-bleed hero marketing | Hero em card arredondado inset |
| Badge radius sm | Pill status em tudo |

---

## 10. Entregáveis desta etapa

| Arquivo | Conteúdo |
|---------|----------|
| [`docs/07-DESIGN-SYSTEM.md`](./07-DESIGN-SYSTEM.md) | Este documento |
| [`styles/tokens.css`](../styles/tokens.css) | CSS variables |

---

## 11. Critérios de aceite — Design System

- [x] Direção visual distinta e anti-clichê documentada  
- [x] Cores, tipo, espaço, grid, radius, motion  
- [x] Componentes pedidos no PRD especificados  
- [x] Tokens CSS criados  
- [x] Mapa shadcn  
- [x] A11y basics  

---

## 12. Próxima etapa

**Etapa 8 — Componentes**

Implementar primitives (`components/ui`) + shared product (`KpiStat`, `PageHeader`, `Money`, `PriorityBadge`, `AlertRow`, `AppShell`) consumindo estes tokens.

**Não iniciaremos features de domínio / páginas completas até os componentes base serem revisados.**

---

### Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-08-06 | Design System inicial + tokens |
