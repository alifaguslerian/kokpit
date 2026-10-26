# Kokpit — Design System

**Version:** 1.4 — Approved Home and feature-page composition
**Status:** V1 design direction locked
**Theme:** Dark Cozy Editorial Workspace
**Primary platform:** Desktop web
**Reference:** Approved Home plus five feature pages; [reference gallery and interpretation](UI_REFERENCES.md)
**Last updated:** 2026-10-25

This is the source of truth for UI appearance and interaction.
Product scope belongs in [PRD](../product/PRD.md); execution rules belong in [AGENTS](../../AGENTS.md).

The owner approved the FINAL Home image and its implementation on 2026-10-25.
It supersedes the earlier sidebar, hero-only imagery and independent-column composition.
Follow its room atmosphere, floating bottom navigation and Home hierarchy through the
specifications below. On the same date the owner approved College v2, News v2, Ideas v2,
Music and Library, and requested functional controls through revised requirements.
[Approved UI Features](../features/APPROVED_UI_FEATURES.md) maps every surface to behavior.
DEC-054 supersedes earlier dedicated-page references; DEC-051 remains historical, and
DEC-053 continues to govern Home. Generated sample data, fonts and decorative details
do not replace semantic tokens, accessible controls or the real data contracts.

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
| Full-viewport warm room photograph with a solid fallback | UI baked into imagery, oversized illustrations, saturated assets. |
| Small tactile responses | Neon cyan, purple gradients, RGB glow, cyberpunk decoration. |
| Four readable translucent Home panels and one cream Ideas panel | Excessive blur, unreadable transparency, heavy floating shadows. |
| Intentional information density | Giant stats, progress charts on Home, spreadsheet-like boxes. |

Never add streaks, XP, engagement badges, AI sparkles everywhere, oversized dashboards,
dense information tables, unnecessary animation, excessive gradients, or large border outlines
without an explicit design revision. Do not introduce unrelated UI libraries for appearance.

The understated wordmark is **Kokpit**. Do not rename it KOKPIT AI, Kokpit OS,
Kokpit Workspace Pro, or Kokpit Dashboard without a product revision.

## Tokens

Consume semantic tokens rather than arbitrary colors in feature code.
Base color and font-family values preserve the approved V1 specification. The FINAL
room composition adds semantic room-overlay, translucent-panel, dock and paper roles.
Their implementation belongs in the shared stylesheet, not raw colors scattered through
feature code. Paper requires its own readable ink, muted text, rule and focus roles;
dark-surface text tokens must not be assumed to work on cream. Validate contrast against
the composed photograph, overlay and panel, including fallback and interaction states.
Inside translucent room panels, the muted text role resolves to the secondary text color
to preserve caption contrast over brighter parts of the photograph. The paper surface
uses its own ink, muted and accent roles rather than those dark-panel overrides.

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
| Room panel fallback | `--kokpit-room-panel` | `rgba(26, 21, 17, 0.88)` |
| Room panel with supported blur | `--kokpit-room-glass` | `rgba(26, 21, 17, 0.78)` |
| Room border | `--kokpit-room-border` | `rgba(215, 160, 109, 0.44)` |
| Room dock | `--kokpit-room-dock` | `rgba(24, 19, 16, 0.94)` |
| Room readability overlay | `--kokpit-room-shade` | `rgba(13, 11, 11, 0.30)` |
| Paper | `--kokpit-paper` | `#EEDFC1` |
| Paper ink | `--kokpit-paper-ink` | `#35251A` |
| Paper secondary text | `--kokpit-paper-muted` | `#665342` |
| Paper rule | `--kokpit-paper-rule` | `rgba(80, 54, 30, 0.19)` |
| Paper action and focus | `--kokpit-paper-accent` | `#85451D` |
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
| `--text-clock` | `112px` |
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
| Clock | Display serif | 400; letter spacing -0.035em; line height 0.92. |
| Quote | Display serif | 400 italic; FINAL Home line height 1.05. |
| Card heading | UI sans | FINAL Home 500; other functional headings may use 600. |
| Body | UI sans | 400; line height 1.5–1.65. |

