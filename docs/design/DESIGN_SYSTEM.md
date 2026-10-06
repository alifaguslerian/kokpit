# Kokpit — Design System

**Version:** 1.0  
**Status:** V1 Design Direction Locked  
**Product:** Kokpit  
**Theme:** Dark Cozy Editorial Workspace  
**Primary Platform:** Desktop Web  
**Reference:** Approved Kokpit dark visual concept  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document defines the visual language, interaction principles, design tokens, layout rules, and component behavior for Kokpit V1.

It is the source of truth for all UI implementation.

Any implementation created manually or by an AI coding agent must follow this document unless the design direction is explicitly revised.

Kokpit should feel like a **personal digital room**, not a productivity dashboard.

The interface should be calm enough to remain open for hours.

---

# 2. Design Philosophy

Kokpit is:

- calm
- personal
- warm
- dark
- elegant
- lightweight
- atmospheric
- spacious
- quiet
- intentional

Kokpit is not:

- an admin dashboard
- a productivity tracker
- a SaaS template
- a crypto dashboard
- a neon developer interface
- a gamer UI
- a corporate workspace
- a card-heavy widget wall

The main design principle:

> Kokpit should feel like somewhere the user wants to stay, not somewhere the user is being managed.

---

# 3. Core Visual Direction

Kokpit V1 uses a **dark cozy editorial visual language**.

The approved aesthetic combines:

- deep charcoal backgrounds
- warm amber / copper accents
- soft off-white typography
- elegant serif display type
- modern sans-serif UI text
- subtle borders
- soft elevated surfaces
- warm cinematic imagery
- rounded corners
- restrained shadows
- generous spacing

The visual atmosphere should resemble:

- a quiet room at night
- soft desk lighting
- a warm lamp
- books
- plants
- city lights
- a workspace near a window
- muted cinematic photography

The UI should remain functional even if all atmospheric imagery is removed.

Imagery enhances the mood but must never become structural.

---

# 4. Theme

## 4.1 Primary Theme

Kokpit V1 is **dark-first**.

A light mode is not required for V1.

The dark theme should not use absolute black as the dominant surface.

Darkness should feel warm and soft rather than cold or high-contrast.

---

# 5. Color Tokens

## 5.1 Core Backgrounds

```css
--kokpit-bg-base: #0D0B0B;
--kokpit-bg-app: #11100F;
--kokpit-bg-sidebar: #121110;

--kokpit-surface-1: #181615;
--kokpit-surface-2: #1F1C1A;
--kokpit-surface-3: #25211F;

--kokpit-surface-hover: #292421;
--kokpit-surface-active: #302821;
```

---

## 5.2 Text

```css
--kokpit-text-primary: #F3EBDD;
--kokpit-text-secondary: #D7C8B6;
--kokpit-text-muted: #A39280;
--kokpit-text-soft: #806F61;
--kokpit-text-disabled: #65594F;

--kokpit-text-inverse: #15110E;
```

Do not use pure `#FFFFFF` for normal text.

---

## 5.3 Accent

```css
--kokpit-accent: #D7A06D;
--kokpit-accent-hover: #E2B282;
--kokpit-accent-active: #C48A58;

--kokpit-accent-muted: #A7754E;

--kokpit-accent-bg: rgba(215, 160, 109, 0.12);
--kokpit-accent-bg-hover: rgba(215, 160, 109, 0.18);
--kokpit-accent-glow: rgba(215, 160, 109, 0.22);
```

Accent is intentionally limited.

It should mainly appear in:

- active navigation
- primary actions
- music progress
- selected items
- tiny indicators
- focus states
- subtle labels
- selected filters

Do not turn entire cards orange.

---

# 6. Semantic Colors

```css
--kokpit-success: #8FAF88;
--kokpit-warning: #D3A05F;
--kokpit-danger: #C9786C;
--kokpit-info: #819DBD;
```

Muted versions:

```css
--kokpit-success-bg: rgba(143, 175, 136, 0.12);
--kokpit-warning-bg: rgba(211, 160, 95, 0.12);
--kokpit-danger-bg: rgba(201, 120, 108, 0.12);
--kokpit-info-bg: rgba(129, 157, 189, 0.12);
```

