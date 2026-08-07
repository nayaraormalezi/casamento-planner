# Como usar na Vercel

1. Abra o arquivo `.env.vercel` nesta pasta.
2. Na Vercel: **Settings → Environment Variables**.
3. Para cada linha `CHAVE=valor`, clique em **Add New**:
   - Key = a parte antes do `=`
   - Value = a parte depois do `=`
   - Environment: marque **Production** (e Preview, se quiser)
4. Em **Deployments**, faça **Redeploy**.

Não suba este arquivo no GitHub — ele contém segredos.
