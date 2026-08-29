---
name: Meridian
description: Stark black-and-white atelier storefront — type at architectural scale is the interface.
colors:
  ink: "oklch(0.05 0 0)"
  paper: "oklch(1 0 0)"
  ink-muted: "oklch(0.42 0 0)"
  ground: "oklch(0.96 0 0)"
  ground-pressed: "oklch(0.94 0 0)"
  hairline: "oklch(0.87 0 0)"
  signal-red: "oklch(0.55 0.2 26)"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  label:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 112"
  meta:
    fontFamily: "Spline Sans Mono Variable, Spline Sans Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    letterSpacing: "0.08em"
  body:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.625
rounded:
  none: "0rem"
spacing:
  unit: "0.25rem"
  gutter: "2rem"
  grid-gap: "1.25rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    typography: "{typography.label}"
    height: "3rem"
    padding: "0 2rem"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  input-search:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    typography: "{typography.label}"
    height: "2.25rem"
---

# Design System: Meridian

## Overview

**Creative North Star: "The Atelier Lookbook"**

Meridian is the reference storefront of the Inertia.js adapter for Salesforce
B2C Commerce, dressed as a high-fashion design agency's lookbook: strict black
and white, where type at architectural scale IS the interface. Headlines are
not decoration above content — they are the content. Photography sits bare on
quiet grounds with no card chrome; everything else is drawn with hairline
rules and set in one of three typographic voices. The world is austere but
confident: a stark atelier grotesk, not a minimal SaaS default.

The system is deliberately flat. There is no elevation vocabulary at all —
every shadow token is zeroed — and depth is conveyed exclusively by inversion:
a surface becomes important by swapping ink and paper (the footer, the
category panels, the always-black code band). Dark mode is not a second
palette; it is the same world inverted, produced by flipping the neutral ramp.

Motion is a closed inventory of eight devices — hero reveal, typographic
marquee, entrance fades, hover inversion/scale, chapter reveal, mono ticker,
live protocol trace, and line current — each timed by the shared
`--motion-*` tokens (the two ambient loops, marquee and line current, carry
their own long durations) and silenced for reduced-motion visitors. The three newer devices extend the
same grammar rather than adding a new one: the **chapter reveal** grants the
hero's masked line-rise and rule-draw to section heads, firing once when the
chapter's hairline first enters the viewport (markup renders in final state;
the zero state is applied only inside the effect, so SSR, no-JS, and
reduced-motion visitors always see the finished composition). The **mono
ticker** lets mono numerals move only because the data moves: stat figures
count up to their true value on first in-view (SSR and reduced motion render
the final number), the hero clock ticks real seconds, the carousel counter
reads the real slide index — data only, mono only. The **live protocol
trace** lets protocol chips and seam annotations change state (dim to full
ink over `--motion-base`) only when the real Inertia event they name actually
occurs on the visitor's own page load — it never replays and never simulates.
The **line current** is the one ambient loop beyond the marquee: a soft
segment of foreground light travels the hero's full-bleed drafting hairlines
in both axes (the `line-current` / `line-current-x` utilities, 9s/11s loops,
staggered per line), a signal moving through the system; it pauses while the
hero is offscreen and disappears entirely for reduced motion. Copy is truthful to the demo: mono captions carry real
counts, real locales, real SKUs — never invented marketing.

**Key Characteristics:**
- Strict monochrome; the only chromatic value is a functional destructive red.
- Expanded-caps Archivo (`wdth` 125) display type at architectural scale.
- Zero border radius, zero shadows; separation by hairline rules only.
- Depth by inversion: important surfaces swap ink and paper.
- Mono (Spline Sans Mono) reserved for data: counts, SKUs, prices, code.
- One easing curve, four durations, eight sanctioned motion devices.

## Colors

An achromatic ramp between near-black ink and pure paper, with one functional
red; every value is `oklch` with zero chroma except the red.

### Primary
- **Ink** (`oklch(0.05 0 0)`): the foreground, the primary action fill, the
  focus ring, and the ground of inverted surfaces (footer, category panels,
  code band). In dark mode it becomes the page ground.
- **Paper** (`oklch(1 0 0)`): the page ground, card, and popover surface; text
  on inverted surfaces. In dark mode the roles flip (`oklch(0.99 0 0)`
  foreground on `oklch(0.05 0 0)` ground).

### Neutral
- **Ink Muted** (`oklch(0.42 0 0)`): secondary text — supporting paragraphs,
  meta captions, inactive nav links. Dark-mode counterpart `oklch(0.68 0 0)`.