Semantic colors should remain subdued.

---

# 7. Borders

```css
--kokpit-border-subtle: rgba(255, 244, 232, 0.06);
--kokpit-border-default: rgba(255, 244, 232, 0.10);
--kokpit-border-strong: rgba(255, 244, 232, 0.16);
```

Borders should visually separate surfaces without creating boxed-in layouts.

Cards should never look like spreadsheet cells.

---

# 8. Typography

Kokpit uses two primary typography families.

## 8.1 Display Typeface

Recommended:

```css
font-family: "Cormorant Garamond", Georgia, serif;
```

Use for:

- large clock
- large greeting
- quotes
- occasional expressive heading

Characteristics:

- elegant
- literary
- calm
- warm
- human

Do not use display serif for buttons, navigation, metadata, or dense functional UI.

> V1 font lock: Cormorant Garamond is the display font and Inter is the UI font. Comparing or replacing either family requires an explicitly approved design revision. Keep font families behind their semantic tokens.

---

## 8.2 Interface Typeface

Recommended:

```css
font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Use for:

- navigation
- cards
- buttons
- form controls
- metadata
- body content
- menus
- lists
- settings

---

# 9. Typography Tokens

```css
--font-display: "Cormorant Garamond", Georgia, serif;
--font-ui: "Inter", system-ui, sans-serif;
```

Recommended scale:

```css
--text-clock: 88px;
--text-display-xl: 48px;
--text-display-lg: 34px;
--text-display-md: 28px;

--text-heading-lg: 22px;
--text-heading-md: 18px;
--text-heading-sm: 16px;

--text-body-lg: 16px;
--text-body-md: 14px;
--text-body-sm: 13px;

--text-caption: 12px;
--text-micro: 11px;
```

Desktop clock may scale between:

```txt
72px → 96px
```

depending on viewport.

---

# 10. Typography Behavior

## Clock

```txt
Font: Display Serif
Weight: 400–500
Letter spacing: -0.02em
Line height: 0.95–1.0
```

## Quote

```txt
Font: Display Serif
Weight: 400
Style: Italic
Line height: 1.35–1.5
```

## Card Heading

```txt
Font: UI Sans
Weight: 600
```

## Body

```txt
Font: UI Sans
Weight: 400
Line height: 1.5–1.65
```

---

# 11. Layout Foundation

## Desktop Priority

The primary Kokpit experience is desktop.

Recommended base viewport target:

```txt
1366px – 1920px
```

The interface should remain usable at smaller laptop resolutions.

---

# 12. App Shell

Recommended structure:

```txt
┌───────────────┬──────────────────────────────────┐
│               │                                  │
│   Sidebar     │          Main Content            │
│               │                                  │
│               │                                  │
└───────────────┴──────────────────────────────────┘
```

Recommended measurements:

```css
--sidebar-width: 220px;

--page-padding-x: 24px;
--page-padding-y: 22px;

--content-gap: 16px;
--section-gap: 20px;
```

At very large screens, content may have a comfortable maximum readable width.

---

# 13. Sidebar

The sidebar contains:

```txt
Kokpit logo / name
Short tagline

Home
College
Music
News
Ideas
Library

Optional atmospheric visual near bottom
```

Do not add navigation items that are outside V1 scope.

---

# 14. Sidebar Navigation Item

Recommended dimensions:

```css
height: 44px;
padding-inline: 14px;
border-radius: 12px;
gap: 12px;
```

Inactive:

```css
color: var(--kokpit-text-secondary);
background: transparent;
```

Hover:

```css
background: rgba(255,255,255,0.035);
color: var(--kokpit-text-primary);
```

Active:

```css
background: var(--kokpit-accent-bg);
color: var(--kokpit-accent-hover);
```

Icons should use consistent stroke width.

---

# 15. Iconography

Preferred icon family:

```txt
Lucide
```

Recommended stroke:

```txt
1.75 – 2px
```

Typical icon sizes:

```txt
16px
18px
20px
22px
```

Avoid oversized icons.

Brand logos may be used inside Quick Links.

---

# 16. Radius System

```css
--radius-xs: 8px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 22px;
--radius-pill: 999px;
```

Recommended usage:

```txt
input        12–14px
button       12px
small card   14px
main card    18px
hero surface 22px
chips        pill
```

---

# 17. Spacing Tokens

Base spacing unit:

```txt
4px
```

Scale:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

Avoid arbitrary spacing where possible.

---

# 18. Surface System

Cards should use:

```css
background: var(--kokpit-surface-1);
border: 1px solid var(--kokpit-border-default);
border-radius: var(--radius-lg);
```

Secondary surfaces may use:

```css
background: var(--kokpit-surface-2);
```

Nested cards should be minimized.

Avoid:

```txt
card inside card inside card
```

Use spacing, typography, and subtle dividers instead.

---

# 19. Shadows

Recommended:

```css
--shadow-soft:
  0 4px 16px rgba(0,0,0,0.18);

