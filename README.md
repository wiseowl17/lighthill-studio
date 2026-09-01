# Lighthill Studio

Marketing site for Lighthill Studio — in-house photography and a rentable cyclorama in Lawrenceville, Georgia.

## Edit content

Prices, bios, FAQs, and gallery captions live in `/data`. Change a file and redeploy. See [data/README.md](data/README.md).

Images live in `public/images/` and logos in `public/brand/`.

Studio rentals are booked on [Peerspace](https://www.peerspace.com/pages/listings/6a74b0ccd2019fc79dd2f88e). The contact form posts through FormSubmit to the email in `data/site.ts` — confirm that address the first time a message is sent.

## Scripts

```bash
npm install
npm run dev
npm run build
```
