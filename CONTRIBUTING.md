# Contributing to Elpino Web

Thanks for helping improve Elpino. This repository is the Next.js app: the marketing site, docs, dashboard and
the embeddable chat widget. It is released under the [MIT License](LICENSE), and by opening a pull request you
agree that your contribution is licensed the same way.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md). For anything security-related, see
[SECURITY.md](SECURITY.md) and **do not** open a public issue.

## Ground rules

- **Never commit secrets.** No `.env` files, API keys, tokens or customer data. `.env*` is gitignored on purpose,
  and only `.env.example` is tracked.
- **No customer data** in fixtures, screenshots or logs.
- **Brand assets are not open.** See [TRADEMARKS.md](TRADEMARKS.md) before adding or reusing logos or the mascot.
- **The backend is separate.** The API, gateway and database are not in this repository. This app talks to them
  over HTTPS and a WebSocket, so some features cannot be run end to end without the hosted backend.

## Setup

You need Node.js 22.

```bash
npm install
cp .env.example .env.local   # fill in your own values
npm run dev
```

See the [README](README.md) for what each variable does.

## What to expect from us

- **We reply to every pull request and issue within 48 hours** (business days). A reply may be a review, a question or a
  "not now, and here is why". If you have heard nothing after 48 hours, comment on the pull request and we will look.
- **Small, focused pull requests get merged fastest.** Large or unrelated changes are slower to review, and may be
  asked to be split.
- **Not every pull request is accepted.** If a change does not fit the project we will say so plainly and explain why.
- **The backend is closed on purpose.** This repository is the website, dashboard UI and widget. The AI agent and
  backend services are proprietary. See the [README](README.md#what-is-and-is-not-open) for what is and is not open.
- **Questions are welcome** in [Discussions](https://github.com/elpino-chat/elpino_web/discussions). Please do not use
  issues for general questions.

## Workflow

1. **Branch from `main`** with a short name: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. **Keep changes focused.** One concern per pull request, and no unrelated reformatting.
3. **Run the checks** before you push:
   ```bash
   npx tsc --noEmit && npm run lint && npm run build
   ```
4. **Open a pull request** into `main` describing what changed and why, how you tested it, and any new
   environment variables.
5. **Address review feedback,** then a maintainer merges.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary in the imperative`.
Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`.

## Code style

- TypeScript throughout; follow the style of the file you are editing.
- Comments explain **why**, not what.
- Keep security-sensitive behavior fail-closed: an unconfigured check should refuse, not allow.
- Server routes read secrets only from environment variables, never from source.

## Good first contributions

Typo and copy fixes, accessibility improvements, docs pages, translations, and small UI polish are all welcome.
