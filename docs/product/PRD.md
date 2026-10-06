# Kokpit — Product Requirements Document

**Version:** 0.1 — V1 Draft  
**Status:** Pre-Implementation  
**Product:** Kokpit  
**Type:** Personal Web Workspace  
**Primary User:** Single user / owner  
**Deployment Target:** Cloudflare  
**Source of Truth:** This document defines the product scope for Kokpit V1.

---

# 1. Product Overview

**Kokpit** is a personal web workspace designed to become the user's primary digital space for everyday activity.

It is intended to be opened frequently throughout the day while studying, building projects, browsing, listening to music, reading news, collecting ideas, or simply spending time at the computer.

Kokpit is not intended to behave like a traditional productivity dashboard.

It should feel more like a **personal digital room**: calm, lightweight, familiar, useful, and pleasant enough to remain open for long periods.

The product should help bring together several parts of the user's digital life without attempting to replace every specialized application.

---

# 2. Product Vision

Kokpit should become the default browser destination when the user starts using their computer.

Instead of repeatedly opening separate bookmarks, folders, news sites, music players, college material directories, and temporary notes, Kokpit provides a single personal environment where these things can be accessed naturally.

The product should feel:

- calm
- personal
- lightweight
- flexible
- fast
- useful without demanding attention
- expandable over time

The guiding principle is:

> Kokpit should not make the user feel managed. It should make the user want to stay.

---

# 3. Problem

The user's digital activity is currently distributed across many disconnected places.

Common examples include:

- frequently visited websites
- college materials
- music
- technology news
- project resources
- random ideas
- files and links

This creates small but repeated friction.

The user may need to remember where something was stored, reopen the same websites repeatedly, search for previously downloaded materials, or lose an idea because there was no frictionless place to save it.

Traditional productivity tools often solve this by introducing more management:

tasks, dashboards, deadlines, metrics, kanban boards, productivity scores, and complex organization systems.

Kokpit intentionally takes a different approach.

It reduces friction without turning everyday activity into another productivity system.

---

# 4. Target User

Kokpit V1 is designed primarily for **one person: its owner**.

The user regularly:

- studies university material
- builds software projects
- follows technology and AI developments
- browses the web
- listens to music while working
- collects ideas spontaneously
- repeatedly visits the same online tools and websites

Kokpit does not need to optimize for a general public audience in V1.

Product decisions should prioritize the owner's actual usage rather than generic SaaS conventions.

---

# 5. Product Principles

## 5.1 Calm by Default

The interface should avoid visual pressure.

Kokpit should not display unnecessary counters, alerts, progress indicators, streaks, productivity scores, or attention-grabbing elements.

Information should appear when useful without competing aggressively for attention.

---

## 5.2 Low Friction

Frequently performed actions should require as few interactions as reasonably possible.

Examples:

Saving an idea should be almost immediate.

Opening a frequently used website should require one click.

Playing music should not require navigating through several pages.

Returning to college material should be straightforward.

---

## 5.3 Personal Before Universal

Kokpit does not need to accommodate every possible user workflow.

Features may intentionally reflect the owner's habits, interests, and preferred way of organizing information.

---

## 5.4 Lightweight

The product should remain responsive and visually simple even as features grow.

Adding functionality must not automatically mean adding more visible interface.

---

## 5.5 Modular and Expandable

V1 is only the foundation.

Future features should be addable without redesigning the entire product.

Individual areas such as College, Music, News, Ideas, and Library should remain sufficiently independent from one another.

---

## 5.6 No Feature for Feature's Sake

A feature should exist because it improves the owner's real usage of Kokpit.

Kokpit should not add features merely because they are common in productivity apps.

---

# 6. Kokpit V1 Scope

Kokpit V1 consists of seven primary product areas:

**Home, Quotes, Music, News, College Space, Quick Links, and Idea Space.**

These define the frozen V1 product scope.

---

