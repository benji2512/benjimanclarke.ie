# My Portfolio Website

A personal portfolio website built with Flask, deployed on my homelab server.

### Tech Stack

- **Backend:** Flask (Python)
- **CSS:** Bootstrap 5.3 + Bootstrap Icons
- **Fonts:** Google Fonts (Montserrat, Open Sans)
- **Hosting:** Homelab server (Norad)
- **Reverse Proxy:** Caddy
- **CDN:** Cloudflare

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

The site runs as a Docker container on my homelab server, accessible at `https://benjimanclarke.ie`

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