--shadow-card:
  0 8px 28px rgba(0,0,0,0.26);

--shadow-float:
  0 12px 36px rgba(0,0,0,0.30);
```

Do not use dramatic floating shadows.

---

# 20. Home Page Structure

Home acts as an overview.

Home must not contain complete implementations of modules.

Recommended structure:

```txt
HOME

Hero
├── Clock
├── Date
├── Context line
├── Quote
└── Atmospheric visual

Highlights
├── Music
├── College
├── News
├── Ideas
└── Quick Links
```

---

# 21. Home Grid

Recommended desktop grid:

```txt
┌──────────────────────────────┬──────────────────────────┐
│                              │                          │
│       CLOCK / QUOTE          │     ATMOSPHERIC IMAGE    │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘

┌──────────────────────────────┬──────────────────────────┐
│          MUSIC               │         COLLEGE          │
└──────────────────────────────┴──────────────────────────┘

┌──────────────────────────────┬──────────────────────────┐
│          IDEAS               │          NEWS            │
└──────────────────────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     QUICK LINKS                         │
└─────────────────────────────────────────────────────────┘
```

This is not mandatory pixel-for-pixel.

The principle is more important:

> Home should preview features, not fully contain them.

---

# 22. Hero

Hero is the strongest atmospheric area of Home.

Recommended layout:

```txt
Greeting / contextual line

10:24:17 PM

Monday, Oct 6, 2026

"A calmer mind makes
a brighter tomorrow."

— source
```

The hero may visually merge into a background room image.

---

# 23. Hero Imagery

Recommended atmosphere:

- dark room
- warm lamp
- desk
- city outside
- plant
- books
- laptop
- soft amber light
- window reflection

Image treatment:

```css
filter:
  brightness(0.68)
  saturate(0.85)
  contrast(1.05);
```

Optional overlay:

```css
background:
  linear-gradient(
    90deg,
    rgba(13,11,11,0.98) 0%,
    rgba(13,11,11,0.78) 45%,
    rgba(13,11,11,0.15) 100%
  );
```

The image must never reduce clock readability.

---

# 24. Card Header Pattern

All feature highlight cards should generally follow:

```txt
[icon] Section Name                     Action →
```

Examples:

```txt
♫ Now Playing                 Open Music →

🎓 College                   Go to College →

▣ News                       See News →

💡 Ideas                      Open Ideas →

🔗 Quick Links              View Library →
```

Actual UI should use proper icons instead of emojis.

---

# 25. Music Highlight Card

Home music card is a preview.

Required:

```txt
Album Cover
Track Name
Artist
Favorite
Progress
Current Time
Duration
Previous
Play / Pause
Next
Optional Shuffle
Optional Repeat
Open Music CTA
```

Recommended album cover:

```txt
96–112px square
radius 12–14px
```

Primary play button:

```css
width: 48px;
height: 48px;
border-radius: 999px;
background: var(--kokpit-accent);
color: var(--kokpit-text-inverse);
```

Music progress:

```css
track:
rgba(255,255,255,0.10)

progress:
var(--kokpit-accent)
```

---

# 26. College Highlight

Home should not display the entire academic structure.

Show only:

```txt
Current Semester
Current Week
One relevant course
One next material / continuation
CTA to College
```

Example:

```txt
Semester 5

Week 5 of 16

Pemrograman Web

