# XBot-MOBA

**Aproxime. Converse. Resolva.**

O MOBA é a ponte física/contextual do XBot. Cada canal **XChat** criado no painel é um MOBA.

## Conceito

```
NFC / QR / link
    → moba.xbotone.com/object-id/{uuid}
    → resolve Object ID (= canal XChat)
    → monta XChat
    → Agent (via pipeline/automações)
    → Tools / ação
```

Não existe chat paralelo: a conversa é o XChat oficial.

## URL pública

`https://moba.xbotone.com/object-id/{uuid-do-canal-xchat}`

No painel: **Configurações → Conexões → XChat** → copiar **Link público MOBA**.

## Raiz

`https://moba.xbotone.com` usa o canal padrão da plataforma (`MOBA_DEFAULT_CHANNEL_ID`).

## Agent

A vinculação do Agent acontece depois, nas automações (pipeline do canal). Um tenant pode ter vários MOBAs (vários XChat), cada um com pipeline/agent distinto.

## Embed

Sites de terceiros continuam usando o embed XChat (`embed.js`). O MOBA hosted é a experiência em `moba.xbotone.com`.
