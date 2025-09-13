# MySaaS – Next.js 14 SaaS Starter

Production-ready starter built with:
- Next.js 14 (App Router) + TypeScript
- TailwindCSS (Dark mode)
- NextAuth (Credentials + Google)
- Prisma + PostgreSQL
- Reusable UI components and a protected dashboard

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Configure environment variables
- Copy `.env.example` to `.env` and fill values (DATABASE_URL, NEXTAUTH_SECRET, Google OAuth, etc.)

3) Setup database
```bash
npx prisma migrate dev --name init
```

4) Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

## Project Structure

```
src/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx                # Landing Page
 │   ├─ dashboard/page.tsx      # Protected Dashboard
 │   ├─ login/page.tsx          # Login Page
 │   ├─ signup/page.tsx         # Signup Page
 │   └─ api/
 │       ├─ auth/[...nextauth]/route.ts
 │       └─ users/route.ts
 ├─ components/
 │   ├─ ui/
 │   │   ├─ Button.tsx
 │   │   ├─ Input.tsx
 │   │   └─ Card.tsx
 │   ├─ Navbar.tsx
 │   ├─ Footer.tsx
 │   ├─ Providers.tsx
 │   └─ DashboardSidebar.tsx
 ├─ lib/
 │   ├─ prisma.ts
 │   └─ auth.ts
 └─ styles/
     └─ globals.css
```

## Extending

- Payments/Subscriptions: Add Stripe and webhooks; create `/api/billing/*` endpoints; add billing page in dashboard.
- Teams/Org: Add Team model, membership join table; secure pages with middleware and RBAC.
- Emails: Add Resend/Sendgrid and verification/password reset flows (NextAuth’s email provider or custom).
- Analytics: Replace placeholder cards with charts (e.g. `recharts` or `@tanstack/react-table` for tables).

Notes:
- All protected routes are guarded by NextAuth middleware (see `src/middleware.ts`).
- Reusable UI lives under `src/components/ui`.
- Update SEO/OG tags in `src/app/layout.tsx`.
