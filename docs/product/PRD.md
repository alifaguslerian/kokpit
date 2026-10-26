# Kokpit — Product Requirements

**Version:** 0.3 — Owner-approved feature-page scope
**Status:** V1 product specification
**Owner:** Single user / workspace owner
**Last updated:** 2026-10-25

This document defines what Kokpit is and what V1 must do.
Implementation, storage, content pipelines, and visual tokens belong to the linked specifications.
The owner approved the latest feature-page references on 2026-10-25 and requested working
behavior for every visible control. [Approved UI Features](../features/APPROVED_UI_FEATURES.md)
defines the interaction contract; [DEC-054](DECISIONS.md#dec-054--approved-feature-pages-and-functional-scope)
records the scope revision. These requirements include pending implementation work.

## Product vision

Kokpit is a private personal web workspace: a **personal digital room** the owner wants
to open at the start of a computer session and keep open throughout the day.
It brings college materials, music, news, ideas, and frequently used websites together
without replacing every specialized application.

The problem is recurring friction: reopening websites, remembering where materials were
stored, checking scattered news sources, and losing spontaneous ideas.
Kokpit reduces that friction without adding deadlines, metrics, or a management system.

> Kokpit should not make the user feel managed. It should make the user want to stay.

### Target usage

V1 serves one owner who studies university material, builds software, follows technology
and AI developments, browses the web, listens to music, and collects ideas.
Optimize for the owner's habits rather than a general SaaS audience.

Desktop and laptop browsers are primary. Mobile should support useful lightweight actions,
especially quick idea capture. Mobile need not reproduce the desktop layout exactly.

### Product principles

| Principle | Requirement |
| --- | --- |
| Calm by default | Avoid unnecessary counters, alerts, streaks, and competing content. |
| Low friction | Save ideas immediately, open shortcuts in one click, access playback easily. |
| Personal before universal | Support the owner's usage without accommodating every workflow. |
| Lightweight | More functionality must not automatically create more visible interface. |
| Modular | Keep College, Music, News, Ideas, and Library independent enough to evolve. |
| Intentional scope | Add a feature only through an explicit product decision. |

## Frozen V1 scope

| Area | Product responsibility |
| --- | --- |
| Home | Local clock, date, atmosphere, quote, persistent music access, restrained previews. |
| Quotes | Dynamic short thoughts on Home; not a separate primary navigation destination. |
| Music | Personal audio library, playlists, controls, persistent playback. |
| News | Curated technology/world information, saved article references and topics derived from its feed. |
| College | Semester → Course → Week → Material, a recurring class timetable and recent materials. |
| Library / Quick Links | One-click launchpad for frequently visited websites. |
| Ideas | Fast capture/search, lightweight collections, independent favorites/pins and optional private covers. |

These are seven product areas and six primary navigation destinations.
Quotes are part of Home rather than an additional module page.

## Home

Home establishes atmosphere and provides immediate access to selected information.
It is a highlight surface, not the complete implementation of every module.

### Clock and date


- Show current local time and update it automatically in real time.
- Make the clock a major visual element; date information stays secondary.
- Preserve readability when atmospheric imagery is used.

### Quote


- Display a short dynamic thought rather than relying exclusively on a small frontend array.
- Support motivation, reflection, life, ambition, uncertainty, struggle, sadness, loneliness,
  calmness, technology, creativity, and relatable everyday thoughts.
- Avoid generic motivational phrases; quiet or reflective hours are valid.
- The primary quote changes at each local clock-hour boundary and normally stays stable
  across refreshes during that hour.
- English is primary (~90%); Indonesian represents ~10% over time.
- Provide the visually secondary **another thought** action in V1. Using it is optional;
  it displays an alternate without changing the scheduled hourly selection.
- Do not fabricate authors or send private owner content into quote generation.

Generation, quality filters, caching, fallback, and language selection are defined in
[Content Sources](../features/CONTENT_SOURCES.md).
Hourly behavior and the secondary action reflect approved DEC-048 in [Decisions](DECISIONS.md).

### Music access and previews


- Expose at least play, pause, previous, next, track information, and volume on Home.
- Playback continues while navigating between Kokpit sections.
- Small previews may show useful news, college context, ideas, or quick links.
- Keep previews secondary; use dedicated pages for deeper functionality.
- A future feature does not automatically earn a Home card. Surface it only if the owner
  benefits from seeing or accessing it almost every time Kokpit opens.

Home hierarchy and preview patterns belong in the [Design System](../design/DESIGN_SYSTEM.md).

## Music

Music is a personal audio library that can stay active while the owner uses other modules.
Core functionality must not depend on a paid music subscription.

### Required capabilities


- Maintain a personal library and manage stored music.
- Import files the owner owns or has permission to store.
- Play and pause tracks; skip forward and backward.
- Control volume and view track information.
- Create playlists, add tracks, remove tracks, and reorder playlist contents.
- Continue playback across route navigation.
- Search real tracks by title, artist or album; switch between library and playlists.
- Make shuffle, repeat, seek, volume and visible management menus functional.
- Manage optional private track artwork without blocking audio import/playback.

External media links may be supported through compatible providers or import mechanisms
where technically and legally supported. They do not replace the core owned-file flow.
V1 must not depend on unofficial scraping or downloading from restricted platforms.
Platform-specific integrations remain optional later adapters.

Playback lifetime and private streaming are specified in [Architecture](../engineering/ARCHITECTURE.md).

## News

News offers useful awareness without becoming a general news portal.
Prioritize signal over volume and minimize duplicate coverage of the same event.
The owner's interests may evolve later without requiring all articles to be displayed.

### Interest coverage

| Area | Coverage |
| --- | --- |
| Technology | AI, software engineering, developer tools, cybersecurity, computing. |
| Industry | NVIDIA, major tech companies, social platforms, notable technology leaders. |
| Discovery | Research, emerging products, emerging technologies. |
| World awareness | Major global events, geopolitical developments, meaningful conflicts. |

### Reading experience


- Each item should ideally show a headline, source, publication time, short summary,
  and original article link.
- Where feasible, explain briefly **why the story matters**.
- Preserve source transparency and a readable, curated feed.
- Ingestion, news listing, original links, and basic relevance continue without AI enrichment.
- If refresh fails, cached news remains useful and other modules keep working.
- Save and unsave article references; browse every saved item beyond the short preview.
  Saved articles survive ordinary cleanup until unsaved, without storing full publisher pages.
- Show Trending Topics derived from the last seven days of Kokpit's deduplicated cache.
  Selecting a topic filters the feed; this is not a claim of global popularity.
- Category and topic filters, original links, bookmark controls and View saved must work
  without AI enrichment. No reading metrics, goals or digest-settings subsystem is added.

Source lists, refresh schedules, scoring, summaries, and fallback are canonical in
[Content Sources](../features/CONTENT_SOURCES.md).

## College

College organizes academic material more clearly than a folder while staying simpler than an LMS.

```text
Semester → Course → Week → Material
```

### Required capabilities

| Level | Owner actions and constraints |
| --- | --- |
| Semester | Create, rename, archive or remove, and enter its workspace. |
| Course | Create, rename, organize, remove, and access materials within a semester. |
| Week | Organize weekly sections within each course; do not artificially fix the week count. |
| Material | Add, view, download, rename, move, and remove where appropriate. |

Materials include PDFs, PowerPoint and Word documents, images, text files, code files,
links, and other useful academic files. File handling follows documented validation;
this list does not bypass security checks or imply every format has an embedded preview.

The overview also provides an owner-maintained weekly class timetable for the selected
semester: course, weekday, local start/end time and optional room. The owner can add,
edit and delete entries; blocks open the corresponding course. Use the saved owner
timezone, include weekend classes and preserve overlapping entries. This is a narrow
recurring-class schedule, not general calendar management, calendar sync or reminders.

Recent Files & Notes shows the selected semester's most recently updated materials,
including uploaded Markdown/text notes, and opens the real private file or original link.
View materials opens a paginated semester-wide list with course/week context. No separate
notebook or tracking log is needed. Course descriptions are optional editable plain text.

Optional course icons or identifying colors may be considered later where appropriate;
they are not a required V1 expansion.
Storage fields and deletion behavior belong in [Data Model](../engineering/DATA_MODEL.md).

## Library / Quick Links

Quick Links is the owner's personal internet launchpad.
It should feel integrated into Kokpit and remove repeated navigation friction.

### Required capabilities


- Create a shortcut with a name and URL.
- Optionally assign an icon.
- Edit, delete, and reorder shortcuts.
- Open a shortcut quickly, normally in one click.

Links may point to online tools, documentation, university systems, media, or project resources.
Examples in specifications are illustrative, not production seed records.
Optional group assignment, favorites and group/Favorites filters are part of the approved
Library layout; groups need not exist before a shortcut can be saved. Keep keyboard-accessible
ordering and edit/delete actions. See the [Design System](../design/DESIGN_SYSTEM.md).

## Ideas

Ideas captures spontaneous thoughts before they disappear.
**Speed of capture is the most important requirement.**

### Required capabilities


- Quickly create an idea using freeform text.
- Optionally add a title; record creation time automatically.
- Edit and delete existing ideas.
- Browse saved ideas and search their content.
- Support optional lightweight tags without requiring categorization before saving.
- Browse All Ideas as a readable responsive card grid; text-only ideas remain complete.
- Favorite/unfavorite independently of pinning, with a short favorite preview and full view.
- Create, rename, order and delete lightweight collections; select one to filter ideas.
  An idea belongs to zero or one collection; deleting a collection preserves its ideas.
- Assign/clear a collection and optionally upload/replace/remove a private cover in the
  edit form. Cover management must not slow quick capture or become a general attachment editor.
- Combine search, tag, collection and favorite filters; every saved item remains reachable.

Tags may express topics such as project, college, random, design, or minecraft.
These are examples, not mandatory taxonomy or fake owner data.
Avoid complex forms, organization workflows, and a full Notion-style editor.

## Navigation and search

Provide direct access to Home, College, Music, News, Ideas, and Library / Quick Links.
Avoid deeply nested global navigation; hierarchy belongs inside modules such as College.
Navigation patterns belong in the [Design System](../design/DESIGN_SYSTEM.md).

Ideas search is required. Other modules may offer relevant local search;
College should make locating material easy as implementation progresses.
Universal search, global semantic search, and a command palette are outside initial V1.

## Shared product requirements

| Concern | Requirement | Canonical detail |
| --- | --- | --- |
| Privacy | V1 is private and single-user; personal data and files must not be public by default. | [Architecture](../engineering/ARCHITECTURE.md) |
| Ownership | Keep practical owner control over ideas, settings, links, playlists, academic material, and files. | [Data Model](../engineering/DATA_MODEL.md) |
| Resilience | Retain cached news / previous quote or show a subtle unavailable state; isolate provider failures. | [Content Sources](../features/CONTENT_SOURCES.md) |
| Performance | Avoid blocking requests, cache external content, prevent unrelated modules from slowing down. | [Architecture](../engineering/ARCHITECTURE.md) |
| Deployment | Cloudflare-compatible, inexpensive or free for normal personal usage. | [Deployment](../engineering/DEPLOYMENT.md) |
| Visual experience | Quiet, spacious, warm, personal, intentional, unobtrusive; comfortable for long sessions. | [Design System](../design/DESIGN_SYSTEM.md) |

Avoid unnecessary proprietary dependencies when a simpler self-controlled solution exists.
Visual effects must not significantly degrade responsiveness.

## Non-goals

Do not implement these in V1 without an explicit specification revision:


- Task management, kanban, project management, calendar management, time tracking.
- Habit tracking, Pomodoro, focus timers, productivity scores, streaks, XP, gamification.
- Email clients, chat, messaging, embedded AI chatbots, AI assistant panels, automatic coding agents.
- Public signup or accounts, account switching, public profiles or feeds, multi-user workspaces,
  team collaboration, social features.
- Complex analytics dashboards, a full note-taking application, universal command palettes,
  global semantic search, native mobile applications.

Do not reshape Kokpit into enterprise software, an admin panel, analytics or cryptocurrency
dashboard, generic AI SaaS, or a collection of visually competing cards.
Future reconsideration does not authorize adding any of these now.

The approved recurring College class timetable is the sole exception to calendar management.
Ideas collections are flat groups rather than notebooks; favorites and saved News are owner
references rather than social bookmarks, reading trackers or offline publisher archives.

## V1 success criteria

V1 succeeds when the owner can use Kokpit repeatedly as an everyday workspace:


- Open it and immediately see local time and dynamic content.
- Play and manage personal music without interruption during navigation.
- See relevant current news and follow original sources.
- Organize and access university material through the college hierarchy.
- Launch frequently visited websites with low friction.
- Capture an idea immediately and retrieve it later.
- Use every core section without a crowded or heavy interface.
- Access the deployed workspace securely from the web.
- Extend the codebase later without rebuilding its foundation.

## Product boundary and execution

> Does this make Kokpit a better personal digital space, or does it merely make Kokpit larger?

A proposal that mainly adds complexity, management overhead, visual noise, or maintenance
burden requires an explicit scope decision. Agents implement the documented task and stop
at its boundary; they must not independently redefine the product.

See [AGENTS](../../AGENTS.md) for working rules,
[Implementation Plan](../planning/IMPLEMENTATION_PLAN.md) for phased delivery,
[File Structure](../engineering/FILE_STRUCTURE.md) for placement, and
[Decisions](DECISIONS.md) for approved reasoning and historical resolutions.
