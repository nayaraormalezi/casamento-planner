# Wedding Planner — Componentes (Etapa 8)

**Versão:** 1.0  
**Status:** Aprovado — implementação em andamento  
**Data:** 06 de agosto de 2026  
**Galeria:** [`/dev/components`](../app/dev/components/page.tsx)  

---

## 1. O que foi entregue

Scaffold Next.js 15 + TypeScript + Tailwind 4 + Framer Motion + Radix/shadcn-style primitives, tokens do Design System e componentes de produto.

### Como ver

```bash
npm install
npm run dev
```

Abra [http://localhost:3000/dev/components](http://localhost:3000/dev/components).

---

## 2. Primitives (`components/ui`)

| Componente | Arquivo |
|------------|---------|
| Button | `button.tsx` |
| Input | `input.tsx` |
| Textarea | `textarea.tsx` |
| Label | `label.tsx` |
| Checkbox | `checkbox.tsx` |
| Switch | `switch.tsx` |
| Badge | `badge.tsx` |
| Progress | `progress.tsx` |
| Separator | `separator.tsx` |
| Skeleton | `skeleton.tsx` |
| Tabs | `tabs.tsx` |
| Dialog | `dialog.tsx` |
| Sheet (drawer) | `sheet.tsx` |
| Select | `select.tsx` |
| DropdownMenu | `dropdown-menu.tsx` |
| Table | `table.tsx` |
| Tooltip | `tooltip.tsx` |
| Toaster (Sonner) | `sonner.tsx` |

---

## 3. Shared product (`components/shared`)

| Componente | Uso |
|------------|-----|
| `PageHeader` | Título + próximo passo + actions |
| `KpiStat` | KPI com motion |
| `Money` | Centavos → BRL tabular |
| `PriorityBadge` | P1–P5 |
| `EmotionalReturn` | Estrelas 1–5 |
| `AlertRow` | Alerta com severidade + CTA |
| `EmptyState` | Empty + 1 CTA |
| `Stepper` | Onboarding |
| `UploadDropzone` | Upload UI |
| `StatusBadge` | Status de domínio |

---

## 4. Layout (`components/layout`)

| Componente | Uso |
|------------|-----|
| `AppShell` | Sidebar desktop, topbar, bottom nav mobile |

---

## 5. Tokens & tema

- `styles/tokens.css` — CSS variables  
- `app/globals.css` — Tailwind `@theme` mapping + atmosphere  
- Fonts: Syne / Manrope / IBM Plex Mono via `next/font`

---

## 6. Fora desta etapa (Etapa 9)

- Auth Supabase, Prisma client runtime  
- Páginas de módulos com dados reais  
- Charts Recharts nos módulos  
- Kanban/Calendar/Timeline interativos  
- React Hook Form + Zod forms de domínio  
- TanStack Query providers  

---

## 7. Critérios de aceite

- [x] Next app sobe com tokens do DS  
- [x] Primitives do PRD cobertos  
- [x] Shared product + AppShell  
- [x] Galeria `/dev/components`  
- [x] Sem features de domínio completas  

---

## 8. Próxima etapa

**Etapa 9 — Implementação** dos módulos (auth, onboarding, dashboard, CRUD, IA stub, etc.).

---

### Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-08-06 | Biblioteca de componentes + galeria |