# 7. Home

## Purpose

Home is the central atmosphere of Kokpit.

It should be useful immediately after opening the application without becoming a crowded dashboard.

Home should communicate time, atmosphere, and selected useful information.

## Core Elements

Home must include:

### Real-Time Clock

The current local time should update automatically in real time.

Date information may accompany the clock but should remain visually secondary.

The clock is a major visual element of Home.

---

### Dynamic Quote

Home displays a short piece of text that changes periodically.

The content must not rely exclusively on a small static array hardcoded inside the frontend.

Quotes may include different emotional and thematic tones, including:

- motivation
- reflection
- life
- ambition
- uncertainty
- struggle
- sadness
- loneliness
- calmness
- technology
- creativity
- relatable everyday thoughts

The system should avoid repeatedly producing generic motivational phrases.

Quote delivery should eventually support dynamic sourcing, generation, caching, or a combination of these mechanisms.

The exact content pipeline will be defined separately in `CONTENT_SOURCES.md`.

---

### Music Mini Player

The currently playing track should be accessible from Home.

At minimum, the mini player should expose:

- play
- pause
- previous
- next
- track information
- volume

Music playback should be able to continue while navigating between Kokpit sections.

---

### Lightweight Content Preview

Home may surface small previews from other Kokpit modules when useful.

Examples include recent ideas, selected news, or recently accessed content.

These previews must remain secondary.

Home must never become a dense widget dashboard.

---

# 8. Music

## Purpose

Music provides a personal audio library that can remain active while the user uses other parts of Kokpit.

The feature should not depend on a paid music subscription.

## Required Capabilities

The user must be able to:

- maintain a personal music library
- play and pause tracks
- skip forward or backward
- control volume
- view track information
- create playlists
- add tracks to playlists
- remove tracks
- reorder playlist contents
- manage stored music
- continue playback while navigating through Kokpit

Music files that the user owns or has permission to store should be directly importable.

Support for external media links may be implemented through compatible providers or import mechanisms where technically and legally supported.

Kokpit V1 must **not depend on unofficial scraping or downloading from restricted platforms** for its core music functionality.

Platform-specific integrations can be added later as optional adapters.

---

# 9. News

## Purpose

News gives the user a lightweight way to stay aware of developments that are likely to be relevant or intellectually useful.

It should not behave like a general news portal.

## Primary Interests

Content should prioritize areas such as:

- artificial intelligence
- software engineering
- technology
- developer tools
- cybersecurity
- computing
- NVIDIA
- major technology companies
- social platforms
- notable technology leaders
- research
- major global events
- geopolitical developments
- conflicts with meaningful global impact
- emerging products and technologies

The system should allow these interests to evolve later.

## News Experience

Each item should ideally provide:

- headline
- source
- publication time
- short summary
- original article link

Where feasible, Kokpit may additionally provide a short explanation of **why the story matters**.

The interface should prioritize signal over volume.

Kokpit should not attempt to display every available article.

Duplicate coverage of the same event should be minimized where possible.

The exact source aggregation strategy will be defined in `CONTENT_SOURCES.md`.

---

# 10. College Space

## Purpose

College Space organizes academic material by semester, course, and week.

It should feel simpler than a full learning management system while being more structured than a normal file folder.

## Core Hierarchy

The expected conceptual structure is:

`Semester → Course → Week → Material`

Example:

`Semester 5 → Web Programming → Week 04 → REST API.pdf`

## Semester

The user must be able to:

- create a semester
- rename a semester
- archive or remove a semester
- enter a semester workspace

---

## Course

Within a semester, the user must be able to:

- create courses
- rename courses
- organize courses
- remove courses
- access course material

Optional visual metadata such as an icon or simple identifying color may be supported later if appropriate.

---

## Week

Each course may contain weekly sections such as:

- Week 01
- Week 02
- Week 03
- and onward

The number of weeks must not be artificially fixed.

