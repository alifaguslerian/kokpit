# Kokpit — Design System

**Version:** 1.1 — editorial cleanup; token values unchanged
**Status:** V1 design direction locked
**Theme:** Dark Cozy Editorial Workspace
**Primary platform:** Desktop web
**Reference:** Approved Kokpit dark visual concept
**Last updated:** 2026-10-07

This is the source of truth for UI appearance and interaction.
Product scope belongs in [PRD](../product/PRD.md); execution rules belong in [AGENTS](../../AGENTS.md).

## Visual direction

Kokpit is a quiet personal digital room: dark, warm, spacious, editorial, lightweight,
and intentional enough to remain open for hours. It is dark-first; V1 does not require light mode.
Use deep warm charcoal, soft off-white text, copper accents, an elegant serif clock,
clean functional typography, restrained cards, subtle borders, and soft shadows.

| Do | Don't |
| --- | --- |
| Warm, softly separated surfaces | Pure black dominant surfaces; pure white normal text. |
| Generous whitespace and quiet hierarchy | Admin, SaaS, crypto, gamer, corporate, or widget-wall layouts. |
| Limited accent on actions and selected states | Entire orange cards or arbitrary pastel card colors. |
| Optional warm cinematic imagery | Structural imagery, oversized illustrations, saturated assets. |
| Small tactile responses | Neon cyan, purple gradients, RGB glow, cyberpunk decoration. |
| Simple functional feature pages | Glass panels everywhere, massive blur, heavy floating shadows. |
| Intentional information density | Giant stats, progress charts on Home, spreadsheet-like boxes. |

Never add streaks, XP, engagement badges, AI sparkles everywhere, oversized dashboards,
dense information tables, unnecessary animation, excessive gradients, or large border outlines
without an explicit design revision. Do not introduce unrelated UI libraries for appearance.

The understated wordmark is **Kokpit**. Do not rename it KOKPIT AI, Kokpit OS,
Kokpit Workspace Pro, or Kokpit Dashboard without a product revision.

## Tokens

Consume semantic tokens rather than arbitrary colors in feature code.
Each value below preserves the approved V1 specification.

### Color reference

| Group | Token | Value |
| --- | --- | --- |
| Background | `--kokpit-bg-base` | `#0D0B0B` |
| Background | `--kokpit-bg-app` | `#11100F` |
| Background | `--kokpit-bg-sidebar` | `#121110` |
| Surface | `--kokpit-surface-1` | `#181615` |
| Surface | `--kokpit-surface-2` | `#1F1C1A` |
| Surface | `--kokpit-surface-3` | `#25211F` |
| Surface | `--kokpit-surface-hover` | `#292421` |
| Surface | `--kokpit-surface-active` | `#302821` |
| Text | `--kokpit-text-primary` | `#F3EBDD` |
| Text | `--kokpit-text-secondary` | `#D7C8B6` |
| Text | `--kokpit-text-muted` | `#A39280` |
| Text | `--kokpit-text-soft` | `#806F61` |
| Text | `--kokpit-text-disabled` | `#65594F` |
| Text | `--kokpit-text-inverse` | `#15110E` |
| Accent | `--kokpit-accent` | `#D7A06D` |
| Accent | `--kokpit-accent-hover` | `#E2B282` |
| Accent | `--kokpit-accent-active` | `#C48A58` |
| Accent | `--kokpit-accent-muted` | `#A7754E` |
| Accent | `--kokpit-accent-bg` | `rgba(215, 160, 109, 0.12)` |
| Accent | `--kokpit-accent-bg-hover` | `rgba(215, 160, 109, 0.18)` |
| Accent | `--kokpit-accent-glow` | `rgba(215, 160, 109, 0.22)` |
| Border | `--kokpit-border-subtle` | `rgba(255, 244, 232, 0.06)` |
| Border | `--kokpit-border-default` | `rgba(255, 244, 232, 0.10)` |
| Border | `--kokpit-border-strong` | `rgba(255, 244, 232, 0.16)` |
| Status | `--kokpit-success` | `#8FAF88` |
| Status | `--kokpit-warning` | `#D3A05F` |
| Status | `--kokpit-danger` | `#C9786C` |
| Status | `--kokpit-info` | `#819DBD` |
| Status background | `--kokpit-success-bg` | `rgba(143, 175, 136, 0.12)` |
| Status background | `--kokpit-warning-bg` | `rgba(211, 160, 95, 0.12)` |
| Status background | `--kokpit-danger-bg` | `rgba(201, 120, 108, 0.12)` |
| Status background | `--kokpit-info-bg` | `rgba(129, 157, 189, 0.12)` |

