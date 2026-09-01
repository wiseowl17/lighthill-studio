# Lighthill Studio

Editorial website for Lighthill Studio — in-house photography and a rentable cyclorama in Lawrenceville, Georgia.

## Edit content without touching React

All prices, bios, FAQs, gallery captions, and studio copy live in [`data/`](./data). Change a file, commit, and the site rebuilds.

| File | What it controls |
| --- | --- |
| `data/site.ts` | Name, location, email (FormSubmit), Instagram, Peerspace URL, hours |
| `data/pricing.ts` | In-house packages, rental rates, add-ons |
| `data/gallery.ts` | Gallery images, captions, categories |
| `data/studio.ts` | Space copy, features, amenities, specs |
| `data/team.ts` | Photographer names, titles, bios, headshots |
| `data/services.ts` | Homepage service cards and marquee |
| `data/faq.ts` | Accordion questions |

Replace photographs in `public/images/` and logos in `public/brand/`. Keep the paths in the data files in sync.

## Contact form

Inquiries post to [FormSubmit](https://formsubmit.co) at the address in `data/site.ts` (`contactEmail`). The first submission sends a one-time confirmation link to that inbox — click it once, then live submissions arrive as email.

## Studio rental

“Rent the Space” always opens the Peerspace listing in `site.peerspaceUrl`. There is no native checkout.

## Local

```bash
npm install
npm run dev
```
