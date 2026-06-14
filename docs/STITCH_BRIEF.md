# RT Spaces — Google Stitch Design Brief

> Paste the **Stitch Prompt** (bottom of this file) into Google Stitch. Everything above it is the
> source-of-truth context it's built from — real brand, real pricing, real offering pulled from the
> live codebase.

---

## 1. What RT Spaces Actually Is (the core clarity fix)

RT Spaces is a **photography studio for hire in East London**, founded by **Rose & Teddy**.
A 5m × 5m daylight-ready studio with a white cyclorama, controlled lighting, styled corners, and a
neon photobooth wall. Open **daily, 8 AM – 11 PM**.

It sells **two distinct things**, and the #1 reason visitors are confused is the site never makes you
choose between them up front. Every redesign decision flows from forcing this fork early:

| Path | Who it's for | What you get | Price |
|---|---|---|---|
| **A. Hire the studio** | Photographers, creators, brands with their own crew | Empty studio + all equipment, by the hour or day | £55/hr (2hr min), Half-day £260, Full-day £450 |
| **B. Book a photo session** | People who want photos taken *for* them | RT's photographer, direction, edited images, online gallery | £110–£220 fixed packages |

It is **NOT** a podcast/YouTube/video content studio. Do not invent those use cases — there is no
equipment or packaging for them. The outcomes are **photographs**: portraits, branding, editorial,
engagements, maternity, family, plus events via the photobooth.

