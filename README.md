# Lighthill Studio

Marketing site for Lighthill Studio — in-house photography and a rentable cyclorama in Lawrenceville, Georgia.

## Edit content

Prices, bios, FAQs, and gallery captions live in `/data`. Change a file and redeploy. See [data/README.md](data/README.md).

Images live in `public/images/` and logos in `public/brand/`.

Studio rentals are booked on [Peerspace](https://www.peerspace.com/pages/listings/6a74b0ccd2019fc79dd2f88e). The contact form emails the studio and also lands in the owner desk inbox.

## Owner desk

Sign in at `/login` with the studio Gmail. The desk (`/desk`) is the floor calendar, bookings, clients, invoices, and inbox. In-house shoots are booked by hand here — no public checkout. Square and Google Calendar stay disconnected until those accounts are ready.

The owner desk stores bookings in **Neon Postgres**, connected on the Vercel project (`lighthill-studio`). Sign in at `/login` with the studio Gmail. In-house shoots are booked by hand here — no public checkout. Square and Google Calendar stay disconnected until those accounts are ready.


## Scripts

```bash
npm install
npm run dev
npm run build
```
