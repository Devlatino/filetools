This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### IndexNow (notify search engines after deploy)

After each deploy, notify Bing, Yandex and other IndexNow-compatible engines by pinging the IndexNow API with all site URLs.

- **Automatic (recommended):** Use the GitHub Action in `.github/workflows/indexnow.yml`: it runs after push to `main`, waits for Vercel deploy, then calls `GET https://fileflip.org/api/indexnow` with header `x-indexnow-secret`. Add `INDEXNOW_SECRET` in **Repository → Settings → Secrets and variables → Actions** (same value as in Vercel env).
- **Vercel Deploy Hook:** In Vercel Dashboard → Settings → Git → Deploy Hooks, create a hook. After each deploy you can call your API (e.g. from a cron or the hook’s “Notify” URL) with `x-indexnow-secret` to trigger the same logic.
- **Manual:** Run `npm run indexnow` (reads `INDEXNOW_SECRET` from `.env.local` and calls the production API).
