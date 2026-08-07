# Supabase — conexão do projeto

**Status:** Banco migrado no projeto `xpkpysdoqquvbpnoxhmn` — Auth app ainda em modo demo local

---

## Status atual (2026-08-06)

| Item | Status |
|------|--------|
| Project URL + anon | ✅ `.env.local` |
| service_role | ✅ |
| DATABASE_URL / DIRECT_URL | ✅ |
| Prisma migrate `init_wedding_planner` | ✅ |
| RLS (`docs/sql/rls-policies.sql`) | ✅ |
| Storage policies | ✅ |
| Auth UI → Supabase Auth | ⏳ próximo |
| Trocar Zustand → Prisma | ⏳ próximo |

**Não commitar** `.env` / `.env.local`. Rotacione senha e `service_role` se foram expostas no chat.


Abra [Settings → API](https://supabase.com/dashboard/project/xpkpysdoqquvbpnoxhmn/settings/api) e copie:

1. **Project URL** (já preenchido no `.env.example`)
2. **anon / publishable** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Abra [Settings → Database](https://supabase.com/dashboard/project/xpkpysdoqquvbpnoxhmn/settings/database):

4. Connection string **Transaction** (pooler) → `DATABASE_URL`
5. Connection string **Session/Direct** → `DIRECT_URL`

Crie o arquivo:

```bash
cp .env.example .env.local
# edite .env.local com as chaves
```

---

## 2. Autenticar MCP no Cursor (para eu aplicar schema/RLS)

1. **Cursor Settings → Tools & MCP**
2. Encontre o servidor **Supabase** / `plugin-supabase-supabase`
3. Clique **Authenticate** / Connect e autorize no browser (org do projeto)
4. Reinicie o agent se as tools não aparecerem

O `.mcp.json` já aponta para este `project_ref`.

---

## 3. O que já está no código

| Arquivo | Função |
|---------|--------|
| `lib/supabase/client.ts` | Browser client |
| `lib/supabase/server.ts` | Server Components / Actions |
| `lib/supabase/middleware.ts` | Refresh de sessão |
| `middleware.ts` | Next middleware |
| `supabase/` | CLI init |
| `prisma/schema.prisma` | Schema a migrar |
| `docs/sql/*.sql` | RLS + Storage |

---

## 4. Próximo passo (depois das chaves + MCP auth)

1. `npx prisma migrate dev` (ou apply SQL via MCP)  
2. Aplicar `docs/sql/rls-policies.sql` + `storage-policies.sql`  
3. Trocar auth demo → Supabase Auth  
4. Persistência Prisma no lugar do Zustand  

---

## 5. Link CLI (opcional)

```bash
npx supabase login
npx supabase link --project-ref xpkpysdoqquvbpnoxhmn
```
