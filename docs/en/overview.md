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

## Public URL

`https://moba.xbotone.com/object-id/{xchat-channel-uuid}`

In the admin: **Settings → Connections → XChat** → copy **Public MOBA link**.

## Root

`https://moba.xbotone.com` uses the platform default channel (`MOBA_DEFAULT_CHANNEL_ID`).

## Agent

Link the Agent later in automations (channel pipeline). A tenant can have many MOBAs (many XChat channels), each with a different pipeline/agent.
