# Kokpit — Content Sources

**Version:** 0.1  
**Status:** V1 Content Strategy Draft  
**Product:** Kokpit  
**Scope:** Quotes + News  
**Primary Runtime:** Cloudflare Workers  
**Scheduled Jobs:** Cloudflare Cron Triggers  
**Optional AI Provider:** Cloudflare Workers AI  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document defines how Kokpit obtains, generates, normalizes, ranks, stores, refreshes, and displays dynamic external content.

V1 focuses on two dynamic content systems:

```txt
Quotes
News
```

The goals are:

- avoid hardcoded generic content
- keep Kokpit fresh every day
- keep external dependencies replaceable
- avoid unnecessary API costs
- reduce duplicate content
- prioritize relevance without creating a narrow filter bubble
- keep the UI usable when external services fail
- preserve source attribution for news
- avoid fake quote attribution

This document is the source of truth for content ingestion behavior.

---

# 2. General Content Principles

All dynamic content in Kokpit should follow these principles.

## 2.1 Cache First

The frontend should usually read normalized cached content from Kokpit's own database.

Avoid:

```txt
browser
→ third-party API
```

Prefer:

```txt
third-party source
→ Cloudflare Worker
→ normalize
→ store in D1
→ Kokpit API
→ frontend
```

---

## 2.2 External Services Are Replaceable

External providers must be treated as adapters.

Conceptually:

```txt
QuoteProvider
NewsProvider
AIProvider
```

Kokpit should own its internal content format.

Changing an external provider should not require redesigning the frontend.

---

## 2.3 Failure Must Be Local

Examples:

```txt
Workers AI unavailable
→ use existing quote pool

one RSS feed unavailable
→ other news sources still work

Hacker News unavailable
→ News still renders cached articles

news refresh fails
→ display latest cached feed
```

No external provider should be capable of breaking Kokpit Home.

---

# 3. Quote Product Goal

Kokpit quotes are not intended to behave like a traditional inspirational quote API.

The feature should feel more like:

```txt
a thought Kokpit gives you for this hour
```

The content may be:

- motivational
- reflective
- calm
- sad
- uncertain
- ambitious
- tired
- hopeful
- creative
- relatable
- about life
- about studying
- about building software
- about frustration
- about curiosity
- about resting
- about loneliness
- lightly humorous

Kokpit should not constantly attempt to make the user feel motivated.

Some hours may simply feel reflective or quiet.

---

# 4. Quote Language

V1 quote language distribution:

```txt
English     ~90%
Indonesian  ~10%
```

English is the primary language and should dominate the experience.

Avoid forced mixed-language sentences.

Each quote should normally be written naturally in one language.

Language distribution is a target over time, not a strict guarantee per batch.

---

# 5. Quote Source Strategy

Primary V1 source:

```txt
Cloudflare Workers AI
```

Workers AI generates original short thoughts in batches.

Do not call Workers AI on every Home page load.

The generated content is stored in:

```txt
D1 → quotes
```

The Home page selects from this existing pool.

---

# 6. Quote Provider Abstraction

The implementation should expose an internal provider boundary.

Conceptually:

```txt
QuoteProvider

generateBatch(input)
```

Initial implementation:

```txt
WorkersAIQuoteProvider
```

Do not tightly couple the quote system to one model name.

The model should be configurable.

Example configuration:

```txt
QUOTE_AI_PROVIDER=workers-ai
QUOTE_AI_MODEL=<configured model>
```

This allows the model to change when Cloudflare's model catalog changes.

---

# 7. Quote Generation Strategy

Do not generate one quote per request.

Generate batches.

Recommended behavior:

```txt
target healthy pool:
96–168 active quotes

refill threshold:
72 eligible quotes

refill batch:
24–48 quotes
```

The exact batch size may be adjusted based on inference cost and output quality.

The goal is always to have multiple days of content ready.

---

# 8. Quote Rotation

Kokpit shows one primary quote per hourly slot.

Example:

```txt
06:00–06:59 → Quote A
07:00–07:59 → Quote B
08:00–08:59 → Quote C
```

Refreshing the page repeatedly during the same hour should not normally change the primary quote.

At the next local clock hour, a new quote becomes eligible.

