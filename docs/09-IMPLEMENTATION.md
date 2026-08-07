# Wedding Planner — Implementação (Etapa 9)

**Versão:** 1.0  
**Status:** MVP demo funcional  
**Data:** 06 de agosto de 2026  

---

## 1. Como rodar

```bash
npm install
npm run dev
```

1. Abra http://localhost:3000  
2. **Entrar** → **Explorar com dados demo** (caminho mais rápido)  
   ou Signup → Onboarding  
3. Navegue pelos módulos em `/app/*`

Galeria de componentes: `/dev/components`

---

## 2. O que está implementado

| Área | Status |
|------|--------|
| Landing | ✅ |
| Auth demo (local) | ✅ |
| Onboarding + seed checklist/categorias | ✅ |
| App shell + navegação | ✅ |
| Dashboard + KPIs + alertas | ✅ |
| Orçamento CRUD + charts | ✅ |
| Sala de cortes | ✅ |
| Tarefas por fase | ✅ |
| Cronograma Kanban/Cal/Timeline | ✅ |
| Fornecedores | ✅ |
| Convidados | ✅ |
| Presentes | ✅ |
| Lua de mel | ✅ |
| Documentos (UI + stub upload) | ✅ |
| Decisões | ✅ |
| Analytics | ✅ |
| Alertas A1–A8 | ✅ |
| Assistente IA (5 intents, regras) | ✅ |
| Settings + export JSON | ✅ |
| Design System + components | ✅ |
| Prisma schema (docs) | ✅ modelado |
| Supabase Auth/Storage live | ⏳ próximo wiring |
| Postgres persistido | ⏳ (hoje: Zustand + localStorage) |

---

## 3. Arquitetura do MVP demo

```text
UI (app/(app)/app/*)
  → useWeddingStore (Zustand persist)
  → modules/budget/calculations
  → modules/alerts/rules
```

Persistência local: chave `wedding-planner-mvp` no `localStorage`.

Quando conectar Supabase:

1. Preencher `.env` (DATABASE_URL, Supabase keys)  
2. `npx prisma migrate dev`  
3. Trocar actions do store por Server Actions + Prisma  
4. Auth: `@supabase/ssr` no middleware  

Interfaces e schema já estão em `prisma/schema.prisma` e `docs/`.

---

## 4. Decisão de produto nesta etapa

Entregar um **MVP navegável e mensurável** imediatamente, sem bloquear em credenciais cloud. A camada de domínio (`modules/*`) e o schema Prisma permanecem a fonte da verdade para a troca de persistência.

---

## 5. Próximos passos técnicos

1. Conectar projeto Supabase + migrate  
2. Server Actions + RLS  
3. Storage signed uploads  
4. LLM provider nos intents (manter fallback de regras)  
5. Expandir template de checklist (~100 tarefas)  

---

### Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-08-06 | Implementação MVP demo completa |
