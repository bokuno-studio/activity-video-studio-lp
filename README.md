# ActivityVideoStudio — Landing Page

Marketing landing page for **ActivityVideoStudio** (macOS app).
Static `index.html` + a serverless contact form (`/api/contact`).

The contact form posts to `/api/contact`, which forwards the message by email
via Resend. The destination address is stored only in the `CONTACT_TO`
environment variable and is never exposed to the browser.

## Stack
- Static HTML/CSS (no framework)
- Vercel serverless function for the contact form
- Email delivery: Resend

## Environment variables (set in Vercel)
| Name | Purpose |
|------|---------|
| `RESEND_API_KEY` | Resend API key (server-side only) |
| `CONTACT_TO` | Address that receives form submissions |
| `CONTACT_FROM` | Sender (optional; defaults to `onboarding@resend.dev`) |

## Deploy
Deployed to Vercel via `VERCEL_TOKEN` (no native Git integration).
Production deploys run from GitHub Actions on push to `main`
(see `.github/workflows/deploy.yml`).

Local/manual deploy:
```bash
npx vercel deploy --prod --token "$VERCEL_TOKEN"
```
