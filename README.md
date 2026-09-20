# Chore Wheel

A household chore tracker: assigns chores fairly each week, rotates them so
nobody gets stuck with the same one back-to-back, and routes completions
through admin approval.

## Stack

- Next.js 14+ (App Router), TypeScript
- Neon (serverless Postgres) + Drizzle ORM
- Auth.js (NextAuth v5) with the Resend email provider — magic-link sign-in,
  no passwords
- Tailwind CSS
- Live updates via polling (`router.refresh()` every 7s on `/board`, `/mine`,
  `/admin` — see [`src/components/PollingRefresher.tsx`](src/components/PollingRefresher.tsx))

## Setup

1. Create a [Neon](https://neon.tech) project and copy its connection string.
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`.
3. Install dependencies and run the migration:

   ```bash
   npm install
   npm run db:migrate
   ```

4. Seed a dev household (creates 2 admins, 2 members, 4 chores) and copy the
   printed admin member id into `DEV_MEMBER_ID` in `.env.local` so you can use
   the app without setting up email sign-in yet:

   ```bash
   npm run seed
   ```

5. `npm run dev` and open http://localhost:3000.

### Turning on real sign-in

Set `RESEND_API_KEY`, `EMAIL_FROM`, and `AUTH_SECRET` (any random string —
`npx auth secret` will generate one) in `.env.local`, then unset
`DEV_MEMBER_ID`. New members you add in `/admin` show up as unclaimed names
on `/onboarding` for whoever signs in next.

## Scripts

- `npm run dev` / `build` / `start` — Next.js
- `npm test` — unit tests (`pickAssignments`, the core rotation algorithm)
- `npm run db:generate` — generate a Drizzle migration from `src/db/schema.ts`
- `npm run db:migrate` — apply migrations to `DATABASE_URL`
- `npm run db:studio` — Drizzle Studio
- `npm run seed` — seed a dev household

## Notes

- The chore-rotation algorithm is a pure function,
  [`pickAssignments`](src/lib/chores/pickAssignments.ts), covered by
  [tests](src/lib/chores/pickAssignments.test.ts) for the 1-member,
  chores>members, members>chores, and roster-reset cases.
- This deployment assumes a single household (confirmed with the product
  owner) — see [`src/lib/household.ts`](src/lib/household.ts).
- WhatsApp notifications on assignment are stubbed at
  [`notifyAssignment`](src/lib/notify.ts) for phase 2.