The hourly slot uses the timezone configured in:

```txt
user_settings.timezone
```

---

# 9. "Another Thought"

Home must provide a subtle manual action for V1:

```txt
another thought
```

or equivalent.

Behavior:

```txt
current hourly quote
→ user requests another
→ choose another eligible quote
→ display alternate for current session
```

This should not permanently change the scheduled hourly quote.

The action is required for V1 acceptance and remains visually secondary. Using it is optional for the owner.

---

# 10. Quote Mood Engine

Each generated quote belongs to one mood.

Initial mood vocabulary:

```txt
calm
reflective
ambition
struggle
sad
uncertain
hopeful
lonely
creative
life
student
developer
late-night
rest
curiosity
dry-humor
```

Do not create dozens of overlapping categories.

---

# 11. Time-Aware Quote Mood

Generation and selection may use time-of-day context.

Suggested groups:

```txt
morning
05:00–10:59

daytime
11:00–16:59

evening
17:00–21:59

late-night
22:00–04:59
```

Mood weighting may change by period.

Example:

```txt
morning
more:
calm
hopeful
curiosity
ambition

daytime
more:
developer
student
creative
struggle

evening
more:
reflective
life
rest
creative

late-night
more:
reflective
uncertain
lonely
calm
dry-humor
```

This is mood weighting, not a rigid rule.

A late-night quote does not always need to be sad.

---

# 12. Quote Generation Prompt Rules

The AI prompt must explicitly avoid generic motivational language.

Reject patterns such as:

```txt
believe in yourself
never give up
dream big
keep pushing
you've got this
success is a journey
be the best version of yourself
everything happens for a reason
trust the process
the sky is the limit
```

Also avoid:

```txt
corporate motivational tone
LinkedIn-style hustle language
therapy-style reassurance
fake deep philosophy
repetitive "maybe..." structures
constant second-person commands
fake famous-author quotes
```

---

# 13. Quote Style Requirements

Generated quotes should vary in:

- sentence length
- emotional intensity
- sentence structure
- point of view
- rhythm
- mood
- subject

Some may be one sentence.

Some may be two short sentences.

Recommended length:

```txt
6–32 words
```

Soft maximum:

```txt
45 words
```

Avoid essays.

---

# 14. Quote Content Examples

Desired direction:

```txt
You can spend three hours fixing one stupid bug and still call the day useful.

Not every unfinished thing is a failure. Some things are simply waiting for another day.

Maybe nothing important needs to happen tonight.

Some progress looks suspiciously like staring at the same problem until it finally makes sense.

A quiet day can still move your life somewhere.

There are days when curiosity is more useful than discipline.
```

These examples define tone only.

They should not become a hardcoded production quote list.

---

# 15. Quote Personalization Boundary

V1 may use general safe context:

```txt
time of day
preferred language
broad product themes
student life
software building
technology
creativity
```

V1 must not send private user content to the quote generator.

Do not include:

```txt
Ideas content
College documents
uploaded material
music history
private files
personal notes
```

in AI quote prompts.

---

# 16. Quote Deduplication

Every generated quote should receive:

```txt
normalized content
content_hash
```

Before insert:

```txt
exact duplicate
→ reject
```

The generator should also receive a sample of recent quote texts when practical to reduce semantic repetition.

Recommended context:

```txt
20–40 recently generated / recently shown quotes
```

Do not send the entire database to the model.

---

# 17. Quote Quality Filter

Generated batches should pass simple automated checks.

Reject if:

- empty
- too long
- repeated
- malformed
- contains obvious model boilerplate
- includes quotation marks plus invented attribution
- starts with banned cliché patterns
- contains unsafe unexpected formatting
- looks like an instruction instead of a thought

Optional future quality scoring may use AI.

V1 should begin with deterministic checks.

---

# 18. Quote Attribution

AI-generated content:

```txt
source_type = ai
author = NULL
```

Display:

```txt
no author
```

or a subtle Kokpit-generated indicator if desired.

Never display:

```txt
— Albert Einstein
— Steve Jobs
— Naval Ravikant
```

unless the quote is genuinely sourced and verified.

---

# 19. Emergency Quote Fallback

