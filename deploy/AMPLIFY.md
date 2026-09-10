# Amplify — XBot-MOBA (`moba.xbotone.com`)

## App

| Item | Valor |
|------|--------|
| App ID | `d2mj5fbotgc8x1` |
| Repo | `BTBW-Co/XBOT-MOBA` |
| Preview | `https://d2mj5fbotgc8x1.amplifyapp.com` |
| Domínio | `https://moba.xbotone.com` |
| Env | `VITE_API_BASE_URL=https://api.xbotone.com` |
| SPA rewrite | `/<*>` → `/index.html` (`404-200`) |

> Nota: deploy keys estão desabilitadas na org para este repo. O Amplify **não** está conectado via Git; o CI usa deploy manual (zip) via GitHub Actions.

## Deploy automático (push em `main`)

Workflow: `.github/workflows/deploy-amplify.yml`

Secrets no repo:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AMPLIFY_APP_ID` (`d2mj5fbotgc8x1`)

## Deploy manual local

```bash
export AWS_PROFILE=btbw AWS_REGION=us-east-1
./deploy/amplify-manual-deploy.sh
```

## CORS

Inclua `https://moba.xbotone.com` e `https://d2mj5fbotgc8x1.amplifyapp.com` em `CORS_ALLOWED_ORIGINS` da API.