- **Ground** (`oklch(0.96 0 0)`): quiet fills — image placeholders behind
  photography, skeletons, secondary/muted surfaces. Dark `oklch(0.16 0 0)`.
- **Ground Pressed** (`oklch(0.94 0 0)`): hover/accent fill for ghost buttons
  and menu items. Dark `oklch(0.2 0 0)`.
- **Hairline** (`oklch(0.87 0 0)`): every border, rule, and input stroke.
  Dark `oklch(0.28 0 0)`. On inverted (always-black) surfaces, hairlines are
  drawn as `white/15`–`white/20` instead.

### Functional
- **Signal Red** (`oklch(0.55 0.2 26)`): destructive actions and
  out-of-stock indicators only. Dark `oklch(0.62 0.19 26)`. Never decorative.

### Named Rules
**The One Red Rule.** The palette is achromatic. The only chroma permitted
anywhere is Signal Red, and only with destructive/unavailable meaning. A
second accent color is a violation of the world, not an extension of it.

**The Inverted-Twin Rule.** Dark mode is the same world inverted — the neutral
ramp flips end for end. No dark-mode-only hues, no tinted dark surfaces.

## Typography

**Display Font:** Archivo Variable (with ui-sans-serif, system-ui fallback)
**Body Font:** Archivo Variable (same family, normal width)
**Label/Mono Font:** Spline Sans Mono Variable (with ui-monospace fallback)

**Character:** One grotesk stretched to architectural width for display, its
narrower cut for labels, and a mono voice for data. The pairing reads as a
fashion house's spec sheet: loud caps, quiet figures.

### Hierarchy

The three caps voices are shipped as CSS utilities in `app/styles/globals.css`
and are the only sanctioned ways to set non-body text:

- **`display-caps`** (800, `wdth` 125, uppercase, -0.02em, line-height 0.92):
  the architectural voice. Sizes are contextual, always large:
  hero `clamp(3rem, 9vw, 9rem)`; PLP title `clamp(2.75rem, 7vw, 6rem)`;
  section/category/PDP headings `text-3xl`–`text-5xl`; footer wordmark
  `clamp(3.25rem, 15vw, 15rem)`; marquee `text-2xl`–`text-3xl`.
- **`label-caps`** (600, `wdth` 112, uppercase, 0.14em, 0.6875rem): nav links,
  CTAs and button labels, section labels, accordion triggers, form labels,
  product names on tiles.
- **`meta-caps`** (mono, uppercase, 0.08em, 0.6875rem): data only — item
  counts, prices on tiles, SKUs, locale stamps, breadcrumbs, file names,
  protocol steps.
- **Body** (400, 0.875rem `text-sm`, `leading-relaxed`): supporting prose,
  descriptions, filter values. Constrained to `max-w-sm`–`max-w-xl` measures.
- **Data headlines** (mono, `text-xl`+, 0.04em): the two places mono grows
  past caption size — the PDP price (1.25rem), and the stat numerals of the
  always-black band's fact grid. Numbers are data; large mono is earned only
  when the figure itself is the headline.

### Named Rules
**The Three Voices Rule.** All non-body text is one of `display-caps`,
`label-caps`, or `meta-caps`. No ad-hoc uppercase, no fourth voice, no
italics.

**The Mono-Is-Data Rule.** Spline Sans Mono appears only when the content is
data: counts, SKUs, prices, locales, code. Never for headings or persuasion.

## Layout

A single centered container (`max-width: 90rem`, `padding-inline: 2rem`) on a
0.25rem spacing unit. The page is a vertical sequence of lookbook chapters:
each `Section` opens with a hairline top rule, a `display-caps` title, and
right-aligned mono meta/action on the shared baseline, with `pt-24` (6rem)
rhythm between sections and `mb-10` beneath the chapter head.

- **Header:** sticky, `h-16`, bottom hairline, paper ground. Wordmark +
  `label-caps` category nav (desktop), sheet drawer at `<md`.
- **Product grids:** `gap-5` (1.25rem); PLP is 2 columns mobile, 3 from `sm`,
  beside a fixed `15rem` refinement rail from `lg` (sheet below that). Home
  showcase rows are carousels with tiles at 75% → 25% basis across
  breakpoints.
- **PDP:** two equal columns from `lg`; the info column is `lg:sticky lg:top-24`
  with a `max-w-xl` measure.