Keep a very small built-in fallback set.

Purpose:

```txt
database empty
AND
Workers AI unavailable
```

Recommended:

```txt
5–10 fallback thoughts
```

Fallback content is not the primary experience.

Once dynamic quote inventory exists, fallback quotes should almost never appear.

---

# 20. Quote Scheduled Job

Quote inventory can be maintained by a scheduled Worker.

Recommended schedule:

```txt
daily
```

plus conditional refill.

Pseudo-flow:

```txt
scheduled job starts

count eligible quotes

if count >= threshold:
    stop

generate batch

validate

deduplicate

store accepted quotes

finish
```

Do not regenerate the entire pool daily.

---

# 21. Quote Cost Strategy

AI inference should remain inexpensive.

Rules:

- batch generation
- do not generate on every page view
- do not summarize or classify quotes unnecessarily
- use a configurable efficient model
- stop generation when pool is healthy
- retain unused quality quotes

Cloudflare Workers AI should remain optional infrastructure.

If unavailable, cached quotes continue working.

---

# 22. News Product Goal

Kokpit News is not intended to become a general news portal.

It should answer:

```txt
What happened that is likely worth knowing today?
```

The feed should help the user:

- stay current with AI
- understand technology changes
- discover developer tools
- follow major companies
- notice meaningful research
- stay aware of significant world events
- learn things outside the immediate software bubble

---

# 23. News Content Mix

Target feed distribution:

```txt
70–80%
personal relevance

20–30%
important outside-the-bubble information
```

This prevents Kokpit from becoming:

```txt
AI
AI
AI
NVIDIA
GitHub
AI
AI
```

all day.

---

# 24. News Interest Profile

## Very High Priority

```txt
artificial intelligence
LLMs
AI agents
developer tools
software engineering
programming
GitHub
OpenAI
Google AI
NVIDIA
Cloudflare
coding tools
cybersecurity
major model releases
major developer platform changes
```

## High Priority

```txt
technology
hardware
chips
GPUs
social platforms
startups
research
Microsoft
Meta
Apple
Google
major technology leaders
internet infrastructure
open source
```

## General Learning

```txt
science
space
economics with technology impact
important digital regulation
major cybersecurity events
internet culture
interesting engineering
```

## Important World

```txt
major war developments
major armed conflict
geopolitical developments
major natural disaster
major economic shock
major international crisis
large cyberattack
major scientific event
```

---

# 25. Source Strategy

Kokpit should use multiple source types.

```txt
Official Sources
Developer Signal
Tech Journalism
World Discovery
```

No single provider should control the entire News feature.

---

# 26. Source Tier A — Official Sources

These sources provide direct product or company announcements.

Initial V1 targets:

```txt
NVIDIA Newsroom / official RSS
GitHub Changelog / RSS
Google AI / Google Blog feeds
Cloudflare Blog topic RSS
```

Future official adapters may include:

```txt
OpenAI
Anthropic
Microsoft
Meta AI
other relevant developer companies
```

Only add them when a stable official feed/API/page adapter is verified.

Official sources generally receive a relevance bonus for product announcements.

---

# 27. NVIDIA

Use NVIDIA's official Newsroom RSS feeds.

Relevant categories may include:

```txt
Generative AI
AI Platforms / Deployment
Development & Optimization
Models / Libraries / Frameworks
Data Science
Gaming when technically relevant
general NVIDIA news
```

Avoid subscribing to every NVIDIA category if it creates excessive duplicate content.

---

# 28. GitHub

Use the GitHub Changelog RSS feed.

High-interest topics include:

```txt
Copilot
Actions
Application Security
client apps
developer platform changes
projects / issues
supply-chain security
API changes
```

GitHub Changelog is preferred over social posts for product change detection.

---

# 29. Google

Use official Google Blog / AI-related feeds where available.

Prefer:

```txt
AI
developer tools
Gemini
research
major product engineering announcements
```

Do not ingest every consumer marketing article with equal priority.

---

# 30. Cloudflare

Use Cloudflare Blog RSS / topic feeds.

Relevant topics include:

```txt
Product News
Workers
AI
AI Gateway
developer platform
security
internet infrastructure
R2
D1
performance
```

