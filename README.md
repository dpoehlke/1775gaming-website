# 1775 Gaming LLC — Official Website

Professional website for [1775 Gaming LLC](https://www.1775gaming.com), built with Next.js 14, Tailwind CSS, and deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom theme
- **Fonts**: Bebas Neue (headings) + IBM Plex Sans (body) via Google Fonts
- **Database**: Supabase (coming soon)
- **Email**: Resend (coming soon)
- **Analytics**: PostHog (coming soon)
- **Deployment**: Vercel
- **Domain**: Squarespace Domains → Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in your values in `.env.local`
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  components/
    Navbar.tsx       # Sticky nav with mobile hamburger
    Footer.tsx       # Footer with social links
  about/             # About page
  beta/              # Beta sign-up page
  blog/              # Blog page
  games/             # Games showcase page
  privacy/           # Privacy policy
  terms/             # Terms of service
  layout.tsx         # Root layout (fonts, nav, footer)
  page.tsx           # Homepage hero
public/
  images/            # Logo + game artwork (PNG)
```

## Logo & artwork

Logo and game artwork live in `public/images/`. Active files:

- `Logo_no_ega.png` — primary company logo (used in Navbar, Footer, and Schema.org structured data)
- `Omniverse-Logo.png` — Omniverse: Ascension wordmark (used on /games OG image and hero)
- `Omniverse-Badge.png` — Omniverse: Ascension badge (used on homepage feature section and /games)

Filenames are case-sensitive on Vercel (Linux). If you replace a file, keep the exact same casing or update the reference in the code.

If the logo image fails to load, the Navbar and Footer fall back to a text-only "1775 GAMING" wordmark.

## Environment Variables

See `.env.local.example` for all required variables.

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.
