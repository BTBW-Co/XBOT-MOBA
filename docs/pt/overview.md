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

Durante a conversa, recap, lista de escolhas e progresso da jornada podem aparecer como componentes (não na abertura vazia).

## Mobile

No celular, ao abrir o teclado virtual a conversa sobe com o viewport, o campo de texto fica próximo ao teclado e o «Powered by XBot» fica oculto. Depois de enviar, o foco permanece no mesmo input.

## Notificações do browser

Ao receber mensagem do bot, o MOBA toca o mesmo som do sino de `app.xbotone.com` e mostra notificação nativa do browser (se a permissão for concedida na primeira interação). O stream SSE permanece ativo com a aba em segundo plano para o alerta chegar fora da tela.