Next:
Week 05 — REST API
```

Keep it quiet.

Avoid progress gamification.

---

# 27. News Highlight

Home news preview:

```txt
Maximum recommended visible items:
2–3
```

Each item:

```txt
Thumbnail
Headline
Source
Time
```

Home does not need:

- full article body
- large category filters
- trending tables
- complex feed controls

Those belong on the News page.

---

# 28. Ideas Highlight

The Ideas preview is primarily a capture surface.

Recommended:

```txt
Ideas                         Open Ideas →

[ Jot down a thought...                     → ]
```

Optional quick tags:

```txt
Idea
Question
Random
Project
College
```

Tags must never be required.

The user should be able to type and save immediately.

---

# 29. Quick Links

Recommended tile:

```css
min-width: 72px;
height: 68px;

border-radius: 12px;
background: var(--kokpit-surface-2);
border: 1px solid var(--kokpit-border-subtle);
```

Quick links should display:

```txt
Brand icon
Label
```

Example:

```txt
GitHub
ChatGPT
Drive
Gmail
YouTube
Add
```

Avoid excessively colorful backgrounds.

Brand icons may retain recognizable brand colors.

---

# 30. Buttons

## Primary

```css
background: var(--kokpit-accent);
color: var(--kokpit-text-inverse);

border-radius: 12px;

transition:
  background 150ms ease,
  transform 120ms ease;
```

Hover:

```css
background: var(--kokpit-accent-hover);
```

Pressed:

```css
transform: scale(0.98);
```

---

## Secondary

```css
background: var(--kokpit-surface-2);
border: 1px solid var(--kokpit-border-default);
color: var(--kokpit-text-primary);
```

---

## Ghost

```css
background: transparent;
color: var(--kokpit-text-secondary);
```

Hover:

```css
background: rgba(255,255,255,0.04);
color: var(--kokpit-text-primary);
```

---

# 31. Inputs

Recommended:

```css
height: 44px;

background: var(--kokpit-surface-2);

border:
  1px solid var(--kokpit-border-default);

border-radius:
  12px;

color:
  var(--kokpit-text-primary);

padding:
  0 14px;
```

Placeholder:

```css
color: var(--kokpit-text-soft);
```

Focus:

```css
border-color: var(--kokpit-accent-muted);

box-shadow:
  0 0 0 3px var(--kokpit-accent-bg);
```

---

# 32. Tags and Chips

Recommended:

```css
height: 30px;

padding:
  0 12px;

border-radius:
  999px;

background:
  var(--kokpit-surface-2);

border:
  1px solid var(--kokpit-border-default);
```

Selected:

```css
background:
  var(--kokpit-accent-bg);

color:
  var(--kokpit-accent-hover);
```

---

# 33. Hover Behavior

Cards may subtly respond:

```css
transform: translateY(-1px);
border-color: var(--kokpit-border-strong);
```

Do not use:

```txt
large lift
dramatic scaling
glow explosions
```

Interaction should feel tactile but quiet.

---

# 34. Motion Tokens

```css
--motion-fast: 120ms;
--motion-default: 180ms;
--motion-slow: 240ms;

--ease-default:
  cubic-bezier(0.2, 0.8, 0.2, 1);
```

Use:

```txt
hover       120–180ms
button      120ms
card        180ms
page        200–240ms
modal       200ms
```

---

# 35. Page Transitions

Preferred:

```txt
opacity
+
very small translateY
```

Example:

```css
from:
opacity: 0;
transform: translateY(4px);

to:
opacity: 1;
transform: translateY(0);
```

Avoid large slide transitions.

---

# 36. Scrollbars

Custom scrollbars may be used subtly.

Recommended:

```css
scrollbar width:
8px

track:
transparent

thumb:
rgba(255,255,255,0.12)

hover:
rgba(255,255,255,0.20)
```

---

# 37. Dedicated Pages

Each major Kokpit module has its own page.

```txt
/home
/college
/music
/news
/ideas
/library
```

Exact routing may change during architecture design.

---

# 38. Music Page

May include:

- library
- playlists
- queue
- search
- playback controls
- import
- track management

Visual character should remain calm and music-focused.

Do not copy Spotify visually.

---

# 39. College Page

Recommended hierarchy:

```txt
Semester
└── Course
    └── Week
        └── Materials