Cloudflare content is particularly relevant because Kokpit itself runs on Cloudflare.

---

# 31. Source Tier B — Developer Signal

## Hacker News

Use the official Hacker News API.

Hacker News is used as:

```txt
developer-interest signal
discovery layer
engineering trend detector
```

It should not be treated as authoritative reporting.

Potential inputs:

```txt
top stories
best stories
new stories
```

Recommended ingestion:

```txt
top / best:
primary

new:
optional and limited
```

Hacker News score may contribute to relevance but should not determine truth or importance.

---

# 32. Source Tier C — Technology Journalism

Initial V1 candidates:

```txt
Ars Technica RSS
TechCrunch RSS
```

Potential later sources:

```txt
The Verge
MIT Technology Review
Wired
other reputable technology outlets
```

Only add feeds after verifying:

- stable access
- acceptable usage terms
- useful metadata
- low duplicate volume

The initial source list should remain intentionally small.

---

# 33. Ars Technica

Ars Technica provides official RSS feeds.

High-value sections may include:

```txt
Technology Lab
science / research
security-related coverage
general technology
```

Ars is useful for context and technical depth.

---

# 34. TechCrunch

TechCrunch may be used primarily for:

```txt
AI company news
startups
platform developments
social products
major funding / acquisition events
```

Lower priority should be given to low-impact startup noise.

---

# 35. Source Tier D — World Discovery

World coverage requires broader discovery than company blogs.

Recommended discovery adapter:

```txt
GDELT DOC API
```

GDELT should be treated as:

```txt
discovery infrastructure
```

not a single editorial source.

It may surface articles about:

```txt
war
conflict
geopolitics
major disasters
international crises
global economic events
large cyber incidents
```

The original article domain must always be retained.

---

# 36. World Source Quality

GDELT results may include sources of varying quality.

Kokpit should apply domain quality rules.

Conceptually:

```txt
trusted / preferred domains
neutral domains
blocked / low-quality domains
```

Articles should not receive high priority purely because GDELT returned them.

For politically sensitive or conflict-related stories, prefer multiple credible sources when possible.

---

# 37. Optional World Editorial Sources

Additional direct world-news feeds may be added later.

Examples may include reputable international broadcasters or newspapers with stable feeds.

These are **not locked into V1** until their technical access and usage conditions are verified during implementation.

The content pipeline must not depend on one publisher.

---

# 38. News Fetch Schedule

Recommended default:

```txt
every 30 minutes
```

Implemented with:

```txt
Cloudflare Cron Triggers
```

Not every provider must be fetched on every cycle.

Possible cadence:

```txt
Hacker News:
30 minutes

official technology feeds:
30–60 minutes

tech journalism:
30–60 minutes

world discovery:
30 minutes
```

Source-specific cadence may later be configured.

---

# 39. News Ingestion Pipeline

```txt
Cron Trigger
     │
     ▼
Fetch source adapters
     │
     ▼
Parse
     │
     ▼
Normalize
     │
     ▼
Validate
     │
     ▼
Deduplicate
     │
     ▼
Categorize
     │
     ▼
Score relevance
     │
     ▼
Optional AI enrichment
     │
     ▼
Store D1
     │
     ▼
Serve Kokpit
```

---

# 40. Normalized News Shape

Every source should map into Kokpit's internal news format.

Conceptually:

```txt
title
source
source_id
url
image_url
published_at
fetched_at
category
summary
why_it_matters
relevance_score
ai_enriched
dedup_key
```

The frontend should not depend on provider-specific fields.

---

# 41. Article Body Policy

V1 should not build a full article-republishing system.

Prefer storing:

```txt
headline
source-provided excerpt / description
metadata
original URL
small generated summary when appropriate
```

Do not persist full publisher article text by default.

News cards should link to the original publication.

---

# 42. News Deduplication

Duplicate detection should use multiple signals.

Primary:

```txt
canonical / normalized URL
```

Secondary:

```txt
normalized headline similarity
```

Examples to normalize:

```txt
tracking parameters
UTM parameters
mobile URL variants
trailing slash differences
```

Near-identical reposts from the same source should be merged or discarded.

---

# 43. Event Duplication

Different publications covering the same event are not exact duplicates.