Accent belongs mainly on active navigation, primary actions, music progress, selected items,
tiny indicators, focus states, subtle labels, and selected filters. Status colors remain subdued.
Borders separate surfaces without making cards look like spreadsheet cells.
The glow token does not authorize decorative glow effects prohibited above.

### Typography reference

V1 font families are **locked: Cormorant Garamond + Inter**, per DEC-048 in
[Decisions](../product/DECISIONS.md). Comparing or replacing them requires design approval.
Keep families behind their tokens; do not introduce additional families.

| Token | Value |
| --- | --- |
| `--font-display` | `"Cormorant Garamond", Georgia, serif` |
| `--font-ui` | `"Inter", system-ui, sans-serif` |
| `--text-clock` | `88px` |
| `--text-display-xl` | `48px` |
| `--text-display-lg` | `34px` |
| `--text-display-md` | `28px` |
| `--text-heading-lg` | `22px` |
| `--text-heading-md` | `18px` |
| `--text-heading-sm` | `16px` |
| `--text-body-lg` | `16px` |
| `--text-body-md` | `14px` |
| `--text-body-sm` | `13px` |
| `--text-caption` | `12px` |
| `--text-micro` | `11px` |

The expanded interface fallback stack may use `system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", sans-serif` after Inter; these are fallbacks, not new primary families.

| Role | Family | Weight / treatment |
| --- | --- | --- |
| Clock | Display serif | 400–500; letter spacing -0.02em; line height 0.95–1.0. |
| Quote | Display serif | 400 italic; line height 1.35–1.5. |
| Card heading | UI sans | 600. |
| Body | UI sans | 400; line height 1.5–1.65. |

Desktop clock may scale from 72px to 96px with the viewport.
Display serif may also serve large greetings and occasional expressive headings.
Use UI sans for navigation, cards, buttons, inputs, metadata, body, menus, lists, and settings.
Never use display serif for dense functional UI.

### Geometry and motion reference

