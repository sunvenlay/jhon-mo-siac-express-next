# Jhon Mo S.I.A.C

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database & Prisma

This project now ships with Prisma 7 configured for the PostgreSQL database referenced in `.env` (`DATABASE_URL`). Helpful scripts:

- `npm run prisma:generate` – regenerate the Prisma Client after editing `prisma/schema.prisma`.
- `npm run prisma:migrate` – create a new migration and push it to the Neon database.
- `npm run prisma:db-push` – sync the schema without generating a migration (useful for prototypes).
- `npm run prisma:studio` – open Prisma Studio for quick data inspection.

There is a ready-to-use `User` ↔ `Post` schema plus a singleton Prisma client helper in `lib/prisma.ts`. Update the models as needed, then run one of the scripts above to sync the database. Remember to keep `.env` private.

## Learn More

To learn more about Next.js or Prisma, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) – learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) – an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) – learn how to model your data and use Prisma Client effectively.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