**Location:** Unit 3E, Room 1, 736–740 Romford Road, London E12 6BT
**Contact:** enquires@rtspaces.co.uk · 07944 667000 · [@rtspaces](https://www.instagram.com/rtspaces/)
**Social proof:** 4.9/5 from 200+ creators

---

## 2. Brand & Visual System (use these exactly)

**Mood:** calm, muted, soft-luxury. Plum + lavender + a *very* desaturated gold. Lots of white space,
photography does the talking. Sharp corners on buttons (no rounded CTAs), generous shadows on cards.

### Colour palette
| Role | Hex (approx) | Use |
|---|---|---|
| Deep Plum (primary / headings / text) | `#3D2350` | Headlines, body text, primary buttons |
| Lavender (secondary) | `#AE94B9` | Borders, separators, accents, focus rings |
| Muted Plum | `#7A6685` | Paragraph / secondary text |
| Soft Purple (page background) | `#ECE7F0` | Default page background |
| Hero Purple (deeper bg) | `#D8CFE0` | Hero / section backgrounds |
| Off-white (base / cards) | `#FAF9F6` / `#FFFFFF` | Cards, panels |
| Muted Gold (accent) | `#B49A6B` | Stars, small highlights, "popular" badge — use sparingly |

Background is a soft top-to-bottom gradient: hero-purple → soft-purple.

### Typography
- **Headings:** Playfair Display (serif) — elegant, high-contrast. Used large, often ALL-CAPS in hero.
- **Body / UI:** Glacial Indifference (clean geometric sans). Fallback: system-ui.
- **Script accent:** "New Icon Script" (cursive) — for the logo / occasional flourish only, never body.

### Components / styling rules
- **Buttons: square corners (border-radius 0).** Primary = solid plum, white text. Secondary = transparent, 1px plum border, plum text. Hover = subtle scale(1.02) + shadow.
- Cards: white, soft large shadow, thin lavender separators between rows.
- Photo frames: images sit inside an 8px white (or plum) border — a signature "framed photo" look. Keep this.
- Section labels: small, UPPERCASE, wide letter-spacing (0.4em), muted-plum. e.g. `• STUDIO GALLERY`.
- Radius for inputs/cards where used: ~0.6rem. Buttons stay square.

---

## 3. The Problems (what the redesign must fix)

The site looks professional but a first-time visitor can't answer these in 5 seconds:
**What is this? Who's it for? What can I make here? What's included? How much? How do I book?**

Specific failures:
1. **Vague hero** — "Where Creativity Meets Professional Excellence" says nothing concrete.
2. **No fork** between *hire* vs *photo session* — the two offers blur together.
3. **3D shuffling carousel** demands interaction before you understand the space; too much motion, hides the actual studio.
4. **Weak CTA hierarchy** — "Hire a Studio" and "View Packages" carry near-equal visual weight; nothing dominates.
5. **No "How It Works"** near the top — process is buried.
6. **Pricing too far down** — people want the number fast.
7. **Features are prose, not scannable** — should be an icon grid.
8. **Gallery shows the empty room / gear, not outcomes** — people buy results, not walls.
9. **Testimonials feel detached** from any result.
10. **Contact form is heavy** and competes with booking as the primary action.

---

## 4. Recommended Page Structure (homepage)

```
1. Hero            → one strong studio image + clear value prop + the two-path fork
2. The Fork        → "Hire the studio" vs "Book a photo session" (two big cards)
3. How It Works    → 3 steps: Choose → Pick date & time → Show up & create
4. Pricing         → packages + hire rates, shown early
5. What's Included → scannable icon grid of equipment/amenities
6. Gallery         → outcome-focused (real shots from sessions), framed-photo style
7. Testimonials    → name + role + result + ★★★★★
8. About (Rose & Teddy) → short trust-building story
9. FAQ             → hours, location, equipment, bring-your-own-crew, booking
10. Final Booking CTA → big, single primary action ("Check Availability / Book")
11. Footer         → address, hours, contact, Instagram
```

Visual weight order (most → least): **Hero → Booking CTA → The Fork → Pricing**. Everything else supports.

---

## 5. Section-by-Section Content (real copy + real data)

### Hero
- **Headline (pick one):**
  - "Photography Studio Hire in East London"
  - "A Professional Studio to Hire — or a Photoshoot, Done for You"
- **Subhead:** "A 5m × 5m daylight-ready studio with a white cyclorama, pro lighting and styled sets. Hire it by the hour, or book a full photo session with our photographer. Open daily, 8 AM – 11 PM."
- **Primary CTA:** `Check Availability` → /book-online
- **Secondary CTA:** `View the Studio` → /studio
- **Trust line:** ★ 4.9/5 from 200+ creators
- **Visual:** ONE strong, real studio image (replace the shuffling carousel). A floating pricing/booking card over it is ideal ("From £55/hr · Book in 60 seconds").

### The Fork (new — most important section)
Two large side-by-side cards:
- **Card A — Hire the Studio:** "Bring your own camera and crew. Full run of the space + all equipment." → From £55/hr · `Hire the studio`
- **Card B — Book a Photo Session:** "We shoot it for you. Direction, lighting, and edited images delivered in a private gallery." → From £110 · `Book a session`

### How It Works
1. **Choose** — Pick studio hire or a photo session
2. **Pick a date & time** — Real-time availability, 8 AM–11 PM daily
3. **Show up & create** — Everything's set up and ready when you arrive

### Pricing (REAL — from the codebase)

**Photo Session Packages** (with photographer, edited images, online gallery; Mon–Thu):
| Package | Price | Includes |
|---|---|---|
| Essential Studio Session | **£110** | 2 hrs · up to 2 people · 5 edited images · 1 backdrop · private gallery |
| Signature Studio Session *(Most Popular)* | **£165** | 3 hrs · up to 4 people · 10 edited images · outfit changes · gallery |
| Luxury Studio Experience | **£220** | 4 hrs · up to 6 people · 15 edited images · multiple changes · priority editing · print credit |
| Engagement Story | **£200** | 3 hrs · 15 edited images · styling & posing guidance · priority editing |

**Studio Hire** (space + equipment only, bring your own crew):
| Option | Price |
|---|---|
| Standard Rate | **£55/hr** (2 hr minimum) |
| Student Studio Hire | **£35/hr** (1 hr min, student ID required, £20 deposit) |
| Half Day | **£260** (5 hrs) |
| Full Day | **£450** (9 hrs) |

**Add-ons:** Extra edited image £10 · Full gallery upgrade £50 · Additional hour £55 · Extra person £15 · Prints & albums (on request).
**Deposit:** 50% to book (student rate: £20 fixed); balance due on the day.

### What's Included (icon grid — scannable)
Lighting: Professional softboxes · Continuous LEDs · Strobes & modifiers · Diffusers & reflectors
Studio: Light stands & grip · Tethering station · Rolling wardrobe rack · Clothes steamer
Backdrops: White cyclorama · Textured grey · Colour rolls · Lifestyle setups
Props & styling: Stools & plinths · Furniture pieces · Neon photobooth wall · Styling accessories
Amenities: Dressing area · Bluetooth audio · Kitchenette · Free tea & coffee · WiFi

### Gallery
Outcome-focused real shots: portraits, branding sessions, editorial sets, engagement shoots, photobooth in use. Use the signature framed-photo look (white/plum 8px border). Link: "Follow @rtspaces →".

### Testimonials
Format: **Name** · Role (e.g. "Personal brand client") · one-line result · ★★★★★. Video testimonials if available.

### About — Rose & Teddy
"Founded by Rose & Teddy, RT Spaces pairs a calming studio with ready-to-roll equipment so you can focus on directing talent, shooting content, or hosting clients."

### FAQ
Hours (daily 8 AM–11 PM) · Location (Unit 3E, 736–740 Romford Road, E12 6BT) · What equipment is included · Can I bring my own crew (yes) · How to book.

### Final CTA
Single dominant primary button: `Check Availability` / `Book Your Studio`. Contact form is secondary — demote it to a small "Have a question? Email enquires@rtspaces.co.uk" line.

---

## 6. Mobile rules
- Hero readable without scrolling: headline + one CTA above the fold.
- The two Fork cards stack vertically.
- Pricing cards stack; "Most Popular" stays visually distinct.
- No 3D carousel on mobile — single image.
- Keep tap targets large; buttons full-width.

---

## 7. ⬇️ STITCH PROMPT (paste this into Google Stitch)

> Design a modern, conversion-focused homepage for **RT Spaces**, a photography studio for hire in
> East London (founded by Rose & Teddy). The studio can be **hired by the hour/day** (bring your own
> crew) OR booked as a **done-for-you photo session** with their photographer. It is a photography
> studio — NOT a podcast or video studio.
>
> **Brand:** soft-luxury, calm, muted. Colours — deep plum `#3D2350` (headings, text, primary
> buttons), lavender `#AE94B9` (borders/accents), muted plum `#7A6685` (body text), soft purple
> `#ECE7F0` background fading to `#D8CFE0` at the hero, white cards, muted gold `#B49A6B` used
> sparingly for stars/badges. Headings in **Playfair Display** (serif, often large/uppercase in the
> hero), body in a clean geometric sans (Glacial Indifference / system sans). **Buttons have square
> corners** (no rounding): primary = solid plum with white text, secondary = transparent with a 1px
> plum border. Images sit inside an 8px white border (framed-photo look). Generous white space, soft
> large card shadows, small uppercase wide-tracked section labels.
>
> **Sections, in order:**
> 1. **Hero** — one strong studio photo (no carousel). Headline "Photography Studio Hire in East
>    London". Subhead about the 5×5m daylight studio, white cyclorama, pro lighting; open daily
>    8 AM–11 PM. Primary CTA "Check Availability", secondary "View the Studio". Trust line:
>    ★ 4.9/5 from 200+ creators. Optional floating booking card "From £55/hr".
> 2. **The Fork** — two large cards side by side: "Hire the Studio — from £55/hr, bring your own
>    crew" and "Book a Photo Session — from £110, we shoot it for you, edited images delivered".
> 3. **How It Works** — 3 steps with icons: Choose → Pick a date & time → Show up & create.
> 4. **Pricing** — two groups. Sessions: Essential £110, Signature £165 (mark Most Popular), Luxury
>    £220, Engagement £200. Hire: Standard £55/hr, Student £35/hr, Half-day £260, Full-day £450.
> 5. **What's Included** — scannable icon grid: pro softboxes, continuous LEDs, strobes, white
>    cyclorama, backdrops, tethering station, wardrobe rack, steamer, neon photobooth wall, dressing
>    area, kitchenette, free tea & coffee, WiFi.
> 6. **Gallery** — outcome-focused framed photos (portraits, branding, editorial, engagement,
>    photobooth), 3-column grid.
> 7. **Testimonials** — name, role, one-line result, 5 stars.
> 8. **About Rose & Teddy** — short trust paragraph with a studio image.
> 9. **FAQ** — hours, location, equipment, bring-your-own-crew, booking.
> 10. **Final booking CTA** — one dominant "Book Your Studio" button.
> 11. **Footer** — address (Unit 3E, 736–740 Romford Road, London E12 6BT), daily 8 AM–11 PM,
>     enquires@rtspaces.co.uk, 07944 667000, Instagram @rtspaces.
>
> Make the visual hierarchy: Hero → Booking CTA → The Fork → Pricing dominate; everything else
> supports. Fully responsive; on mobile the hero shows headline + one CTA above the fold and the two
> Fork cards stack. The page must answer in 5 seconds: what is this, who's it for, what's included,
> how much, how to book.
