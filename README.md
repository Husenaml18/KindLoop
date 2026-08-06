# Kindloop

Nine handcrafted gift experiences — a sealed letter, an advent calendar, a jigsaw
you have to solve, a treasure map — each one its own object, assembled from a
shared set of engines. You make one, and it becomes a private link somebody opens
in any browser without an account.

```bash
npm install
npx prisma migrate dev      # creates prisma/dev.db
npm run dev                 # http://localhost:3000
```

Nothing external is required to run the whole product. Sign-in, uploads, payment
and email all have working local paths, and each switches to the real service the
moment its key is set — no code changes.

---

## Configuration

Everything lives in **`.env`** at the repo root (`.env.example` is the template).
Prisma reads `.env`, not `.env.local`, so keep them in the one file.

| Variable | Needed? | Without it |
|---|---|---|
| `DATABASE_URL` | yes | — (ships as `file:./dev.db`) |
| `AUTH_SECRET` | yes | generate with `npx auth secret` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | no | falls back to Resend, then to the terminal |
| `AUTH_RESEND_KEY` | no | sign-in links print to the terminal |
| `AUTH_EMAIL_FROM` | no | falls back to Resend's test sender |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no | "Continue with Google" is hidden; a dev-only mock sign-in appears |
| `STRIPE_SECRET_KEY` | no | paid templates use the in-app mock checkout |
| `STRIPE_WEBHOOK_SECRET` | only with Stripe | — |
| `NEXT_PUBLIC_APP_URL` | recommended | falls back to the request origin |

### Sending sign-in emails

Signing in is passwordless: you enter an address, we send a link, opening it signs
you in. That link has to reach an inbox. There are two ways to make that happen,
and everything for both goes in **`.env`** — restart `npm run dev` after editing it.

#### Option A — SMTP (any mailbox you already own)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@yourdomain.com
SMTP_PASSWORD=your-app-password
AUTH_EMAIL_FROM="Kindloop <you@yourdomain.com>"
```

| Provider | Host | Port |
|---|---|---|
| Gmail / Google Workspace | `smtp.gmail.com` | 587 |
| Zoho | `smtp.zoho.com` | 465 |
| Fastmail | `smtp.fastmail.com` | 465 |
| Mailgun | `smtp.mailgun.org` | 587 |
| Brevo | `smtp-relay.brevo.com` | 587 |
| Outlook / Microsoft 365 | `smtp.office365.com` | 587 |

Port 465 means implicit TLS and 587 means STARTTLS; that is worked out from the
port, so `SMTP_SECURE` only needs setting if your host is unusual.

**Gmail specifically**: `SMTP_PASSWORD` must be an
[App Password](https://myaccount.google.com/apppasswords), not your account
password, and App Passwords require 2-Step Verification to be on. Your normal
password will be rejected.

To check the settings without attempting a sign-in, `verifyMailer()` in
`src/lib/mail.ts` opens a connection and authenticates, returning the error
rather than throwing it.

#### Option B — Resend (no SMTP settings to get right)

1. Create an account at **[resend.com](https://resend.com)** — the free tier covers
   development comfortably.
2. **API Keys → Create API Key**, and copy it.
3. Put it in `.env`:

   ```bash
   AUTH_RESEND_KEY=re_xxxxxxxxxxxx
   AUTH_EMAIL_FROM="Kindloop <hello@yourdomain.com>"
   ```

**About the sender.** Until you verify a domain, Resend only lets you send from
`onboarding@resend.dev` **to the address you signed up with** — enough to test, and
the default if you leave `AUTH_EMAIL_FROM` unset. To email anyone else, add your
domain under **Domains**, publish the DNS records it gives you, then point
`AUTH_EMAIL_FROM` at an address on that domain.

If both are configured, SMTP wins.

**Without a key**, links print to the terminal running `npm run dev`:

```
  ┌─ Kindloop sign-in link ──────────────────────────────────
  │  to      you@example.com
  │  expires in 15 min
  │
  │  http://localhost:3000/api/auth/callback/email?token=…
  └──────────────────────────────────────────────────────────
```

Paste it into a browser and you're signed in. A **production** build refuses that
fallback outright — it throws rather than logging a working credential or
pretending to have sent an email.

All of this is one file: **`src/lib/mail.ts`** — the transport choice, the HTML,
and the terminal fallback. Adding Postmark or SES means one more branch in
`deliverMagicLink`.

### Signing in with Google

Create an OAuth client at
[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
with this authorised redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. The button appears on its own, and
the dev-only mock sign-in disappears — that provider is double-gated on
`NODE_ENV !== "production"` **and** the absence of Google credentials, so it cannot
exist in a production build whatever `.env` contains.

---

## Looking at the data

There is **no admin panel in the app**, deliberately — nothing in the product
should be able to read somebody else's letters. To inspect the database, use
Prisma's own browser:

```bash
npx prisma studio          # http://localhost:5555
```

Every table, every row, editable. Run it locally only: it has no authentication and
must never be exposed publicly.

```bash
npx prisma migrate dev --name what_changed   # change the schema
npx prisma migrate reset                     # wipe and rebuild (destroys data)
npx prisma generate                          # regenerate the client
```

### The schema

Six models, in **`prisma/schema.prisma`**. The first four are the contract Auth.js's
Prisma adapter requires; the last two are ours.

| Model | What it holds |
|---|---|
| **User** | `id`, `name`, `email` (unique), `emailVerified`, `image`, `isDevMock` |
| **Account** | An OAuth link — one row per provider per user. None for email sign-in |
| **Session** | Unused: sessions are JWTs, so nothing is written here |
| **VerificationToken** | Live sign-in links. Hashed, single-use, 15-minute expiry |
| **Gift** | `slug` (the public link), `template`, `content` (JSON), `isPaid`, `unlocked`, `ownerId` |
| **Order** | One per checkout attempt: `provider` (`stripe`/`mock`), `status`, `amountCents` |

Deleting a `User` cascades through accounts, sessions, gifts and orders. It does
**not** cascade to disk, so `deleteAccount` in `src/app/account/actions.ts` removes
the uploaded files explicitly first.

`Gift.content` is opaque TEXT holding JSON, parsed against that template's own Zod
schema at every read and write — so a malformed gift fails loudly rather than
half-rendering.

---

## Where things are

```
src/
  app/
    page.tsx                 the landing page
    templates/               the gallery
    demo/[template]/         public walkthroughs, no sign-in
    create/[template]/       the editor
    g/[slug]/                what the recipient opens — public
    sign-in/                 sign in, check-your-email, problem
    account/                 rename, sign-in method, delete everything
    dashboard/               your gifts
    api/upload/              uploads (a route, not a Server Action — see below)
  lib/
    engines/                 the shared craft — see engines/README.md
    templates/<id>/          one folder per experience
    auth.ts  session.ts  mail.ts  uploads.ts  clientUpload.ts
  proxy.ts                   route protection (Next 16's rename of middleware)
uploads/                     uploaded media, gitignored, served via /api/media
```

Two things worth knowing before changing them:

**Uploads go through `/api/upload`, not a Server Action.** Server Actions cap
request bodies at 1 MB, which any photo off a phone exceeds, and it fails as an
unhandled rejection. Images are also downscaled in the browser first
(`src/lib/clientUpload.ts`).

**Anything a Zod schema reads must not live in a `"use client"` module.** Schemas
are evaluated on the server, where a client module's exports are reference proxies
rather than real values — which silently produced enums with no options. That is why
the gift engine's data sits in `engines/gift/stock.ts`, separate from its components.

---

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```