FINAL Home clock uses `clamp(96px, 8vw, 140px)` on desktop, `clamp(80px, 12vw, 112px)`
on tablet, and 92px below 640px. `--text-clock` remains the shared 112px baseline;
the responsive Home treatment controls its rendered size.
It remains the strongest Home element without clipping or obscuring the date and quote.
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
| `--page-padding-x` | `32px` |
| `--page-padding-y` | `20px` |
| `--content-gap` | `18px` |
| `--section-gap` | `20px` |
| `--dock-clearance` | `120px` |
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
The spacing values above target large desktop screens (≥1440px). Brand/main containers
have a 1440px maximum width, with 32px horizontal padding and an 18px Home grid gap.
Page vertical padding is 20px, with a 16px top override on large desktops; the Home section
gap is 20px. On constrained desktops use 24px horizontal padding, 20px page vertical padding
and a 16px Home grid gap. Mobile horizontal padding is 16px. Reduce columns before text
becomes cramped. Sidebar widths from
DEC-051 are historical; the current shell has no sidebar or reserved sidebar space.

The owner reviewed the compact laptop follow-up and restored taller, roomier Home
proportions. Do not compress the composition based on viewport height to force every
panel above the fold; natural vertical scrolling is accepted. Desktop panels use 22px
padding, with a 22px/28px paper inset, and retain flexible minimum rows so real content
can grow. Desktop quote sizing is `clamp(34px, 3.6vw, 56px)`. Preserve aligned column
bottoms and sufficient scroll clearance above the dock. The manual dock visibility
control remains available at every viewport.

## Layout and navigation

Desktop is primary; target 1366px–1920px while remaining usable on smaller laptops.
The shared shell has a full-viewport warm room photograph, a readability overlay and a
floating bottom dock. No sidebar remains at any viewport. Very large screens use a
comfortable readable content width rather than stretching text indefinitely.
The background is decorative: a solid semantic fallback keeps every page usable if it fails.
The browser tabs, address bar, window controls and browser avatar in references are outside the app.

Dock order: Home, College, Music, News, Ideas, Library. Keep all six labeled links reachable,
including short viewports and narrow phones. Use a semantic navigation landmark, route-aware
active state, visible keyboard focus and bottom content clearance of
`120px + env(safe-area-inset-bottom, 0px)` so
the dock never obscures controls. It is shared across every route; do not add destinations.
An adjacent Hide navigation button collapses the six links into a small Show navigation
handle. The toggle remains reachable, exposes its expanded state and removes hidden links
from keyboard/screen-reader navigation. Visibility is session UI state, retained across
routes and reset on page reload; it is not stored as canonical content or a new preference.
Dedicated-page paths are conceptually `/home`, `/college`, `/music`, `/news`, `/ideas`,
and `/library`; actual routing belongs in [Architecture](../engineering/ARCHITECTURE.md).

| Dock item | Specification |
| --- | --- |
| Geometry | At least 44px usable target; compact spacing that keeps all six labels readable. |
| Inactive | Secondary text; transparent background. |
| Hover | Surface-hover background; primary text. |
| Active | Surface-active background; room border; primary text and accent-hover icon. |
| Icon | Lucide preferred; consistent 1.75–2px stroke; sizes 16, 18, 20, or 22px. |

Avoid oversized icons. Quick Links may use recognizable brand logos.

## Home composition

Home is an overview. Full feature implementations stay on dedicated pages.

```text
Hero: Clock + Date + Context line beside Quote, over the shared room atmosphere
Highlights: Music · College · Ideas · News · Quick Links
```

FINAL desktop arrangement, adapted to actual content rather than fixed screenshot heights:

| Region | Composition |
| --- | --- |
| Hero across main content | Large clock/date/context on the left; quote beside it on the right; both over the room atmosphere. |
| Left highlight stack | Translucent Music panel above cream ruled-paper Ideas capture. |
| Right highlight stack | Translucent College, News and Quick Links panels. |

Use two balanced columns with shared top and bottom boundaries. CSS grid areas follow
Music/College, Music/News, Ideas/News, Ideas/Links; flexible minimum rows let real content
expand naturally while aligning the two stacks' lower edges. Do not clip, hide or shrink
content to match a fixed image height. The four dark panels are Music, College, News and
Quick Links; Ideas is the distinct paper surface. Their different treatments distinguish
passive glances from the immediate capture action.
On narrow screens, use one column with a coherent reading and keyboard order:
hero → music → college → ideas → news → quick links. Layout changes must preserve
labels, usable controls, and the same product hierarchy.

