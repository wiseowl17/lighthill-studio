# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Local families in Lawrenceville, Gwinnett County and the Atlanta area, many of them Spanish-speaking, booking in-house sessions: maternity, newborn, family, cake smash, seasonal minis, celebrations, branding, headshots, podcasts.
- Photographers, videographers and small productions renting the studio by the hour.
- For events (e.g. Cocoween, Oct 31 2026): parents of young children buying tickets per child, plus Lighthill's existing clients being invited back. They usually arrive from Instagram or a shared flyer, often on a phone.

## Product Purpose

Lighthill Studio is a 1,200 sq ft infinity wall photography studio at 1766 Old Norcross Rd, Ste Y, Lawrenceville, GA 30044. The site sells three things: in-house sessions (inquiry form), hourly studio rental (instant book, 50% Stripe deposit), and occasional ticketed events (Stripe Checkout). Success is booked sessions, paid rentals and sold tickets.

## Positioning

A studio run by its two co-owner photographers, Luz Reyes and Hillary Urgelles, who shoot every in-house session together, in their own room with a white infinity wall, open 24 hours, at $55/hr for renters, below many Atlanta studios ($60–$150).

## Operating Context

- Visitors arrive mostly from Instagram (@lighthill_studio), Google Maps, Peerspace and shared flyers.
- Events are bilingual in practice: the owners publish English and Spanish flyers.
- The desk (/desk) is the owners' back office for bookings, invoices and inquiries.

## Capabilities and Constraints

- Stack: TanStack Start (React 19), Tailwind 4, Vercel, Neon Postgres, live Stripe, Google Calendar.
- The site copy is English only. A single event page may be bilingual (owner-approved for Cocoween); Spanish must not be re-enabled site-wide.
- Event tickets: one Stripe product per event, found by product metadata `event=<key>`. Cocoween: $60 per child, no hard cap, walk-in any time 1–4 PM, no time slots.
- Hard rules from the handoff (HANDOFF.md) still bind: do not remove the `Photo` import or the smoke test, do not add /pricing or /colorful to the nav, and do not import client data into `*.server.ts`.

## Brand Commitments

- Name: "Lighthill Studio" (the flyers set it as "LIGHT HILL STUDIO"); the logo lives in public/brand/.
- Voice: calm, warm and specific; no hype.
- The main site's world is dark ink and warm paper, with Cormorant Garamond and Outfit, and real studio photography.
- Visible copy says "infinity wall", never "cyclorama" (owner SEO decision).

## Evidence on Hand

- Real photography: public/images/** and the gallery.
- Reviews (verbatim): data/reviews.ts. Peerspace 5.0 from 5 reviews, Google 5.0 from 2 reviews.
- Cocoween flyers: public/images/events/cocoween-flyer-en.jpg and cocoween-flyer-es.jpg. Partner: Fluffy Bee Ceramics.
- Absent, do not fabricate: attendance numbers, testimonials about events, and partner details beyond the flyer.

## Product Principles

1. The facts a parent needs (when, where, price, what's included) come first, and fast on a phone.
2. Celebrate traditions respectfully. Día de los Muertos is a celebration of family and memory, not a costume.
3. Kid-friendly and joyful, never frightening.
4. It is always recognisably Lighthill: real photography and the studio's name. Never generic clip-art.
5. Show only what is true, and never invent claims.

## Accessibility & Inclusion

Bilingual audience (English and Spanish). Parents on phones, often one-handed. WCAG AA contrast, and motion that respects reduced-motion settings.
