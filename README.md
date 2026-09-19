# XBot-MOBA

> Aproxime. Converse. Resolva.

Camada pública do ecossistema XBot que conecta o mundo físico ao **XChat**.

- Domínio: `https://moba.xbotone.com`
- Object ID = UUID do canal **XChat** do tenant
- Cada XChat criado é um MOBA
- Contexto do Object (produto, serviço, loja, totem…) vai para o Agent via XChat
- Agent/pipeline vincula-se nas automações

## Rotas

| Rota | Comportamento |
|------|----------------|
| `/` | MOBA padrão: continua a sessão do visitante (abertura uma vez) |
| `/?fresh=1` | Demo da homepage: sessão nova a cada load (apresentação, se ligada) |
| `/?fresh=1&q=` | Mesma sessão nova, com o texto do hero enviado como primeira mensagem |
| `/object-id/{uuid}` | Resolve o canal XChat, aplica contexto e abre o XChat |
| `/object-id/{uuid}?mode=totem` | Experiência totem (“Tap to talk to XBot”) |

## Experiência (vídeo)

```
OBJETO → APROXIMAR → XCHAT → AGENT → AÇÃO
```

- CTA: **APROXIME.** / **Tap to talk to XBot**
- Ícone: robô XBot (workforce), não pata
- Header do chat: logo Xbot institucional (mesmo do site) no canto superior direito
- Sem mencionar protocolos técnicos na UX pública
- Falha de bootstrap / rota inválida: tela de marca com mascote animado e CTA **Conhecer o xbot** → `https://xbotone.com`
- Loading do bootstrap: mascotes sticker do Workforce (bb8, obiwan, threepio, r2d2) girando, piscando e olhando para os lados
- A homepage `https://xbotone.com` apresenta a seção **Aproxime. Converse. Resolva.** (experiência física NFC/QR) e o CTA **Falar com o MOBA** abre o MOBA raiz em tela cheia. O campo do hero (texto apenas) também abre o MOBA na mesma aba com `?fresh=1` e, se houver prompt, `?q=`. Hero e CTA usam `?fresh=1` para sessão nova a cada abertura pela homepage (apresentação do Agent, se estiver ligada).

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

## API

```
GET /v1/public/moba/bootstrap?object_id={uuid}
GET /v1/public/moba/objects/{uuid}
```

Bootstrap inclui `moba_context`, `experience` e `context` para o widget.

## Painel

Configurações → Conexões → XChat → aba **MOBA**:
- link público
- tipo / formato / product_id / service_id / CTA

## Deploy

`npm run build` → `dist/`. Amplify + rewrite SPA `/*` → `/index.html`.