| Token | Value |
| --- | --- |
| `--radius-xs` | `8px` |
| `--radius-sm` | `10px` |
| `--radius-md` | `14px` |
| `--radius-lg` | `18px` |
| `--radius-xl` | `22px` |
| `--radius-pill` | `999px` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--sidebar-width` | `220px` |
| `--page-padding-x` | `24px` |
| `--page-padding-y` | `22px` |
| `--content-gap` | `16px` |
| `--section-gap` | `20px` |
| `--shadow-soft` | `0 4px 16px rgba(0,0,0,0.18)` |
| `--shadow-card` | `0 8px 28px rgba(0,0,0,0.26)` |
| `--shadow-float` | `0 12px 36px rgba(0,0,0,0.30)` |
| `--motion-fast` | `120ms` |
| `--motion-default` | `180ms` |
| `--motion-slow` | `240ms` |
| `--ease-default` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

Base spacing unit is 4px; avoid arbitrary spacing where the scale fits.
Recommended radii: input 12–14px, button 12px, small card 14px, main card 18px,
hero surface 22px, chips pill. Do not use dramatic floating shadows.

## Layout and navigation

Desktop is primary; target 1366px–1920px while remaining usable on smaller laptops.
The app shell is a sidebar beside main content. Very large screens may use a comfortable
maximum readable content width rather than stretching text indefinitely.

Sidebar order: Kokpit name/logo → short tagline → Home, College, Music, News, Ideas,
Library → optional atmospheric visual near the bottom. Do not add destinations outside V1.
Dedicated-page paths are conceptually `/home`, `/college`, `/music`, `/news`, `/ideas`,
and `/library`; actual routing belongs in [Architecture](../engineering/ARCHITECTURE.md).

| Sidebar item | Specification |
| --- | --- |
| Geometry | Height 44px; inline padding 14px; radius 12px; gap 12px. |
| Inactive | Secondary text; transparent background. |
| Hover | `rgba(255,255,255,0.035)` background; primary text. |
| Active | Accent-bg background; accent-hover text. |
| Icon | Lucide preferred; consistent 1.75–2px stroke; sizes 16, 18, 20, or 22px. |

Avoid oversized icons. Quick Links may use recognizable brand logos.

## Home composition

Home is an overview. Full feature implementations stay on dedicated pages.

```text
Hero: Clock + Date + Context line + Quote + optional atmospheric visual
Highlights: Music · College · Ideas · News · Quick Links
```

Recommended desktop arrangement, not a pixel-perfect requirement:

| Row | Left | Right |
| --- | --- | --- |
| Hero | Clock / quote | Atmospheric image when present |
| Highlights | Music | College |
| Highlights | Ideas | News |
| Launchpad | Quick Links across available width | |

Hierarchy: **Clock → Quote / atmosphere → Current music → Relevant current context
→ Feature previews → Navigation**. Do not make News more prominent than the clock.
The hero may merge into a room image; its content is context/greeting, time, date, quote,
and a source only when one genuinely exists. Quote attribution follows
[Content Sources](../features/CONTENT_SOURCES.md).

A new feature does not automatically deserve a Home widget. Ask whether it warrants
attention every time Kokpit opens; otherwise keep it on its own page.

### Atmospheric imagery

Imagery is optional and must never be structural: the interface works if it is removed.
Prefer a dark room, warm lamp, desk, books, plant, laptop, city outside, window reflection,
and soft amber light. Assets should feel warm, cinematic, natural, soft, and slightly muted.

```css
/* Recommended image treatment and optional readability overlay. */
filter: brightness(0.68) saturate(0.85) contrast(1.05);
background: linear-gradient(
  90deg,
  rgba(13,11,11,0.98) 0%,
  rgba(13,11,11,0.78) 45%,
  rgba(13,11,11,0.15) 100%
);
```

Never reduce clock readability. General images use `object-fit: cover` and 12–18px radii.
Mobile may significantly reduce atmospheric imagery.

### Highlight patterns

Header pattern: **[icon] Section name — action →**. Use proper icons, not emoji.
Examples: Now Playing / Open Music; College / Go to College; News / See News;
Ideas / Open Ideas; Quick Links / View Library.

| Highlight | Content and limits |
| --- | --- |
| Music | Cover, track, artist, favorite, progress, current time, duration, previous, play/pause, next, Open Music. Shuffle and repeat optional. Home also exposes volume per [PRD](../product/PRD.md). |
| College | Current semester, current week, one relevant course, one next material / continuation, College CTA. No full academic tree or progress gamification. |
| News | Recommended maximum 2–3 visible items: thumbnail, headline, source, time. Full bodies, large filters, trending tables, and feed controls stay on News. |
| Ideas | Immediate text capture and Open Ideas action. Optional quick tags: Idea, Question, Random, Project, College. Never require a tag before saving. |
| Quick Links | Brand icon and label; a tile may represent Add. No excessively colorful backgrounds; recognizable brand colors may remain in icons. |

Music cover: 96–112px square, radius 12–14px.
Primary play button: 48px square, pill radius 999px, accent background, inverse text.
Progress track: `rgba(255,255,255,0.10)`; filled progress: accent.
Quick Link tile: minimum width 72px, height 68px, radius 12px,
surface-2 background, 1px subtle border.

## Components and interaction states

Reuse focused components without excessive abstraction. Conceptual names include AppShell,
Sidebar / SidebarNav / SidebarNavItem, HomeHero / Clock / DynamicQuote,
FeatureCard, MusicPreview / CollegePreview / NewsPreview / IdeaCapture / QuickLinksPreview,
Button / IconButton, Input / Textarea, Chip / Badge, EmptyState / ErrorState / Skeleton.
Naming and placement follow [File Structure](../engineering/FILE_STRUCTURE.md).

All interactive components need default, hover, focus, active, disabled, and loading states
where relevant; implementing only the default state is insufficient.

| Component | Base pattern | Interaction |
| --- | --- | --- |
| Card | Surface-1; 1px default border; radius-lg. Surface-2 for secondary areas. | Optional `translateY(-1px)` and strong border on hover; no large lift or dramatic scaling. |
| Primary button | Accent background; inverse text; 12px radius. | Accent-hover background; pressed scale(0.98); background 150ms ease, transform 120ms ease. |
| Secondary button | Surface-2; 1px default border; primary text. | Complete focus, active, disabled, loading states. |
| Ghost button | Transparent; secondary text. | Hover `rgba(255,255,255,0.04)` background and primary text. |
| Input | Height 44px; surface-2; 1px default border; radius 12px; primary text; padding 0 14px. | Soft-text placeholder; focus accent-muted border and `0 0 0 3px` accent-bg shadow. |
| Chip / tag | Height 30px; padding 0 12px; radius 999px; surface-2; 1px default border. | Selected accent-bg background and accent-hover text. |

Minimize nested cards: use space, type, and subtle dividers instead of card-inside-card layers.
Borders, shadows, and hover behavior should remain tactile but quiet.

### Motion and scrollbars

| Use | Recommended duration / treatment |
| --- | --- |
| Hover | 120–180ms. |
| Button | 120ms. |
| Card | 180ms. |
| Page | 200–240ms; opacity plus very small translateY. |
| Modal | 200ms. |
| Scrollbar | Optional 8px width; transparent track; thumb `rgba(255,255,255,0.12)`; hover `rgba(255,255,255,0.20)`. |

Page example: from opacity 0 / translateY(4px) to opacity 1 / translateY(0).
Avoid large slides, glow explosions, and unnecessary animation.

## Dedicated pages

| Page | Design focus |
| --- | --- |
| Music | Library, playlists, queue, search, controls, import, track management where scoped. Calm and music-focused; do not visually copy Spotify. |
| College | Semester → Course → Week → Materials; prioritize navigation and organization without LMS complexity. |
| News | Readable curated feed, source transparency, useful category filters, article opening; avoid sensational presentation. |
| Ideas | Capture, browse, search, edit, delete; no full Notion-style editor. |
| Library | Visually organized quick links; grouping optional for V1. Possible later groups: Daily, Development, College, Media, Tools, Other. |

This table describes design patterns, not permission to expand a phase's feature scope.

## Loading, empty, and error states

| State | Pattern |
| --- | --- |
| Loading | Cached content, skeleton, or subtle pulse; avoid giant generic spinners. Skeleton surface-2 with `rgba(255,255,255,0.03)` highlight. |
| Empty | Quiet concise text and useful next action; no giant illustrations. Example: “No ideas yet. Write something before it disappears.” |
| Error | Local, non-disruptive feedback and graceful fallback. Example: “News couldn't refresh. Showing your latest cached stories.” |

## Responsive behavior

Breakpoints are conceptual guidance, not mandatory framework values.

| Range | Behavior |
| --- | --- |
| Mobile: <640px | Prioritize idea capture, quick links, news glance, music controls, college access, and clock. Reduce imagery. |
| Tablet: 640–1023px | Sidebar may collapse; 2-column grids may become 1 column or an appropriate asymmetric layout. |
| Desktop: 1024–1439px | Main sidebar and Home composition; remain usable on smaller laptops. |
| Large desktop: ≥1440px | Comfortable readable content width and generous space. |

Do not force mobile to reproduce desktop exactly.

## Accessibility and validation

Minimum requirements: keyboard navigation, visible focus, semantic controls, accessible labels,
reasonable text contrast, non-color-only states, heading hierarchy, and reduced-motion support.
Choose text tokens for the actual background and text role; having a token does not replace
contrast verification.

Preserve the documented reduced-motion duration treatment:

```css
@media (prefers-reduced-motion: reduce) {
  /* Apply to the elements that animate or transition. */
  animation-duration: 0.01ms;
  transition-duration: 0.01ms;
}
```

Verify desktop, basic responsive behavior, keyboard focus, loading, empty, and applicable error
states. Visual completion cannot be established by TypeScript compilation alone.
Compare against the approved visual concept at the documented validation step;
its missing reference asset must be reported rather than replaced with a new design.

## Semantic implementation mapping

Tailwind consumes these tokens through semantic names: `bg-app`, `bg-sidebar`, `bg-surface`,
`bg-surface-raised`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `accent-hover`,
`border-subtle`, and `border-default`.
Avoid scattered raw palette utilities such as `bg-zinc-950`, `text-stone-200`,
and `border-neutral-800`. Reuse the existing tokens and keep deeper feature pages functional.

> Does this still feel like a quiet personal digital room?

If the answer is no, review the design before implementing a new visual pattern.