- **Footer:** `mt-32`, inverted ground, three-column grid
  (`2fr 1fr 1fr`), then the full-bleed wordmark, then a hairline-topped
  meta strip.
- **Breakpoints:** stock Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

**The Hairline Chapter Rule.** Every major region is introduced by a 1px rule,
not by a box. Structure is drawn with lines; containers never gain
backgrounds to signal grouping. One line, never two: when the preceding
region already ends in a full-width hairline (the marquee border, a carousel
progress track), that line *is* the next chapter's rule — the section omits
its own (`Section rule={false}`).

## Elevation & Depth

This system has no shadows — literally. All `--shadow-*` tokens are defined as
`0 0 #0000` in `globals.css`, so even shadcn defaults render flat. Depth is
conveyed two ways: **inversion** (a surface that matters swaps ink and paper —
footer, category panels, the stack/code band) and **line** (hairline rules
layer the page). Photography may carry a legibility scrim: a bottom gradient
`from-black/70 to-transparent` over the lower two-thirds of a category image.

### Named Rules
**The Inversion Rule.** Emphasis is achieved by swapping foreground and
background, never by lifting a surface. If a region needs weight, invert it.

**The Always-Black Band Rule.** The developer/code band is hard-coded
`oklch(0.05 0 0)` with white text and `white/15`–`white/20` hairlines in both
themes — it does not invert with dark mode. Code lives on black, always.

## Shapes

Radius is zero everywhere: `--radius: 0rem`, and every Tailwind radius alias
(`sm` through `xl`) resolves to it, so even components written with
`rounded-md` render square. Corners are hard; geometry is rectilinear.

The recurring motif is the **solid square dot**: a `size-1.5`–`size-2`
filled square serves as the wordmark's period (rotating 45° on hover), the
marquee separator, and the in-stock indicator. Photography is cropped to
fixed ratios — 4:5 product tiles, 1:1 PDP gallery, 4:3 / 16:10 category
panels — and sits directly on Ground with no frame, border, or card.

**The No-Chrome Rule.** Images and tiles get no card wrapper, no border, no
radius, no shadow. The photograph and its caption are the entire component.

## Components

Motion notes below use the tokens `--motion-fast` 150ms, `--motion-base`
250ms, `--motion-slow` 400ms, `--motion-hero` 700ms, and the single easing
`--motion-ease: cubic-bezier(0.16, 1, 0.3, 1)` (mirrored numerically in
`app/lib/motion.ts` for anime.js).

### Buttons
Square, caps-labeled, ink-filled. shadcn/cva variants in
`app/components/ui/button.tsx`; usage adds `label-caps`.
- **Shape:** square (0rem, via the zeroed radius aliases).
- **Primary:** Ink fill, Paper text; hero CTA is `h-12 px-8`, PDP add-to-bag
  `h-13` full-width-to-`max-w-sm`; hover dims to `bg-primary/90`.
- **Outline:** hairline border on Paper, used for toolbar/load-more
  (`h-11 px-8`); hover fills Ground Pressed.
- **Ghost:** transparent icon buttons (`size-9`) for header actions; hover
  fills Ground Pressed.
- **Focus:** `ring-[3px]` in ring color (Ink); links/tiles use
  `outline-2 outline-offset-4` instead.

### Inputs / Fields
- **Search field:** borderless except a bottom hairline; transparent ground,
  `label-caps` text and placeholder, `h-9`; focus raises the hairline to
  Ink (no ring) and widens `md:w-40 → md:w-56` over `--motion-base`.
- **Checkboxes/Sliders/Accordions:** stock shadcn on the token set; accordion
  triggers are `label-caps`; the untouched price slider mutes its range fill
  to `muted-foreground/25` until it actually filters.

### Navigation
- **Header nav:** `label-caps`; inactive links are Ink Muted, hover/active
  full Ink; the active category draws a 1px Ink underline sitting exactly on
  the header's bottom hairline (`after:-bottom-[19px] after:h-px`).
- **Breadcrumbs:** `meta-caps`, mono — navigation as data.
- **Mobile:** left sheet (`w-72`) with hairline-separated `label-caps` rows.

### Product Tile
The lookbook unit: bare 4:5 photograph on Ground, then `label-caps` name and
`meta-caps` price on a baseline row. No chrome. Hover scales the image to
1.04 over `--motion-slow` and inverts the name (Ink bar behind Paper text,
`--motion-fast`). Broken images fall back to an ImageOff glyph + "No photo".
Skeleton: `animate-pulse` Ground blocks in the same geometry.

