# Elpino Web

> **Open source (MIT).** The frontend, docs and chat widget of [Elpino](https://elpino.chat), the AI support
> agent that learns your website and runs customer support on autopilot.

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

## What is and is not open

This repository is open source under the [MIT License](LICENSE): the website, docs, dashboard UI, chat widget
and `tag.js` loader. It does **not** include the backend (the API, the gateway, the AI agent and the database),
which is a separate, private repository. So the dashboard and widget need a running Elpino backend to be fully
functional, either the hosted one or your own.

The Elpino name, logos and mascot are trademarks and are not covered by the MIT license. See
[TRADEMARKS.md](TRADEMARKS.md).

## Configuration

Copy `.env.example` to `.env.local`. Only the variables at the top are needed to run the app. Everything under the
**Optional** heading can stay empty, and the feature that uses it is turned off.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md) first. To report a security problem, follow [SECURITY.md](SECURITY.md)
and do not open a public issue.

## License

[MIT](LICENSE) (c) 2026 Elpino. Brand assets excluded, see [TRADEMARKS.md](TRADEMARKS.md).