V1 may still show multiple sources when useful.

However Home should avoid:

```txt
5 cards about the exact same NVIDIA announcement
```

Basic event similarity may use:

```txt
headline keyword overlap
entity overlap
time proximity
```

Advanced event clustering is optional later.

---

# 44. Rule-Based Relevance Scoring

Initial relevance should be deterministic.

Example scoring model:

```txt
very-high-priority keyword/entity    +30
high-priority keyword/entity         +20
general-learning match               +10
important-world match                +25

official primary source              +10
preferred tech publication           +6
HN strong signal                     +5 to +15

published < 3 hours                  +15
published < 12 hours                 +10
published < 24 hours                 +5

duplicate / near duplicate           strong penalty
low-quality domain                   strong penalty
very old content                     penalty
```

Exact weights may be tuned after real usage.

---

# 45. Source Priority Is Not Truth

Source weighting is a feed-ranking mechanism only.

It must not imply:

```txt
this source is always correct
```

For major geopolitical, conflict, security, or breaking-news claims, Kokpit should prefer corroboration when feasible.

---

# 46. Diversity Rule

When assembling the final feed, avoid excessive domination by one topic or source.

Example limits:

```txt
no more than ~40% from one publisher
no more than ~50% from one narrow topic
```

These are soft heuristics.

A genuinely major event may temporarily override them.

---

# 47. Home News Mix

Home should display only a small preview.

Recommended:

```txt
2–3 news items
```

Selection should favor:

```txt
high relevance
freshness
topic diversity
source diversity
```

Example Home mix:

```txt
1 major AI / technology item

1 developer / engineering item

1 important world / science item
```

Do not show three nearly identical AI headlines.

---

# 48. Dedicated News Page Mix

The full News page may display a broader feed.

Suggested composition target:

```txt
~55% technology / AI / developer
~20% broader tech / science / business
~20% major world developments
~5% wildcard discovery
```

These numbers are guidance.

Real importance should override fixed quotas.

---

# 49. Wildcard Discovery

Kokpit should occasionally surface an item outside known interests.

Purpose:

```txt
increase general knowledge
reduce filter bubble
discover unexpected topics
```

Wildcard content must still pass a basic quality and importance threshold.

Do not use random low-quality articles.

---

# 50. News AI Enrichment

AI enrichment is optional.

Potential output:

```txt
summary
why_it_matters
topic classification
```

AI should process only articles that have already passed relevance filtering.

Do not enrich every ingested article.

---

# 51. AI Enrichment Budget

Example per refresh:

```txt
ingested:
100 articles

passed initial filter:
25

AI enriched:
top 5–15
```

Exact numbers depend on inference cost.

Priority:

```txt
Home candidates
high-relevance News page items
complex technical stories
```

---

# 52. News Summary Style

Summary target:

```txt
1–2 short sentences
```

Requirements:

- factual
- direct
- no clickbait
- no fake certainty
- no unnecessary opinion
- preserve important qualifiers
- do not invent details absent from available source metadata

---

# 53. "Why It Matters"

Optional field.

Target:

```txt
one concise sentence
```

Purpose:

Explain practical relevance to someone interested in:

```txt
technology
software
AI
developer tools
digital platforms
world events
```

Bad:

```txt
This is huge and will change everything.
```

Better:

```txt
This could affect how developers deploy smaller AI models on consumer hardware.
```

The field must remain analytical, not sensational.

---

# 54. AI Grounding Boundary

AI enrichment should use available source metadata.

At minimum:

```txt
headline
source
published time
source description
known category
```

If Kokpit later fetches article pages, that behavior must be reviewed per source and must not assume every publisher allows automated extraction.

V1 should not depend on full-page scraping.

---

# 55. News Link Policy

Every news item must retain:

```txt
original source name
original URL
published_at when available
```

Clicking a news item should make it easy to open the original article.

Kokpit is a discovery and briefing layer.

It is not intended to replace the publisher.

---

# 56. News Images

Use source-provided thumbnail URLs when reliably available.

Fallback:

```txt
source icon
category icon
simple Kokpit placeholder
```

Do not scrape arbitrary images from article pages solely for visual decoration.

---

# 57. News Retention

