# XBot-MOBA

> Aproxime. Converse. Resolva.

Camada pública do ecossistema XBot que conecta o mundo físico (NFC, QR, links) ao **XChat**.

- Domínio: `https://moba.xbotone.com`
- Object ID = UUID do canal **XChat** do tenant
- Cada XChat criado é um MOBA
- Agent/pipeline vincula-se depois nas automações (Conexões → pipeline)

## Rotas

| Rota | Comportamento |
|------|----------------|
| `/` | MOBA padrão da plataforma (`MOBA_DEFAULT_CHANNEL_ID` na API) |
| `/object-id/{uuid}` | Resolve o canal XChat e abre o XChat |

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

Variáveis:

- `VITE_API_BASE_URL` — API XBot (ex.: `http://localhost:5001` ou `https://api.xbotone.com`)
- `VITE_XCHAT_SCRIPT_URL` — opcional; default `https://xbotone.com/xchat/xbot.min.js`

## API

```
GET /v1/public/moba/bootstrap?object_id={uuid}
GET /v1/public/moba/objects/{uuid}
```

Resposta inclui `channel_id`, token legado do canal e URLs do widget. O app só monta o XChat — sem motor de chat próprio.

## Link público (painel)

Nas configurações do canal XChat (app.xbotone.com):

`https://moba.xbotone.com/object-id/{channel-uuid}`

## Deploy

Build estático (`npm run build` → `dist/`). Amplify/CloudFront com SPA fallback para `index.html`.

## Princípio

Não duplicar XChat, Agents, Tools ou sessão. MOBA resolve contexto e encaminha.
