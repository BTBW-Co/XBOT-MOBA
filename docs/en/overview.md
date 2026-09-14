# XBot-MOBA

**Tap. Talk. Resolve.**

MOBA is XBot’s physical/contextual bridge. Every **XChat** channel created in the admin panel is a MOBA.

## Flow

```
NFC / QR / link
    → moba.xbotone.com/object-id/{uuid}
    → resolve Object ID (= XChat channel)
    → mount XChat
    → Agent (via pipeline/automations)
    → Tools / action
```

There is no separate chat engine — conversation is the official XChat widget.

Mid-conversation recap, numbered choices, and journey progress can appear as components (not on an empty greeting).

## Public URL

`https://moba.xbotone.com/object-id/{xchat-channel-uuid}`

In the admin: **Settings → Connections → XChat** → copy **Public MOBA link**.

## Root

`https://moba.xbotone.com` uses the platform default channel (`MOBA_DEFAULT_CHANNEL_ID`). The marketing homepage at `https://xbotone.com` embeds this URL as a live Agent demo and also has a hero text field (no attach or voice). Submitting opens MOBA in a new tab with `?fresh=1`; if the visitor typed a prompt, query `q` is sent as the first message. The iframe sends `?fresh=1`: each visit or refresh starts a new session and, if the Agent has **Introduce yourself** on, shows the presentation message again.

## Agent

Link the Agent later in automations (channel pipeline). A tenant can have many MOBAs (many XChat channels), each with a different pipeline/agent.

On the platform default MOBA, creating or configuring an Agent in Workforce requires sign up at `https://app.xbotone.com/signup` first. The conversation Agent does not create other Agents on that screen.

During the conversation, recap, choice lists, and journey progress can appear as components (not on an empty opening). Knowledge-base links render as a card in the same column as the reply; the same URL is not sent twice.

## Mobile

On phones, opening the virtual keyboard lifts the conversation with the visual viewport, keeps the text field close to the keyboard, and hides «Powered by XBot». After send, focus stays on the same input.

## Browser notifications

When the bot replies, MOBA plays the same sound as the notification bell on `app.xbotone.com` and shows a native browser notification (if permission is granted on first interaction). The SSE stream stays active while the tab is in the background so alerts can arrive off-screen.

## Loading screen

While bootstrap resolves the channel, MOBA shows the Workforce sticker mascots (bb8, obiwan, threepio, and r2d2): they spin, blink, look around, and take turns each revolution.

## Unavailable screen

If the Object ID is invalid, the channel does not exist, or bootstrap fails (network, 404, 5xx), visitors see a branded screen: animated XBot mascot, a friendly message (no raw errors such as `Failed to fetch`), and a **Conhecer o xbot** CTA to the institutional site (`https://xbotone.com`).