### Category Panel
Full-bleed photograph on an inverted ground with the bottom scrim, category
name in `display-caps text-4xl`–`5xl`, `label-caps` "View the collection" with
an arrow that slides 4px on hover; image scales 1.03 over `--motion-hero`.
With no image the panel stays inverted and the name itself is the image —
type as photograph.

### Section (chapter head)
`border-t` hairline, `pt-5`, `display-caps text-4xl`–`5xl` title, right-hand
`meta-caps` meta (truthful counts: "2 lines", "8 items", "loading") and
optional `label-caps` action on the same baseline.

### Chips / Badges
Variation values as square badges: selected = default (Ink fill), unselected
= outline; `label-caps px-3 py-1.5`. Swatches are `size-10` squares whose
selected state is an Ink hairline.

### Footer (signature)
Inverted ground (`bg-foreground text-background`); columns of `label-caps`
links at reduced opacity (50–80%, hover 100% + underline); then the house
signature: the wordmark in `display-caps` at `clamp(3.25rem, 15vw, 15rem)`,
center-set, cropped tight with `-mb-[0.16em]`.

### Toasts
Flash messages surface as sonner toasts; success/error map from Inertia
flash keys. No inline banner pattern exists.

## Do's and Don'ts

### Do:
- **Do** set every heading, label, and data caption in one of the three
  voices (`display-caps` / `label-caps` / `meta-caps`) and keep body prose at
  `text-sm leading-relaxed` on a constrained measure.
- **Do** draw structure with hairline rules (`border` = Hairline,
  `white/15`–`white/20` on inverted grounds) and open every section with a
  top rule.
- **Do** invert (Ink ↔ Paper) to create emphasis or depth.
- **Do** time all motion with `--motion-fast/base/slow/hero` and
  `--motion-ease` only, and keep to the closed inventory: the Home hero
  reveal (masked lines rise, rules draw, fades settle), the typographic
  marquee (36s linear), `motion-safe` tw-animate entrances
  (`animate-in fade-in`, ≤ `slide-in-from-bottom-2`), hover
  inversion/scale (≤1.04 image scale, 45° dot rotation, 4px arrow slide;
  link underlines may draw `scaleX 0→1` from the left over `--motion-base`
  instead of toggling `underline`), the chapter reveal (section heads replay
  the hero grammar once on first in-view, `--motion-hero` rise +
  `--motion-slow` rule draw), the mono ticker (mono numerals move only
  because the data moves — stats count to their true value on first in-view,
  the clock ticks real seconds, the carousel counter reads the real index;
  SSR and reduced motion render final values), and the live protocol trace
  (chips settle dim → full ink over `--motion-base` only when the real
  Inertia event they name occurs on this page load — never replayed, never
  simulated), and the line current (gradient segments of foreground light
  travel the hero's full-bleed drafting hairlines, vertical and horizontal,
  on staggered 9s/11s loops — paused offscreen, absent under reduced
  motion).
- **Do** honor reduced motion everywhere: render markup in its final state,
  gate JS animation on `prefersReducedMotion()`, freeze the marquee, and
  prefix entrance utilities with `motion-safe:`.
- **Do** load anime.js only through `loadAnime()` (dynamic import of
  `app/lib/anime-lite.ts`) inside effects — never at module scope; the SSR
  bundle must stay browser-API-free (shared app shell renders on the server).
- **Do** keep mono captions truthful to the demo catalog: real counts, real
  locale, real SKUs, "demo" stamps — never fabricated merchandising claims.
- **Do** make deferred fallbacks mirror the real payload (skeleton rows per
  actual showcased category, titled with real names) so fills never relabel
  or reflow the page.

### Don't:
- **Don't** introduce any color beyond the achromatic ramp and Signal Red;
  red only ever means destructive/unavailable.
- **Don't** use shadows, glows, or elevation of any kind — the shadow tokens
  are zeroed by design; do not restore them locally.
- **Don't** round a corner. `--radius` is 0rem and every alias resolves to
  it; no per-component radius overrides.
- **Don't** wrap photography or tiles in card chrome (borders, backgrounds,
  frames); the image sits bare on Ground.
- **Don't** use mono for headings or persuasion, or invent a fourth type
  voice / ad-hoc uppercase.
- **Don't** add motion outside the closed inventory (no parallax, no
  scroll-jacking, no springy overshoot beyond the single ease) and never
  hand-write durations or cubic-beziers.
- **Don't** let the code band participate in theme inversion — it is black
  with white text in both modes.
