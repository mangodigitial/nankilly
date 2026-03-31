# Nankilly - Cornish Inspired Textiles

Handmade gifts, accessories and homeware by Emily at Nankilly Farm, Cornwall.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React
- **Database**: PostgreSQL on Neon (via Prisma)
- **Payments**: Square
- **Email**: Resend
- **Images**: Vercel Blob
- **Hosting**: Vercel

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd nankilly
npm install
```

### 2. Set up Neon database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 3. Set up Square

1. Create a Square developer account at [developer.squareup.com](https://developer.squareup.com)
2. Create an application
3. Get your sandbox access token and location ID
4. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhook`
5. Subscribe to `payment.completed` events

### 4. Set up Resend

1. Create a free account at [resend.com](https://resend.com)
2. Get your API key
3. (Optional) Add and verify your domain for custom sender address

### 5. Configure environment

```bash
cp .env.example .env
# Fill in all values in .env
```

### 6. Push database schema and seed

```bash
npx prisma db push
npm run db:seed
```

This creates:
- Admin user: `emily@nankilly.com` / `changeme123`
- All product categories
- Fabric options
- Sample products

### 7. Run locally

```bash
npm run dev
```

Visit:
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### 8. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env`
4. Deploy

Vercel will run `prisma generate` automatically via the `postinstall` script.

## Admin Panel

Access at `/admin` with Emily's credentials.

**Features:**
- View and manage orders (update status to making/shipped/delivered)
- Add/edit/delete products with images
- Upload product images (stored on Vercel Blob)
- View contact form submissions
- Shipping notification emails sent automatically when order marked as shipped

## Square Webhooks

For local development, use the Square sandbox. For production:

1. In Square Dashboard > Webhooks, add endpoint: `https://nankilly.com/api/webhook`
2. Subscribe to: `payment.completed`, `payment.updated`
3. Copy the webhook signature key to your env vars

## Project Structure

```
src/
  app/
    api/
      checkout/      POST - creates order + Square payment link
      contact/       POST - saves message + sends emails
      webhook/       POST - Square payment webhooks
      admin/
        auth/        POST - admin login
        products/    GET/POST/PUT/DELETE
        orders/      GET/PUT
        upload/      POST - image upload
    admin/           Admin panel pages
    shop/            Shop listing
    product/[slug]/  Product detail page
    about/           About page
    delivery/        Delivery info
    contact/         Contact form
    cart/            Cart page
    checkout/success Order confirmation
  components/        Shared React components
  lib/
    db.ts           Prisma client
    square.ts       Square integration
    email.ts        Resend email templates
    auth.ts         Admin JWT auth
    cart.ts         Zustand cart store
  styles/           Global styles
prisma/
  schema.prisma     Database schema
  seed.ts           Initial data
```
