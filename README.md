# Bay Information Systems Website

AI/ML consultancy company website featuring technical articles, service information, and client analytics.

**Live Site**: [https://www.bayis.co.uk](https://www.bayis.co.uk)

## Project Overview

Static website built with HTML, Bootstrap, and Jekyll (GitHub Pages). The site showcases Bay Information Systems' expertise through technical articles on AI/ML topics, service descriptions, and structured consulting processes.

Solo developer project with automatic deployment on push to master.

## Architecture

### Core Components

```
├── index.html              # Homepage with services, process, article listing
├── assets/
│   ├── articles.json      # Article metadata database
│   ├── articles.js        # Dynamic article card generation
│   └── styles.css         # Custom styles
├── library/               # Technical articles (markdown)
│   ├── 01-docker-deep-dive.md
│   ├── 19-rag-strategy.md
│   └── ...
├── img/                   # Logos and images
├── sitemap.xml           # SEO sitemap
└── robots.txt            # Search engine directives
```

### Technology Stack

- **Frontend**: Bootstrap 5.3, vanilla JavaScript
- **Static Site Generator**: Jekyll (GitHub Pages default)
- **Markdown Processor**: Kramdown with GitHub Flavoured Markdown
- **Analytics**: Custom clientlog system (private dev project)
- **Hosting**: GitHub Pages
- **CI/CD**: Automatic deployment on push to master

## Content Structure

### Articles

Articles exist as markdown files in `/library/*.md`. GitHub Pages converts them to HTML during build. 

The homepage displays articles through `articles.json`, which contains metadata and links to the generated HTML files. The `articles.js` script reads this JSON and dynamically generates the accordion sections and article cards.

**Note**: `articles.json` links reference `.html` files (post-Jekyll conversion), even though source files are `.md`.

#### articles.json Structure

Located in `/assets/articles.json` (historical location):

```json
[
  {
    "topic": "AI Systems",
    "articles": [
      {
        "title": "Article Title",
        "description": "Short description for card",
        "keywords": ["keyword1", "keyword2"],
        "link": "./library/article-name.html"
      }
    ]
  }
]
```

### Legacy Structure

Articles 01, 02, and 03 use subdirectory structure (`/01-docker-deep-dive/01-docker-deep-dive.html`). Article 03 maintains this because it contains images. New articles use the flat `/library/*.md` structure.

## Article Creation Workflow

1. Develop article content (often with LLM assistance from client discussions or industry news)
2. Write markdown file in `/library/`
3. Update `assets/articles.json` manually
4. Update `sitemap.xml` manually
5. Commit and push to master (automatic deployment)
6. Schedule LinkedIn post manually for Thursday 9:30 AM

**Automation note**: The LinkedIn scheduling step could potentially be automated via Buffer API, Zapier, or direct LinkedIn API integration.

## Analytics

### ClientLog Integration

Custom analytics platform (private development project, not yet public) tracks user behaviour:

```javascript
const logger = clientlog.createLogger({
  endpoint: "https://api.dev.clientlog.bayis.co.uk/v1/event",
  project: "bayis/home",
  options: {
    session: true,
    navigation: true
  }
});
```

#### Events Tracked

- `article_click` - User clicks article card on homepage (via `articles.js`)
- Navigation and session data via clientlog library

**Current status**: Dev endpoints only. Plan to launch publicly and migrate to production endpoints.

## Styling & Branding

### Design System

Defined in `styles.css`:
- **Colours**: CSS variables (`--dark-bg: #333`, `--light-bg: #EEE`, `--text: #444`, `--border: #AAA`)
- **Typography**: "Felix Titling", "Bookman Old Style", Serif fallback
- **Framework**: Bootstrap 5.3 via CDN
- **Icons**: Font Awesome 4.7

### Logo Assets

- `BayInfoLogo_narrow.png` - Navbar
- `BayInfoLogo_square.png` - Footer and social sharing
- `BayInfoLogow.png` - Banner

## Content Guidelines

### Writing Voice

- Calm, measured, declarative and exploratory rather than persuasive
- Technical clarity with accessible writing
- Logical argument structure without rhetorical flourishes

### Technical Conventions

- British English
- Brackets for subclauses, not em-dashes
- Avoid grammatical emphasis by contrast (antithesis)
- Minimal rhetorical devices

### Article Approach

- Start with problem statement or context
- Concrete examples from real projects (anonymised)
- Code snippets for technical content
- Practical takeaways
- Internal cross-references where relevant
- Technical depth for engineers, accessible to product managers

## Deployment

Automatic via GitHub Pages. Push to master triggers Jekyll build and deployment within 1-2 minutes. No manual build steps or staging environment.

## Future Considerations

### Planned Enhancements

- Jekyll layout templates for articles (SEO metadata, related articles, structured data)
- Automated articles.json generation from markdown front matter
- LinkedIn posting automation
- Production clientlog endpoints when platform launches
- RSS feed generation

### Structural Notes

- `articles.json` location in `/assets/` is historical, could move to `/library/`
- Manual metadata updates could be automated with build scripts
- Related articles could be generated via keyword matching

## Project Information

- **Developer**: Ed (Bay Information Systems)
- **Repository**: GitHub (private)
- **Status**: Active production
- **License**: © 2024 Bay Information Systems. All rights reserved.

---

**Last Updated**: November 2024
