# RT Spaces — Site Redesign Blueprint

Direction (locked 2026-06-13): **Bold & editorial · plum + warm neutrals · modern geometric sans.**
Based on a full Playwright screenshot pass of the live local build (home/studio/equipment/services/
members/gallery/faq/book-online, desktop + mobile + nav).

---

## The core problem: it "looks all similar"

It's not missing content. It's that **almost every section uses the same recipe** — a small uppercase
eyebrow, a centered/left heading, then a grid or stack of bordered cards, all on the same cream
background. The hero and the few dark-plum bands are the only things that break the rhythm. So the eye
gets no variety, and a photography studio's site barely shows photography.

**Three fixes drive everything below:**
1. **Section rhythm** — alternate surfaces so no two adjacent sections look the same.
2. **Layout variety** — stop repeating the card grid; use 5 layout types and rotate them.
3. **Let the photos lead** — it's a studio; imagery should dominate, not bordered text cards.

---

## Global system (build this first — every page uses it)

### A. Section surfaces (rotate; never two of the same in a row)
- **Cream** — default, airy, plum text. The "rest" state.
- **Plum** — dark, dramatic, white text. For emphasis moments (stats, final CTA, one feature block).
- **Full-bleed image** — photo + plum gradient overlay + white text. The "wow" breaks.
- **Sand** — subtle warm tint, for secondary/dense content so it doesn't read as another cream block.

### B. Layout primitives (rotate these instead of always using card grids)
1. **Full-bleed image band** — edge-to-edge photo, text overlaid (like the hero).
2. **Asymmetric split** — ~58/42 image-to-text, alternate which side the image is on per section.
3. **Editorial numbered** — oversized 01 / 02 / 03 with text, minimal chrome (great for "How it works").
4. **Centered statement** — one big line + short sub, lots of whitespace (a "breather").
5. **Card grid** — only where genuinely comparative (pricing, equipment). Cleaner cards: image-top,
   no heavy borders, hairline divider or soft shadow instead of `border-2`.

### C. Components to standardise
- **Cards:** drop `border-2` boxes; use image-top + hairline/soft-shadow. One card style site-wide.
- **Buttons:** white solid (plum text) on plum/photo surfaces; plum solid on cream. One secondary = outline.
- **Section header block:** eyebrow (gold, tracking-wide) + heading + optional one-line intro — consistent.
- **Imagery:** consistent aspect ratios (4:5 portrait for people, 16:9 for spaces), no random crops.

### D. Navigation (currently: plum bar, white links — works, but flat)
- Make **"Book Online" a real button** (solid white or gold), not plain text — it's the money action.
- Optional editorial touch: **transparent nav over the hero, solidifies to plum on scroll** (the dark
  hero already supports white text). Adds the high-end feel; ~30 min.
- Logo: use the wordmark cleanly; consider the script font for "RT Spaces" if it suits the new look.
- Mobile menu CTA = same solid button treatment.

---

## Homepage (the priority — this is the buy-in proof)

Current: Hero → Stats → Features → How-it-works → Community → About → Contact → Email → Footer.
Good bones, but flat after the hero, and **two key moments are missing**: the offer fork and a gallery.

Recommended order (surface · layout · what goes in it):

1. **Hero** — *full-bleed image · overlaid.* ✅ done. Keep.
2. **Stat / trust bar** — *plum · inline row.* 5m×5m · 200+ creators · 4.9★ · open 8–11 daily. Keep, tighten.
3. **The two offers (NEW, important)** — *cream · two big split cards.* The wizard forks Hire vs Session,
   so the homepage should too: **"Hire the studio" (£55/hr, DIY)** vs **"Book a session" (shot for you,
   from £110)**. Each: one photo, 2-line description, price-from, CTA into the wizard pre-forked. This is
   the single biggest missing piece — it tells visitors which path is theirs in 3 seconds.