Recommended D1 article retention:

```txt
45 days
```

Possible range:

```txt
30–60 days
```

Scheduled cleanup may delete older content.

Important saved/bookmarked news is not part of V1.

If bookmarking is introduced later, bookmarked articles should be exempt from automatic cleanup.

---

# 58. Stale Content

Home should strongly prefer:

```txt
< 24 hours
```

unless an older article remains genuinely important.

Dedicated News may show:

```txt
recent days
```

Older items should naturally fall in ranking.

---

# 59. News Empty / Failure State

If a refresh fails:

```txt
do not clear existing articles
```

Display cached content.

UI may indicate:

```txt
Last updated 47 min ago
```

Only show an error if the cache is unavailable or severely stale.

---

# 60. Source Failure Tracking

Each source should track:

```txt
last_fetched_at
last_success_at
consecutive_failures
```

If a source repeatedly fails:

```txt
temporarily skip
log failure
continue remaining sources
```

Do not fail the entire scheduled job.

`consecutive_failures` may live in the source adapter configuration or later be added to the database if operationally useful.

---

# 61. Source Registry

V1 source registry should be configuration-driven.

Conceptual structure:

```txt
id
name
type
endpoint
category
priority
enabled
fetch_interval
adapter
```

Source URLs should not be scattered throughout application code.

---

# 62. Initial V1 Source Set

Recommended starting set:

```txt
OFFICIAL

NVIDIA Newsroom
GitHub Changelog
Google AI / Google Blog
Cloudflare Blog


DEVELOPER SIGNAL

Hacker News


TECH JOURNALISM

Ars Technica
TechCrunch


WORLD DISCOVERY

GDELT DOC API
```

Start small.

Measure quality before adding more sources.

---

# 63. Candidate Sources After V1 Validation

Potential future additions:

```txt
OpenAI official news
Anthropic official news
Microsoft Developer / AI
Meta AI
MIT Technology Review
The Verge
Wired
additional international news publishers
research feeds
security feeds
```

Do not add all of these at once.

A source must improve feed quality enough to justify maintenance.

---

# 64. Content Source Evaluation Checklist

Before adding a new source, evaluate:

```txt
Is the source relevant?

Is there a stable RSS feed or API?

Is it official or reputable?

Does it duplicate existing coverage heavily?

Does it provide useful publication timestamps?

Does it provide canonical URLs?

Does it have reasonable usage terms?

Will it create scraping maintenance?

Does it materially improve Kokpit?
```

If not, do not add it.

---

# 65. Scheduled Jobs

Recommended conceptual jobs:

```txt
news_refresh

quote_refill

content_cleanup
```

Suggested schedule:

```txt
news_refresh
every 30 minutes

quote_refill
daily

content_cleanup
daily
```

Jobs should remain idempotent where practical.

---

# 66. Scheduled Job Timezone

Cloudflare Cron expressions run in UTC.

Application content logic should use:

```txt
user_settings.timezone
```

when user-local behavior matters.

Example:

Quote rotation is based on user-local hour even if quote generation runs on a UTC cron schedule.

---

# 67. Content API

Conceptual frontend endpoints:

```txt
GET /api/quotes/current
POST /api/quotes/another

GET /api/news
GET /api/news/home
```

Internal maintenance endpoints are not required if scheduled jobs handle ingestion automatically.

Admin/debug endpoints must not be publicly exposed without protection.

---

# 68. Quote Current Endpoint

Conceptual behavior:

```txt
GET /api/quotes/current
```

Returns:

```json
{
  "id": "quote-id",
  "content": "Some progress looks suspiciously like staring at the same problem until it makes sense.",
  "mood": "developer",
  "language": "en",
  "hourSlot": "2026-10-06T05:00:00+07:00"
}
```

The backend should consistently return the same scheduled quote during the same hour unless the quote becomes invalid.

---

# 69. Quote Selection Strategy

Selection should reduce repetition.

Consider:

```txt
last_shown_at
show_count
mood
language
current time period
recent mood sequence
```

Avoid:

```txt
sad
sad
sad
sad
```

and:

```txt
developer
developer
developer
developer
```

even if those categories have many available quotes.

---

# 70. News API Query Controls