Hierarchy: **Clock → Quote / atmosphere → Current music → Relevant current context
→ Feature previews → Navigation**. Do not make News more prominent than the clock.
The hero may merge into a room image; its content is context/greeting, time, date, quote,
and a source only when one genuinely exists. Quote attribution follows
[Content Sources](../features/CONTENT_SOURCES.md).
Use [the FINAL Home reference](references/home-final.png) as the primary atmosphere.
Reserve a visually secondary **another thought** action. Until Milestone 6, the existing
temporary unattributed thought remains explicitly temporary; this polish does not implement
the D1 quote pool or change the content strategy.

A new feature does not automatically deserve a Home widget. Ask whether it warrants
attention every time Kokpit opens; otherwise keep it on its own page.

### Atmospheric imagery

Use the local clean room photograph at `/images/room-background.webp` as the shared
full-viewport background. It is derived from the approved reference's atmosphere and
contains no interface text, controls or panels. The exact approved screenshot remains
a documentation reference, not a flattened interactive app. Prefer warm lamplight, desk,
books and a muted lived-in room; preserve a solid fallback and responsive cover crop.
The overlay and panel opacity protect clock, quote and functional text readability.
The same atmosphere continues behind readable foreground surfaces on feature pages.

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

Home's audio preview includes an accessible volume control even though it is absent from
the supplied screen. Use playback progress and real track metadata; do not copy EQ, warmth,
vinyl hardware, or lossless labels as capabilities without corresponding supported behavior.
Decorative audio bars are optional, must not pretend to measure sound, and must remain quiet.
Use current College material context rather than inventing a timetable or completion score.
Before Milestone 5, keep Music's honest empty state and label future playback controls
clearly as unavailable with native disabled behavior. Do not invent track metadata,
playback progress or personal records to populate the FINAL image. News likewise keeps
its honest empty state until its documented ingestion packages. Existing College context,
Ideas capture and Quick Links remain connected to their current APIs.

Music cover: `clamp(128px, 12vw, 184px)` square on desktop, 160px on tablet and
88px on mobile; radius-sm. The current honest empty state uses a neutral music icon.
Primary play button: 48px square with pill radius; the pre-Milestone-5 treatment is
disabled, with an accent-bg surface, strong border and accent icon.
Progress track: `rgba(255,255,255,0.10)`; filled progress: accent.
Home Quick Link tiles: at least 44px high, flexible 7rem basis, radius-sm,
accent-bg surface and a subtle border. The Add link is 44px square.

## Components and interaction states

Reuse focused components without excessive abstraction. Conceptual names include AppShell,
BottomNavigation / dock links, HomeHero / Clock / DynamicQuote,
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
| Input | Height 44px; surface-2; 1px default border; radius 12px; primary text; padding 0 14px. | Muted-text placeholder plus a persistent label; focus accent-muted border and `0 0 0 3px` accent-bg shadow. |
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

Keep a shared shell and restrained page header, with an optional short editorial heading.
Page-specific composition follows the reference, while controls expose the approved V1
behavior. Let real content determine card height; avoid clipped text, tiny metadata,
large statistic panels, and repeated card-inside-card borders.