---

## Materials

Each week should support relevant learning materials.

Examples include:

- PDF
- PowerPoint
- Word documents
- images
- text files
- code files
- links
- other useful academic files

Users should be able to add, view, download, rename, move, and remove materials where appropriate.

---

# 11. Quick Links

## Purpose

Quick Links acts as the user's personal internet launchpad.

It replaces repeatedly searching for or manually opening frequently used websites.

## Required Capabilities

The user must be able to:

- create a shortcut
- provide a name
- provide a URL
- optionally assign an icon
- edit shortcuts
- delete shortcuts
- reorder shortcuts
- open a shortcut quickly

Potential examples include:

GitHub, ChatGPT, YouTube, Google Drive, Gmail, Vercel, Figma, WhatsApp Web, documentation, university systems, or project-specific websites.

Quick Links should feel more intentional and visually integrated than ordinary browser bookmarks.

---

# 12. Idea Space

## Purpose

Idea Space exists so spontaneous ideas can be captured before they disappear.

The most important requirement is **speed of capture**.

Creating an idea should not require navigating through complex forms or organizational systems.

## Required Capabilities

The user must be able to:

- quickly create an idea
- write freeform text
- optionally add a title
- automatically record creation time
- edit an existing idea
- delete an idea
- browse previously saved ideas
- search ideas

Optional lightweight tags may be supported.

Examples could include:

`project`

`college`

`random`

`design`

`minecraft`

Tags must remain optional.

A user should still be able to save an idea immediately without categorizing it first.

---

# 13. Navigation

Navigation must remain simple even as Kokpit grows.

V1 needs direct access to:

- Home
- College
- Music
- News
- Ideas
- Library / Quick Links

The navigation design itself will be defined in `DESIGN_SYSTEM.md`.

Kokpit should avoid deeply nested global navigation.

Hierarchy should exist primarily inside feature areas such as College.

---

# 14. Search

A universal search system is **not required for the initial V1 release**.

Individual modules may provide their own relevant search capability.

Idea Space should support searching ideas.

College Space should eventually make locating materials easy.

A global command palette or universal search may be considered after V1.

---

# 15. Data Ownership

Kokpit contains personal information and files.

The user should maintain practical control over stored data.

The system architecture should avoid unnecessary dependency on proprietary services when a simpler self-controlled solution is available.

Stored data may include:

- ideas
- settings
- shortcuts
- playlists
- music metadata
- academic structure
- uploaded academic files
- cached quotes
- cached news metadata

Storage implementation will be defined in engineering documentation.

---

# 16. External Content Resilience

Features such as Quotes and News may rely on external sources.

Failure of an external source must not make Kokpit unusable.

If a provider becomes unavailable, Kokpit should degrade gracefully.

Examples include:

- using cached news
- retaining the previous quote
- displaying a subtle unavailable state
- allowing unrelated features to continue operating normally

External integrations must remain isolated enough that one failing source does not break the entire application.

---

# 17. Privacy

Kokpit is a personal workspace.

Private data should not be publicly accessible by default.

The deployment architecture must eventually include a reasonable mechanism for preventing unauthorized users from accessing private workspace data.

The exact authentication/access-control solution will be decided in `ARCHITECTURE.md`.

Kokpit V1 does not require:

- public user registration
- social profiles
- public content feeds
- multi-user collaboration

---

# 18. Deployment

The intended production environment is **Cloudflare**.

Architecture decisions must therefore consider Cloudflare compatibility from the beginning.

However, this PRD intentionally does not prescribe specific Cloudflare products.

Those decisions belong in `ARCHITECTURE.md` and `DEPLOYMENT.md`.

The preferred infrastructure should remain inexpensive or free for normal personal usage.

---

# 19. Responsive Usage

Kokpit is primarily expected to be used from a laptop or desktop browser.

Desktop usability therefore has priority.

However, important lightweight actions should remain usable from mobile devices where practical.

