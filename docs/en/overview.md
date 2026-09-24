# XBot-MOBA

**Tap. Talk. Resolve.**

MOBA is XBot’s physical/contextual bridge. Every **XChat** channel created in the admin panel is a MOBA.

## Flow

```
NFC / QR / link
    → moba.xbotone.com/{public_code}          (canonical)
    → moba.xbotone.com/object-id/{uuid}       (legacy, always valid)
    → resolve Object ID (= XChat channel)
    → mount XChat
    → Agent (via pipeline/automations)
    → Tools / action
```

There is no separate chat engine — conversation is the official XChat widget.

Mid-conversation recap, numbered choices, and journey progress can appear as components (not on an empty greeting).

## Public URL

Canonical (short): `https://moba.xbotone.com/{public_code}` (e.g. `https://moba.xbotone.com/K7X9QM2`)

Legacy: `https://moba.xbotone.com/object-id/{xchat-channel-uuid}` — existing NFC/QR tags keep working.

In the admin: **Settings → Connections → XChat** → copy **Public MOBA link** (NFC/QR).

For WhatsApp / social, copy **Link for WhatsApp / social** (`https://moba.xbotone.com/share/{public_code}`): the preview shows name and logo; tapping opens the same MOBA.

When the visitor opens chat, the session stores approximate location (city/country from IP), device, and page — no permission prompt. Operators see this in Chat by clicking the conversation name. The WhatsApp preview does not store that data.

## Root

`https://moba.xbotone.com` uses the platform default channel (`MOBA_DEFAULT_CHANNEL_ID`). The marketing homepage at `https://xbotone.com` presents the **Tap. Talk. Resolve.** section (physical NFC/QR experience) and the CTA opens this URL full screen. It also has a hero text field (no attach or voice). Submitting opens MOBA in the same tab with `?fresh=1`; if the visitor typed a prompt, query `q` is sent as the first message. Hero and CTA send `?fresh=1`: each opening from the homepage starts a new session and, if the Agent has **Introduce yourself** on, shows the presentation message again. Full-screen MOBA (NFC/QR or a direct link) sends the opening once per session: reloading the same conversation does not repeat it.

## Agent

Link the Agent later in automations (channel pipeline). A tenant can have many MOBAs (many XChat channels), each with a different pipeline/agent.

On the platform default MOBA, creating or configuring an Agent in Workforce requires sign up at `https://app.xbotone.com/signup` first. The conversation Agent does not create other Agents on that screen.

During the conversation, recap, choice lists, and journey progress can appear as components (not on an empty opening). Knowledge-base links render as a card in the same column as the reply; the same URL is not sent twice.

## Mobile

On phones, opening the virtual keyboard lifts the conversation with the visual viewport, keeps the text field close to the keyboard, and hides «Powered by XBot». After send, focus stays on the same input.

## Browser notifications

When the bot replies, MOBA plays the same sound as the notification bell on `app.xbotone.com` and shows a native browser notification (if permission is granted on first interaction). The SSE stream stays active while the tab is in the background so alerts can arrive off-screen.

## Loading screen

While bootstrap resolves the channel, MOBA shows the same loader as the operator Chat: Workforce avatars (bb8, obiwan, threepio, and r2d2) stacked in overlapping circles, entering in sequence with a light float.

## Unavailable screen

If the Object ID is invalid, the channel does not exist, or bootstrap fails (network, 404, 5xx), visitors see a branded screen: animated XBot mascot, a friendly message (no raw errors such as `Failed to fetch`), and a **Conhecer o xbot** CTA to the institutional site (`https://xbotone.com`).
