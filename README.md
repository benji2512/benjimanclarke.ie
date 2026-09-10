# My Portfolio Website

A personal portfolio website built with Flask templates and published as a static site through Cloudflare Workers Builds.

### Tech Stack

- **Site generator:** Flask + Frozen-Flask (Python)
- **CSS:** Bootstrap 5.3 + Bootstrap Icons
- **Fonts:** Google Fonts (Montserrat, Open Sans)
- **Hosting and CDN:** Cloudflare Workers

### Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Welcome page |
| `/aboutben` | About me |
| `/career` | Professional journey |
| `/projects` | Side projects gallery |
| `/contact` | Find me (links to social) |
| `/blog` | Blog posts |
| `/blogs/<slug>` | Individual blog post |
| `/sitemap.xml` | XML sitemap for SEO |

### Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
flask run

# Or with Python
python app.py
```

### Building

The site uses a static site generator approach:

```bash
python freeze.py
```

This generates static HTML in the `build/` directory for deployment.

### Deployment

Pushing to `main` triggers the configured Cloudflare Workers Build. It runs `python freeze.py` and deploys the static `build/` output to `https://benjimanclarke.ie`.

The site is static in production: Flask is used at build time to render pages, not as a continuously running web server. `wrangler.toml` defines the Worker entry point and the static asset directory, so the existing deployment command can deploy both the static site and the contact-form endpoint.

### Contact form configuration

The Worker accepts `POST /contact/submit`, validates the form, sends messages through Resend, and redirects to static success or error pages. Core form submission works without JavaScript.

Before deploying the contact form, add these encrypted Cloudflare Worker secrets in the dashboard:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Use `.dev.vars.example` as the local configuration template. Copy it to `.dev.vars` for local Worker testing; `.dev.vars` is intentionally ignored by Git.

Also configure a Cloudflare rate-limiting rule for `POST /contact/submit` before enabling the form in production. That rule is deliberately dashboard configuration rather than application state: start with a per-IP limit of 5 requests per 10 minutes and block excess requests for 10 minutes.

### Features

- ✅ Open Graph meta tags for social sharing
- ✅ Twitter Card support
- ✅ Lazy loading images
- ✅ Mobile responsive (Bootstrap)
- ✅ SEO-friendly URLs
- ✅ XML sitemap

### TODO

- [ ] Add Open Graph image preview
- [ ] Create sharable URL for CV download
- [ ] Add more blog posts