```

UI should prioritize navigation and organization.

Avoid LMS visual complexity.

---

# 40. News Page

Focus on:

- readable feed
- curated content
- source transparency
- category filtering where useful
- article opening

Avoid sensational presentation.

---

# 41. Ideas Page

Primary function:

```txt
Capture
Browse
Search
Edit
Delete
```

Avoid turning Ideas into a full Notion-style editor.

---

# 42. Library Page

Quick links should be organized visually.

Possible future groups:

```txt
Daily
Development
College
Media
Tools
Other
```

Grouping is optional for V1.

---

# 43. Loading States

Avoid generic giant spinners.

Preferred:

```txt
skeleton
subtle pulse
existing cached content
```

Skeleton colors:

```css
background:
var(--kokpit-surface-2);

highlight:
rgba(255,255,255,0.03);
```

---

# 44. Empty States

Empty states should be quiet and concise.

Example:

```txt
No ideas yet.

Write something before it disappears.
```

Do not use giant illustrations.

---

# 45. Error States

Errors should be non-disruptive.

Example:

```txt
News couldn't refresh.

Showing your latest cached stories.
```

Prefer graceful fallback over error-heavy UI.

---

# 46. Image Treatment

Images should generally use:

```css
border-radius:
12px – 18px;

object-fit:
cover;
```

Avoid overly saturated assets.

Preferred visual tone:

```txt
warm
cinematic
natural
soft
slightly muted
```

---

# 47. Responsive Breakpoints

Suggested conceptual breakpoints:

```txt
mobile:
< 640px

tablet:
640px – 1023px

desktop:
1024px – 1439px

large desktop:
>= 1440px
```

These are guidance, not mandatory framework values.

---

# 48. Tablet Behavior

Sidebar may collapse into compact navigation.

Feature grids may change from:

```txt
2 columns
```

to:

```txt
1 column
```

or asymmetric layouts where appropriate.

---

# 49. Mobile Behavior

Mobile is not expected to replicate desktop exactly.

Prioritize:

- idea capture
- quick links
- news glance
- music controls
- college access
- clock

Atmospheric imagery may be reduced significantly.

---

# 50. Accessibility

Minimum requirements:

- keyboard navigation
- visible focus state
- sufficient text contrast
- semantic controls
- accessible labels
- non-color-only states
- proper heading hierarchy
- reduced-motion support

For users preferring reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms;
  transition-duration: 0.01ms;
}
```

---

# 51. CSS Root Token Reference

Suggested implementation:

```css
:root {
  --kokpit-bg-base: #0D0B0B;
  --kokpit-bg-app: #11100F;
  --kokpit-bg-sidebar: #121110;

  --kokpit-surface-1: #181615;
  --kokpit-surface-2: #1F1C1A;
  --kokpit-surface-3: #25211F;
  --kokpit-surface-hover: #292421;
  --kokpit-surface-active: #302821;

  --kokpit-text-primary: #F3EBDD;
  --kokpit-text-secondary: #D7C8B6;
  --kokpit-text-muted: #A39280;
  --kokpit-text-soft: #806F61;
  --kokpit-text-disabled: #65594F;
  --kokpit-text-inverse: #15110E;

  --kokpit-accent: #D7A06D;
  --kokpit-accent-hover: #E2B282;
  --kokpit-accent-active: #C48A58;
  --kokpit-accent-muted: #A7754E;

  --kokpit-accent-bg: rgba(215, 160, 109, 0.12);
  --kokpit-accent-bg-hover: rgba(215, 160, 109, 0.18);
  --kokpit-accent-glow: rgba(215, 160, 109, 0.22);

  --kokpit-border-subtle: rgba(255, 244, 232, 0.06);
  --kokpit-border-default: rgba(255, 244, 232, 0.10);
  --kokpit-border-strong: rgba(255, 244, 232, 0.16);

  --kokpit-success: #8FAF88;
  --kokpit-warning: #D3A05F;
  --kokpit-danger: #C9786C;
  --kokpit-info: #819DBD;

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-ui: "Inter", system-ui, sans-serif;

  --radius-xs: 8px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --sidebar-width: 220px;

  --shadow-soft:
    0 4px 16px rgba(0,0,0,0.18);

  --shadow-card:
    0 8px 28px rgba(0,0,0,0.26);

  --shadow-float:
    0 12px 36px rgba(0,0,0,0.30);

  --motion-fast: 120ms;
  --motion-default: 180ms;
  --motion-slow: 240ms;

  --ease-default:
    cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

# 52. Optional Tailwind Mapping

If Kokpit later uses Tailwind, the design tokens should map to semantic names rather than raw color names.

Preferred semantic usage:

```txt
bg-app
bg-sidebar
bg-surface
bg-surface-raised

