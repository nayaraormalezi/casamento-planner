# Como usar na Vercel

1. Abra o arquivo `.env.vercel` nesta pasta.
2. Na Vercel: **Settings → Environment Variables**.
3. Para cada linha `CHAVE=valor`, clique em **Add New**:
   - Key = a parte antes do `=`
   - Value = a parte depois do `=`
   - Environment: marque **Production** (e Preview, se quiser)
4. Em **Deployments**, faça **Redeploy**.

Não suba este arquivo no GitHub — ele contém segredos.

## Documentos (Supabase Storage)

No SQL Editor do Supabase, rode `docs/sql/storage-policies.sql` para criar o bucket
`wedding-documents` (privado, 10 MB). Sem isso, o upload de documentos falha.

Defina `NEXT_PUBLIC_APP_URL` com a URL de produção (ex.: `https://casamento-planner-rho.vercel.app`)
para que os links de convite saiam corretos.
