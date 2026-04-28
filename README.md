# Bay Information Systems Website

AI/ML consultancy website featuring a technical article library, service descriptions,
and open source project listings.

**Live site**: https://www.bayis.co.uk

---

## Overview

Static site built with Jekyll and Bootstrap, hosted on GitHub Pages. Articles are
markdown files with front matter; Jekyll builds everything on push to master.
No manual build steps, no staging environment.

---

## Architecture

```
├── _posts/                  # Article source files (markdown)
├── _layouts/
│   ├── default.html         # Base layout
│   └── article.html         # Article layout with JSON-LD and related articles
├── _includes/
│   └── related.html         # Related articles component
├── _data/
│   └── topics.yml           # Topic labels and display order for library page
├── img/                     # Logos and brand assets
├── marigold/                # Marigold product page
├── index.html               # Homepage
├── library.html             # Article library index
├── main.css                 # Global styles
├── assets/
│   └── styles.css           # Component styles
├── _config.yml              # Jekyll configuration
└── robots.txt
```

---

## Technology Stack

- **Frontend**: Bootstrap 5.3 (CDN), vanilla JavaScript
- **Icons**: Font Awesome 4.7
- **Static site generator**: Jekyll (GitHub Pages)
- **Markdown processor**: Kramdown with GitHub Flavoured Markdown
- **Plugins**: jekyll-sitemap (automatic), jekyll-redirect-from
- **Analytics**: Clientlog (custom, bayis internal)
- **Hosting**: GitHub Pages
- **Deployment**: Automatic on push to master

---

## Article System

### How it works

Articles are Jekyll posts in `_posts/`. The filename convention is:

```
_posts/YYYY-MM-DD-NN-slug.md
```

where `NN` is a two-digit sequence number. Jekyll converts each file to HTML at
`/library/NN-slug.html` per the permalink rule in `_config.yml`.

The homepage shows the four most recent posts via `site.posts limit: 4`.
The library page groups all posts by `topic` via `site.data.topics`.
Sitemaps are generated automatically by jekyll-sitemap from the posts collection.

### Front matter fields

All fields except `layout` are consumed by templates or SEO tooling.

```yaml
---
layout: article
title: "Display title"
seo_title: "Search-optimised title (optional, overrides title in head)"
description: "One or two sentences. Used in library cards, meta description, and JSON-LD."
keywords: ["keyword one", "keyword two"]
topic: "Topic Label"          # Must match an entry in _data/topics.yml
last_modified_at: YYYY-MM-DD  # Used for cache-busting and freshness signals
related:                       # Slugs of related posts (without date prefix)
  - 19-rag-strategy
  - 20-vector-db-deepdive
---
```

The `description` field is the most important for SEO and GEO. It should name a
concrete problem, not describe the topic in general terms.

### Adding an article

1. Create `_posts/YYYY-MM-DD-NN-slug.md` with complete front matter
2. Confirm `topic` matches an entry in `_data/topics.yml` (add one if needed)
3. Write the article body in markdown below the front matter
4. Push to master -- Jekyll builds and deploys within a minute or two

No other files need updating. The sitemap, library index, and homepage update
automatically.

### Related articles

The `related` field takes a list of post slugs (the filename without the date prefix
and without the extension). The `related.html` include resolves these against
`site.posts` and renders linked titles with descriptions. A post must exist and
have a matching slug for the link to appear.

---

## Library Page

`library.html` groups articles by the `topic` front matter field. The display order
of topic groups is controlled by `_data/topics.yml`. Articles without a `topic` field
do not appear on the library page.

---

## Styling and Branding

### Design tokens (main.css)

```css
--dark-bg:  #333
--light-bg: #EEE
--text:     #444
--border:   #AAA
```

### Typography

- Headings: Felix Titling
- Body: Bookman Old Style, serif fallback
- Framework: Bootstrap 5.3

### Logo assets

```
img/BayInfoLogo_narrow.png          # Navbar
img/BayInfoLogo_square.png          # Footer, social sharing
img/BayInfoLogow.png                # Banner (white variant)
```

---

## Analytics

Clientlog is a Bay Information Systems internal product. It tracks session and
navigation events via a JavaScript snippet included in the default layout.

```javascript
const logger = clientlog.createLogger({
  endpoint: "https://api.dev.clientlog.bayis.co.uk/v1/event",
  project: "bayis/home",
  options: { session: true, navigation: true }
});
```

The endpoint is currently the dev instance. This will move to a production endpoint
when Clientlog launches publicly.

---

## Content Guidelines

### Voice

Calm, measured, declarative. Exploratory rather than persuasive. No rhetorical
emphasis by contrast. Technical clarity with an accessible register. British English
throughout. ASCII only.

### Structure

Open with context or a concrete observation. Develop the argument in prose. End on
the argument's own terms. Calls to action belong inside the body in brackets, not
as a dedicated closing section.

### Technical conventions

- Brackets for subclauses, not em-dashes
- Bullet points and headers only where the content requires them
- Prose transitions between sections, not headers substituting for them
- Short, common words over longer compounds
- Active verbs; weak verbs ("brings", "creates") signal an unfinished argument

---

## Deployment

Push to master triggers a GitHub Pages Jekyll build. Deployment typically completes
within one to two minutes. There is no staging environment; check the build status
in the GitHub Actions tab if a change does not appear.

---

## Project Information

- **Developer**: Edward Grundy, Bay Information Systems
- **Repository**: GitHub
- **Status**: Active production
- **License**: Copyright 2024 Bay Information Systems. All rights reserved.
- **Last updated**: April 2026
