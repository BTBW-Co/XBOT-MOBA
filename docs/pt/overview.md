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

`https://moba.xbotone.com` usa o canal padrão da plataforma (`MOBA_DEFAULT_CHANNEL_ID`). A homepage `https://xbotone.com` embute essa URL como demo ao vivo do Agent e também tem um campo de texto no hero (sem anexo nem voz). Enviar abre o MOBA em nova aba com `?fresh=1`; se o visitante digitou algo, a query `q` é enviada como primeira mensagem. O iframe pede `?fresh=1`: cada acesso ou refresh da homepage inicia uma sessão nova e, se o Agent tiver **Se apresentar** ligado, mostra a mensagem de apresentação de novo.

## Agent

A vinculação do Agent acontece depois, nas automações (pipeline do canal). Um tenant pode ter vários MOBAs (vários XChat), cada um com pipeline/agent distinto.

No MOBA padrão da plataforma, criar ou configurar um Agent no Workforce exige cadastro em `https://app.xbotone.com/signup` antes. O Agent da conversa não cria outros Agents nesta tela.

## Embed

Sites de terceiros continuam usando o embed XChat (`embed.js`). O MOBA hosted é a experiência em `moba.xbotone.com`.

Durante a conversa, recap, lista de escolhas e progresso da jornada podem aparecer como componentes (não na abertura vazia). Links da base de conhecimento aparecem como card na mesma coluna da resposta; o mesmo URL não é reenviado.

## Mobile

No celular, ao abrir o teclado virtual a conversa sobe com o viewport, o campo de texto fica próximo ao teclado e o «Powered by XBot» fica oculto. Depois de enviar, o foco permanece no mesmo input.

## Notificações do browser

Ao receber mensagem do bot, o MOBA toca o mesmo som do sino de `app.xbotone.com` e mostra notificação nativa do browser (se a permissão for concedida na primeira interação). O stream SSE permanece ativo com a aba em segundo plano para o alerta chegar fora da tela.

## Tela de carregamento

Enquanto o bootstrap resolve o canal, o MOBA mostra os mascotes sticker do Workforce (bb8, obiwan, threepio e r2d2): giram, piscam, olham para os lados e se revezam a cada volta.

## Tela de indisponibilidade

Se o Object ID for inválido, o canal não existir ou o bootstrap falhar (rede, 404, 5xx), o visitante vê uma tela de marca: mascote XBot animado, mensagem amigável (sem jargão técnico como `Failed to fetch`) e um CTA **Conhecer o xbot** para o site institucional (`https://xbotone.com`).