The News page may later support:

```txt
category
limit
cursor
```

Example:

```txt
GET /api/news?category=ai&limit=20
```

Do not expose raw provider query interfaces to the frontend.

---

# 71. Pagination

News should use cursor-style or stable pagination once the feed grows.

Avoid loading the entire retained 45-day article table at once.

Home uses a very small fixed limit.

---

# 72. Privacy

No private Kokpit data should be shared with external news providers.

News fetches should be generic server-side requests.

Quote generation may use broad predefined product context but not private user content.

---

# 73. Tracking

Kokpit should not add third-party tracking merely to power news or quotes.

Do not embed publisher tracking scripts.

News links may open the publisher normally.

---

# 74. Content Copyright Boundary

Kokpit should store and display only what is necessary for discovery and personal briefing.

Prefer:

```txt
headline
small source excerpt
source metadata
brief Kokpit-generated summary
link
```

Avoid copying full articles into Kokpit.

---

# 75. Model Independence

Workers AI is the V1 preferred AI runtime for content generation/enrichment.

However:

```txt
quote generation
news enrichment
```

must depend on an internal AI interface.

Future providers should be replaceable without redesigning:

- database
- frontend
- content API

---

# 76. AI Failure Policy

AI is an enhancement layer.

It is not allowed to become a hard dependency for:

```txt
Home rendering
News ingestion
News article listing
Quote display when cached quotes exist
```

If AI fails:

```txt
quotes
→ cached pool

news
→ source metadata / source excerpt

classification
→ deterministic keyword logic
```

---

# 77. Cost Guardrails

V1 must avoid uncontrolled AI usage.

Do not:

```txt
call AI every page load

summarize every article

regenerate existing summaries repeatedly

generate a quote every refresh
```

Prefer:

```txt
batching
caching
threshold-based refill
top-N enrichment
scheduled work
```

---

# 78. Observability

Log:

```txt
source fetch failures
items fetched per source
duplicates rejected
articles accepted
AI enrichment failures
quotes generated
quotes rejected
quote pool size
scheduled job duration
```

Do not log private user content unnecessarily.

---

# 79. V1 Acceptance Criteria — Quotes

Quote system is considered working when:

1. Home has a quote without a hardcoded primary quote array.
2. The primary quote changes each local hour.
3. Refreshing during the same hour normally keeps the same quote.
4. Quotes are predominantly English.
5. Mood varies over time.
6. Generic motivational clichés are filtered.
7. AI-generated quotes have no fake author attribution.
8. `another thought` can display an alternate.
9. Home still has a quote when Workers AI temporarily fails.
10. Quote generation does not occur on every page load.

---

# 80. V1 Acceptance Criteria — News

News system is considered working when:

1. Multiple independent sources feed Kokpit.
2. Source content is normalized.
3. Duplicate items are reduced.
4. Relevance scoring prioritizes the owner's interests.
5. Important world content is still surfaced.
6. Home displays only 2–3 strong news items.
7. Full News page provides a broader feed.
8. Every article links to the original source.
9. News remains usable when one provider fails.
10. Cached news remains available during refresh failures.
11. AI summaries are optional rather than required.
12. The system does not depend on full-page scraping.

---

# 81. Initial Configuration Summary

```txt
QUOTE

Primary source:
Cloudflare Workers AI

Primary language:
English

Language target:
~90% English
~10% Indonesian

Rotation:
once per local hour

Generation:
batch

Pool target:
96–168

Refill threshold:
72

AI on page load:
no

Another thought:
required for V1; visually secondary


NEWS

Refresh:
every 30 minutes

Primary official sources:
NVIDIA
GitHub
Google
Cloudflare

Developer signal:
Hacker News

Technology journalism:
Ars Technica
TechCrunch

World discovery:
GDELT

AI enrichment:
top relevant items only

Home items:
2–3

Retention:
~45 days

Full article scraping:
not required
```

---

# 82. Final Content Rule

Quotes should make Kokpit feel alive.

News should make Kokpit feel connected to the world.

Neither feature should make Kokpit feel noisy.

The final question for every content decision is:

> Is this worth occupying the user's attention inside their personal space?

If the answer is no, do not surface it.