4. **What's included / the space** — *sand · asymmetric split.* Big photo of the studio + a tight list
   (lighting, backdrops, equipment, 8am–11pm). Copy: concrete, not "world-class environments."
5. **How it works** — *cream · editorial numbered.* 01 Choose → 02 Book & pay deposit → 03 Show up & shoot.
6. **Gallery teaser (NEW)** — *full-bleed · masonry strip.* 6–8 real shots from the studio, "See the
   gallery →". A photography studio must show work above the fold-ish, not bury it on /gallery.
7. **Pricing teaser** — *cream · 3 clean cards.* Top 3 packages + "See all pricing →". Not the full table.
8. **Testimonials** — *plum · quote slider.* Hold until real Google/IG reviews exist (placeholders removed).
9. **Visit us** — *sand · split.* Map + address + hours + parking note. (Currently inside contact; give it air.)
10. **Final CTA** — *plum · centered statement + buttons.* "Ready to shoot? Hire a studio / Book a session."
11. **Newsletter + Footer** — keep; footer is fine.

Copy principles: lead with **what/where/price**, drop the adjective soup ("world-class", "unparalleled",
"compelling visual stories"). Short, concrete, confident.

---

## Inner pages (current → fix)

### /studio ("Take a tour")
- Now: hero + gallery grid + "What We Offer" (plum) + equipment + CTA. Decent, but card-heavy.
- Fix: lead with a **full-bleed studio photo**; turn "the space" into an **asymmetric split** with real
  dimensions/specs; make the gallery a **masonry** not a uniform grid; keep one plum feature band. Add a
  clear **"Book this studio"** sticky/inline CTA. This page should feel like a photo-led tour.

### /equipment
- Now: hero + equipment cards + CTA.
- Fix: group by category (lighting / backdrops / camera / props) with a **photo per item**, not text cards.
  Add "what's included free vs add-on" clarity. Sand surface so it differs from /studio.

### /services (Pricing) — *the worst offender for monotony*
- Now: very long stack of identical bordered package cards + a duplicated "Studio Support" section.
- Fix: **(a) remove the duplicate** "Studio Support & Services" block. **(b)** Split into two clear groups
  with a toggle or two columns: **Studio hire (hourly/day)** vs **Session packages**. **(c)** One clean,
  consistent pricing-card style (image or icon top, price, 3 bullets, deposit line, CTA). **(d)** A compact
  **comparison row** at top so people can scan. **(e)** Add-ons as a simple list, not cards. **(f)** FAQ
  strip at the bottom (deposit/cancellation — now consistent copy).

### /members
- Now: two tiers, contradiction fixed (3-month minimum).
- Fix: lead with **why join** (savings example: "members save £X/session"), then the two tiers as a clean
  comparison, then FAQ. Plum hero, cream tiers. Make the value obvious before the price.

### /gallery
- Now: heading + framed grid.
- Fix: **masonry / justified gallery**, lightbox on click (also fixes the keyboard-accessibility gap),
  filter by type (portrait / brand / event) if images allow. Let it be full-bleed and immersive.

### /faq
- Now: simple Q&A list. Fine.
- Fix: group into sections (Booking / Payment / The space / Members); ensure the "how do I book?" answer
  points to the **wizard**, not just email/phone. Add a "still stuck? message us" CTA.

### /book-online
- Now: wizard embedded + policies. Works.
- Fix: minimal — let the wizard lead, keep policies below as an accordion. The wizard is the win; don't
  bury it under copy.

---

## Suggested build order
1. **Global system** (surfaces, card style, button rules, section-header component, nav CTA).
2. **Homepage** section-by-section (the proof) — especially the NEW offer-fork + gallery teaser.
3. Cascade to **/services** (biggest visual win), then /studio, /gallery, then the rest.

Each section is markup/CSS only — booking logic (`app/api/**`, `lib/*`, the wizard) stays untouched.
Ship to the `feature/booking-wizard` preview after the homepage so the client reacts to the real thing.
