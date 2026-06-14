# RT Spaces — Inner-page design audit (vs the new homepage system)

> **STATUS: RESOLVED (2026-06-14).** All six themes fixed across /studio, /equipment, /services,
> /members, /gallery, /faq, /book-online + shared components (StudioSections, BookingWizard).
> Commits: 3d0b6fd (consistency passes 1-5), e40d704 (/faq + /book-online hero band + rhythm).
> - [x] /services duplicate "Studio Support" section deleted
> - [x] ghost buttons -> pill (all sites, tracking-[0.05em] cleared)
> - [x] cards / image frames / wizard frame rounded (border-8 -> rounded-2xl, etc.)
> - [x] inputs rounded (newsletter + booking wizard)
> - [x] dot-prefix eyebrows fixed; chip-labels -> plain text (members/services/wizard)
> - [x] /faq + /book-online given hero band + surface rhythm; FAQ "how do I book" copy fixed
> Build verified after every batch. Original audit retained below for reference.

Standard = homepage: rounded/pill theme, plum + cream/sand (no lavender), Space Grotesk + Inter,
surface rhythm, image-led, no old gold/sharp ghost buttons. Audit done from screenshots + code.

## The 6 recurring themes
1. **Sharp corners everywhere** — cards, image frames, inputs, some buttons are still square. Biggest mismatch.
2. **Leftover white "ghost" buttons** — sharp, `tracking-[0.05em]`, `border-2 border-white` (~8 sites, one pattern).
3. **/services duplicate** "Studio Support & Services" section (rendered twice).
4. **Chip-label badges** (banned pill labels) — members "Most popular", services "Limited offer", wizard "popular".
5. **Dot-prefix eyebrows** (`• Studio Gallery`) on /studio — not the letter-spaced eyebrow standard.
6. **Flat/monotone pages** — /faq + /book-online are one pale scroll with no hero/rhythm; /studio runs white sections back-to-back.

## Per page
**/studio** — ghost "View Equipment" buttons (`:88`, `:441`); sharp `border-8` plum photo frames (`:121`, `:161`); 3 dot-prefix eyebrows (`:102`, `:240`, `:276`); sharp services cards w/ lavender top-border (`:253`); monotone white-section run.
**/equipment** — ghost buttons (`:276`, `:364`); sharp product cards `border border-[var(--lavender)]` no rounded (`:172`); lavender tab underline (`:126`).
**/services** — **delete duplicate Studio Support (`:305–389`)**; sharp `border-2` pricing cards (`PackageCard :18`); sharp "Limited offer" chip (`:27`); sharp add-on cards (`:409`) + sharp icon tiles; sharp service image cards (`:196`); ghost "Book Now" (`:168`).
**/members** — "Most popular" chip-label (`:87`); tier image only `rounded-sm` (`:74`); sharp `border-2` package cards (`:273`).
**/gallery** — sharp `border-8` plum frames (`:151`); lavender tab underline (`:75`).
**/faq** — flat single cream page, no hero/rhythm; otherwise clean.
**/book-online** — flat page; sharp `border-2` wizard frame (`:132`); mixed rounding (`rounded-lg` cards vs sharp wizard); off-palette yellow cancel message (`:65`).

## Cross-cutting (shared components — fix once, clears many screens)
- **StudioSections.tsx** ghost buttons `:396`, `:495` (sharp) + `:130`, `:170`; newsletter `<input>` sharp (`:966`).
- **BookingWizard.tsx** — sharp inputs (`:794`, `:799`, `:669`, `:680`), sharp panels `border-2 border-[var(--lavender)]` (`:613`, `:701`), sharp Apply button (`:805`), gold "popular" badge (`:582`). Predates the rounded theme; affects /book-online + the booking drawer site-wide.
- `text-7xl`: only the homepage H1 (allowed) + decorative step numbers — no real violations.
- `var(--lavender)`: only used as borders/separators (now sand) — acceptable, no action.
- No leftover gold *buttons*.

## Suggested fix order (max leverage)
1. **/services duplicate** (one delete).
2. **Shared ghost buttons** → pill (StudioSections 396/495/130/170 + studio 88/441 + services 168 + equipment 276/364). Clears every `tracking-[0.05em]` sharp button at once.
3. **Round all cards/frames** (studio+gallery `border-8` plum frames, equipment/services/members cards, book-online wizard frame, booking-wizard internals).
4. **Round inputs** (newsletter + booking wizard).
5. **Eyebrows + chip-labels** (studio `•` dots; members/services/wizard chips).
6. **Hero band + rhythm** for /faq and /book-online; break up /studio's white run.