text-primary
text-secondary
text-muted

accent
accent-hover

border-subtle
border-default
```

Avoid implementation code like:

```txt
bg-zinc-950
text-stone-200
border-neutral-800
```

throughout the entire project.

Components should consume Kokpit semantic tokens.

This allows future theme changes without rewriting every component.

---

# 53. Component Naming Guidance

Recommended conceptual components:

```txt
AppShell

Sidebar
SidebarNav
SidebarNavItem

HomeHero
Clock
DynamicQuote

FeatureCard

MusicPreview
CollegePreview
NewsPreview
IdeaCapture
QuickLinksPreview

Button
IconButton

Input
Textarea

Chip
Badge

EmptyState
ErrorState
Skeleton
```

Names may change depending on final architecture.

The important principle is component reuse without excessive abstraction.

---

# 54. Component State Requirements

Every interactive component must define:

```txt
default
hover
focus
active
disabled
loading where relevant
```

Do not implement only the default visual state.

---

# 55. Design Anti-Patterns

Never introduce without explicit design revision:

```txt
bright purple gradients

neon cyan

cyberpunk visuals

RGB glow

massive glass blur

floating glass cards everywhere

giant productivity statistics

streaks

XP

badges for engagement

progress charts on Home

oversized dashboards

dense information tables

random pastel card colors

AI sparkle icons everywhere

generic illustrations

unnecessary animations

excessive gradients

heavy shadows

large border outlines

pure white text

pure black surfaces
```

---

# 56. Home Density Rule

The Home screen must remain visually quiet.

If a new feature is added to Kokpit later, it does not automatically deserve a Home widget.

Home should only surface modules that benefit from immediate glance or quick access.

When adding something to Home, ask:

> Does this information deserve attention every time Kokpit opens?

If the answer is no, keep it inside its dedicated page.

---

# 57. Visual Hierarchy

Home hierarchy should generally be:

```txt
1. Clock
2. Quote / atmosphere
3. Current music
4. Relevant current context
5. Feature previews
6. Navigation
```

The Home screen should not visually prioritize news over the clock.

---

# 58. Brand Tone

The Kokpit wordmark should feel understated.

Preferred style:

```txt
Kokpit
```

Do not use:

```txt
KOKPIT AI
Kokpit OS
Kokpit Workspace Pro
Kokpit Dashboard
```

unless product direction changes.

Kokpit should remain personal.

---

# 59. Design Decision Rules for AI Agents

AI agents implementing Kokpit must:

1. Follow this document before inventing new visual patterns.

2. Reuse existing Kokpit design tokens.

3. Avoid hardcoding arbitrary colors.

4. Avoid adding new font families.

5. Avoid introducing unrelated component libraries purely for appearance.

6. Avoid expanding Home density.

7. Keep feature pages more functional than Home.

8. Preserve the warm dark visual identity.

9. Prefer simple layouts over decorative complexity.

10. Avoid generic AI SaaS aesthetics.

---

# 60. Final Design Lock

Kokpit V1 visual direction is:

> **Dark Cozy Editorial Workspace**

The defining characteristics are:

```txt
deep warm charcoal background

soft off-white typography

warm copper accent

large elegant serif clock

clean sans-serif functional UI

cozy nighttime atmosphere

restrained rounded cards

subtle borders

soft shadows

minimal interaction motion

feature highlights on Home

dedicated pages for deeper functionality

high whitespace

low visual pressure
```

The final validation question for every UI decision is:

> Does this still feel like a quiet personal digital room?

If the answer is no, the design should be reconsidered.
