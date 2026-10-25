# Kokpit — UI References

**Status:** FINAL Home direction approved for implementation; older screens retained
**Received:** FINAL 2026-10-25; Stitch 2026-10-10 | **Source:** Owner-supplied images

The FINAL Home image is the highest-priority visual reference: a full-viewport warm room,
clock and quote beside each other, four translucent dark panels, cream ruled Ideas capture,
and six-link floating bottom navigation with no sidebar. The owner explicitly approved
implementing this polish on 2026-10-25. The earlier Stitch screens remain historical Home
directions and supporting references for distinct feature-page compositions.
The [Design System](DESIGN_SYSTEM.md) defines the normalized implementation; the
[PRD](../product/PRD.md) defines behavior. See
[DEC-053](../product/DECISIONS.md#dec-053--final-room-home-and-shared-bottom-navigation)
and historical [DEC-051](../product/DECISIONS.md#dec-051--stitch-visual-references-and-refined-v1-layouts).

These are design references, not screenshots of implemented Kokpit. Browser chrome,
broken images, missing-icon squares, sample content, and capability claims must not be
copied into the app. The PNGs are retained unchanged for comparison; they are documentation
assets, not runtime images or an asset pack for extracting album covers/logos/photos.
The runtime `/images/room-background.webp` is a separate clean photograph derived from
the approved room atmosphere; it contains no baked-in interface. Current real data and
honest empty states take precedence over populated example records in any reference.

## FINAL Home implementation reference

The approved source is `ChatGPT Image Oct 25, 2026, 06_57_16 AM.png`, preserved as
[home-final.png](references/home-final.png). Compare the implemented desktop view with
this reference before using either older Home screenshot. Preserve the current APIs,
College course/week context, Ideas capture and Quick Links behavior. Music and News
remain empty until their documented integrations; future music controls may be visible
only when clearly disabled. The existing thought remains temporary until Milestone 6.

Use the reference's left Music/Ideas and right College/News/Quick Links stacks with
aligned lower edges and content-driven expansion. On mobile keep the DOM/keyboard order
Music → College → Ideas → News → Quick Links. Normalize functional serif text to Inter;
Cormorant Garamond stays with clock, quote and expressive text. No additional font is approved.

![Approved FINAL Home reference with warm room background, translucent panels, cream Ideas capture and bottom dock](references/home-final.png)

## Earlier Stitch screen map

| Screen | Repository asset | Original attachment | Dimensions |
| --- | --- | --- | --- |
| Home — historical dark atmosphere | [home.png](references/home.png) | `screen.png` | 1600 × 1240 |
| College | [college.png](references/college.png) | `screen (1).png` | 1600 × 1240 |
| Ideas | [ideas.png](references/ideas.png) | `screen (2).png` | 1600 × 1280 |
| Library | [library.png](references/library.png) | `screen (3).png` | 1600 × 1280 |
| Music | [music.png](references/music.png) | `screen (4).png` | 1600 × 1240 |
| News | [news.png](references/news.png) | `screen (5).png` | 1600 × 1280 |
| Home — alternate composition | [home-alternate.png](references/home-alternate.png) | `screen (6).png` | 1600 × 1240 |

## Visual analysis and adjustments

| Aspect | Reference observation | Implementation direction |
| --- | --- | --- |
| Palette | Warm near-black backgrounds and cream text; Home/News use darker copper while other pages lean toward lighter peach. | Retain the semantic charcoal/copper palette. Avoid assigning separate themes to individual modules or sampling arbitrary PNG pixels as CSS values. |
| Shell | Earlier screenshots use a roughly 280px sidebar. | Superseded by FINAL: use the shared six-link bottom dock, no sidebar, and a full-viewport room background. Exclude the browser frame. |
| Surfaces | Main cards have approximately 18–22px corner radii and 24px separation. College has many nested outlines. | Use existing radius tokens; retain spacious separation and replace unnecessary nested cards with dividers. |
| Typography | Home balances serif expression and sans-serif controls. Feature pages use serif more widely; some decorative text looks handwritten. | Keep Cormorant Garamond + Inter and their documented roles. Use Inter for readable functional content; add no third font. |
| Hierarchy | A prominent Home clock and full-width feature headers establish each room. | Preserve distinct page compositions without adding panels solely to fill the reference layout. |
| Icons and images | Several glyphs/images are missing; some pills and labels wrap awkwardly or clip. | Use proper labeled icons, real permitted assets, neutral fallbacks, flexible text, and controls sized for interaction. |
| States | Only populated desktop states are supplied. | Design loading, empty, error, keyboard focus, and responsive behavior through Design System; the screenshots do not prove those states work. |

## Mapping to V1

The following mapping keeps the supplied appearance useful within the documented product.
Reference-only items below are not an approved backlog or additional package requirements.
If the owner later requests them, resolve the relevant PRD, data, provider, and privacy
contracts before implementation.

| Page | Preserve in the V1 layout | Adapt or omit from the raw reference |
| --- | --- | --- |
| Home | FINAL room atmosphere, clock/quote beside each other, left Music/Ideas and right College/News/Quick Links with aligned lower edges. | Preserve capture and real College/Quick Links data. Music/News stay honest until integrations exist; clearly disable future music controls. Quote remains temporary until Milestone 6. Do not copy sample personal records or attribution. |
| College | Semester context, course grid, weekly resources, material actions. | Calendar sync, live schedules, deadlines, midterm/course progress, office hours, freelance workspace, and autosaved scratchpad are outside the current material-organizer contract. A week count must come from the course, not a fixed fourteen-week rule. |
| Ideas | Immediate composer, optional quick tags, readable saved/pinned ideas, dates and previews. | Make required search visible. Notebooks, journal prompts, revision history, and project-progress controls are not current V1 workflows. Do not claim a local encrypted vault or sync subsystem. Technology described inside an example idea is content, not Kokpit architecture. |
| Library | Portal grid, icon/name, add tile, optional shortcut grouping. | Reading shelf, book/highlight vaults, chapter progress, annual goals, and unread-mail integration are outside Quick Links. Existing shortcut favorites and ordering remain supported. |
| Music | Main player, artwork, transport, seek/time, volume, playlists and library. | Provide personal-file import. Tape remastering, hardware/codec claims, EQ/saturation, ambient layering, and stream grabbing/transcoding are not native-player capabilities. A vinyl visual may be restrained decoration. |
| News | Lead article, category filters, source/time, short summary, original link, supporting feed. | Use approved coverage/sources. Bookmarks, digest settings, fabricated reading/statistical metrics, and copied full publisher articles are not defined V1 behavior. Imagery must be relevant or clearly a neutral fallback. |

## Original Stitch screens retained for history and feature-page support

<details>
<summary>Home — primary dark atmosphere</summary>

![Stitch Home reference with dark room hero and two-column highlights](references/home.png)

</details>

<details>
<summary>College</summary>

![Stitch College reference showing semester context, course grid and resource side panels](references/college.png)

</details>

<details>
<summary>Ideas</summary>

![Stitch Ideas reference showing a composer above saved idea cards](references/ideas.png)

</details>

<details>
<summary>Library</summary>

![Stitch Library reference showing a grid of website portals](references/library.png)

</details>

<details>
<summary>Music</summary>

![Stitch Music reference showing a large player and playlist grid](references/music.png)

</details>

<details>
<summary>News</summary>

![Stitch News reference showing a lead article and editorial feed](references/news.png)

</details>

<details>
<summary>Home — alternate; bright hero placeholder is not the target treatment</summary>

![Alternate Stitch Home reference with the same highlight arrangement](references/home-alternate.png)

</details>