| Page | Reference-led V1 composition |
| --- | --- |
| College | Semester selector above two aligned columns: course rows on the left; a recurring Weekly Schedule and Recent Files & Notes on the right. Keep Add semester/Add course, real descriptions and accessible edit/reorder controls. Course → Week → Material remains the content hierarchy. Schedule blocks open courses; View materials opens the selected semester's complete materials list. No deadlines, attendance, live class joins or progress scoring. |
| Ideas | Cream ruled-paper capture above an All Ideas card grid on the left; Collections and Favorite Ideas in a supporting right column. Optional title/tags/collection/cover never block quick capture. Search and tag filters stay visible; pins and favorite stars are distinct and consistent across views. Collection tiles filter ideas; New/View all open complete management views. Optional private covers use real owner images with a text-only fallback. |
| Library | A prominent shortcut grid with recognizable icon, name, and an Add shortcut tile. Expose editing, deletion, ordering, and Home favorites. Optional groups use the documented quick-link grouping. Search, if included, searches shortcuts locally; a right panel is unnecessary without useful shortcut content. Preserve the portal-grid character without a reading tracker or book vault. |
| Music | A large player/artwork on the left and library/search/playlist region on the right with aligned lower edges. File import, track menus, transport, seek/time, shuffle/repeat and volume are functional; All tracks/Playlists and New playlist lead to actual views. Playback stays mounted above routes. No mixer/grabber/DSP controls. |
| News | Category filters precede a lead article and supporting feed; Saved for Later and Trending Topics form the lower row. All article instances expose consistent bookmark state and original links. View saved opens the complete saved list; topics filter the feed and disclose their seven-day Kokpit-cache scope. Source imagery or neutral fallback only; no reading goals/charts or fabricated global trend statistics. |

Use Inter for functional page titles, controls, metadata, and article/idea previews;
reserve Cormorant Garamond for occasional expressive headings. Example text, source names,
counts, course names, tracks, and link destinations in the references are not production seeds.
An unsupported control must be omitted rather than displayed as a non-functional promise,
except the explicitly approved clearly disabled future music controls in this polish.
These compositions are approved requirements. Implement only the currently authorized package;
approval does not mark new persistence, integrations or UI controls as already delivered.

Keep desktop grid DOM/keyboard order stable; decorative masonry must not reorder focus.
Below desktop width, Ideas support sections follow capture/grid, Music stacks player and
library, and College converts its timetable into a readable day list. Do not hide weekend
classes, long filenames or additional collection/favorite/saved records to match a PNG.
No photo cover is required for an idea, track or publisher article to remain usable.

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
| Mobile: <640px | Stack hero, Music, College, Ideas, News, Quick Links; retain draft and reading order. Keep the six-link dock usable and clear of content. |
| Tablet: 640–1023px | Reduce columns when needed; retain the shared photograph and bottom dock. |
| Desktop: 1024–1439px | FINAL two-column Home composition and bottom dock; remain usable on smaller laptops. |
| Large desktop: ≥1440px | Comfortable readable content width and generous space. |

Do not force mobile to reproduce desktop exactly.
Collapse side panels below their associated content, reduce playlist/shortcut grids, and allow
filter chips to wrap without splitting individual labels. Avoid masonry libraries or fixed
screenshot-sized canvases. Navigation must still provide all six destinations accessibly.

## Accessibility and validation

Minimum requirements: keyboard navigation, visible focus, semantic controls, accessible labels,
reasonable text contrast, non-color-only states, heading hierarchy, and reduced-motion support.
Choose text tokens for the actual background and text role; having a token does not replace
contrast verification.
Normal readable text needs at least 4.5:1 contrast; large text needs at least 3:1.
The current soft-text token is approximately 3.75:1 on surface-1 and 3.52:1 on surface-2;
reserve it for non-essential decoration or qualifying large text. Muted text is approximately
5.99:1 on surface-1. Use muted or stronger text for small labels, timestamps, and placeholders.
These ratios cover flat token pairs, not image backgrounds, opacity, or interactive states;
verify the final rendered combinations. See [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

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
Compare against the repository [reference gallery](UI_REFERENCES.md) and the normalized
compositions in this document at the relevant UI validation step. Record a rendered capture
at a comparable desktop viewport, then check narrower layouts and interaction states.
Judge atmosphere, hierarchy, typography roles, geometry, and clarity; do not reproduce
browser chrome, broken assets, fabricated data, or reference-only feature controls.

## Semantic implementation mapping

Tailwind consumes these tokens through semantic names: `bg-app`, `bg-surface`,
`bg-surface-raised`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `accent-hover`,
`border-subtle`, and `border-default`.
Avoid scattered raw palette utilities such as `bg-zinc-950`, `text-stone-200`,
and `border-neutral-800`. Reuse the existing tokens and keep deeper feature pages functional.

> Does this still feel like a quiet personal digital room?

If the answer is no, review the design before implementing a new visual pattern.