A key mobile use case is quickly capturing an idea.

The mobile interface does not need feature parity with the desktop layout if forcing parity would harm usability.

---

# 20. Performance Expectations

Kokpit should feel fast.

Pages should avoid unnecessary blocking requests.

Large modules should not make unrelated areas slower.

External content such as news should be cached where appropriate.

Visual effects should never significantly degrade responsiveness.

The experience should remain comfortable when Kokpit stays open for long periods.

---

# 21. Visual Experience Requirements

Detailed visual rules belong in `DESIGN_SYSTEM.md`.

At the product level, Kokpit should feel:

- quiet
- spacious
- modern
- warm or neutral
- personal
- intentional
- unobtrusive

Kokpit should avoid feeling like:

- enterprise software
- analytics software
- admin dashboards
- cryptocurrency dashboards
- generic AI-generated SaaS products
- productivity gamification apps

The application should not become a collection of visually competing cards.

---

# 22. Explicitly Out of Scope for V1

The following features should **not** be implemented during V1 unless this PRD is intentionally revised:

Task management.

Kanban boards.

Habit tracking.

Pomodoro timers.

Calendar management.

Email client functionality.

Chat or messaging.

AI chatbot embedded inside Kokpit.

AI assistant panel.

Productivity scoring.

Streak systems.

Gamification.

Time tracking.

Team collaboration.

Public accounts.

Multi-user workspaces.

Social features.

Complex analytics dashboards.

Project management systems.

Automatic coding agents.

Full note-taking application functionality.

Universal command palette.

Global semantic search.

Mobile native applications.

These ideas may be reconsidered later.

They must not silently enter V1 simply because an AI agent considers them useful.

---

# 23. V1 Success Criteria

Kokpit V1 is considered successful when the owner can realistically use it as a recurring everyday workspace.

The core experience should allow the user to:

open Kokpit and immediately see the current time and dynamic content;

play and manage personal music;

quickly see relevant current news;

organize and access current university materials;

launch frequently visited websites;

capture an idea immediately before forgetting it;

use all core sections without the interface feeling crowded or heavy;

access the deployed workspace securely from the web;

and continue extending the codebase later without rebuilding its foundation.

---

# 24. Product Boundary

Whenever a new feature is proposed, it should be evaluated against the following question:

> Does this make Kokpit a better personal digital space, or does it merely make Kokpit larger?

If the feature primarily adds complexity, management overhead, visual noise, or maintenance burden without substantially improving everyday use, it should not be added.

---

# 25. V1 Feature Freeze

The official Kokpit V1 product scope is:

**Home**

Real-time clock, date, dynamic quote, lightweight content presence, and persistent music access.

**Music**

Personal music library, playlists, playback controls, and persistent playback.

**News**

Curated technology and world information relevant to the user's interests.

**College**

Semester → Course → Week → Material organization.

**Quick Links**

One-click access to frequently used websites and services.

**Ideas**

Fast capture and retrieval of spontaneous ideas.

Anything beyond these modules requires an explicit scope decision before implementation.

---

# 26. Related Documentation

This PRD defines **what Kokpit is and what it must do**.

Other documents define how those decisions will be executed.

`DESIGN_SYSTEM.md`  
Defines visual language and interaction principles.

`ARCHITECTURE.md`  
Defines the technical architecture.

`DATA_MODEL.md`  
Defines persisted entities and relationships.

`CONTENT_SOURCES.md`  
Defines external quote, news, and content strategies.

`FILE_STRUCTURE.md`  
Defines the final codebase organization.

`IMPLEMENTATION_PLAN.md`  
Defines implementation phases and order.

`DEPLOYMENT.md`  
Defines Cloudflare deployment and operational setup.

`DECISIONS.md`  
Records important architectural and product decisions.

`AGENTS.md`  
Defines rules that AI coding agents must follow when working on Kokpit.