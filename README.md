# elpino_web

Next.js frontend for Elpino — the marketing site, the signed-in dashboard, and
the embeddable chat widget that customers drop onto their own sites.

## Layout

| Path | What lives there |
| --- | --- |
| `app/` | App Router pages — marketing, `dashboard/`, `onboarding/` |
| `app/widget/` | The chat panel served inside the customer-site iframe |
| `app/tag.js/route.ts` | The loader script customers embed; mounts the launcher and the iframe |
| `app/api/` | Route handlers that proxy to the backend gateway |
| `components/`, `lib/` | Shared UI and helpers |

## Running locally

```bash
npm install
npm run dev
```

Configuration comes from `.env.local`, which is git-ignored. The one variable
that matters most is the backend origin:

```
NEXT_PUBLIC_GATEWAY_URL=https://api.elpino.chat
```

`tag.js` derives both its HTTP origin and its WebSocket origin from that value,
so pointing it at an `http://` URL will get the widget blocked as mixed content
on any customer site served over HTTPS.

## Backend

The API, realtime gateway, and database live in a separate repository. This app
talks to them over HTTPS and a WebSocket at `/rt/visitor`.
