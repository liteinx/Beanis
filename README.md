**Beanis Project: Comprehensive Workflow & Implementation Plan**

Beanis is a **lightweight, zero-backend APK distribution system** for sharing custom or modified APKs.  
- **Local Python scripts** handle all content creation, APK uploads, and JSON management.  
- **Pure static HTML + JS website** (no server-side code, no database) serves the public store.  
- Data lives entirely in JSON files + copied APK/icon files.  
- Client-specific sharing works via URL tokens (`?r=client-token`) – each client gets their own APK variant under the same app page.  
- The site mimics APK Pure-style download pages (icon, name, description, version, big download button, details) but stays 100% static.

### 1. High-Level Architecture & Directory Structure

```
beanis-project/                  # Root folder (your repo)
├── scripts/                     # All local management tools
│   ├── beanis.py                # Main CLI (installable via pip or run directly)
│   ├── templates/               # Jinja2 HTML templates
│   │   ├── base.html
│   │   ├── index.html
│   │   └── app_detail.html
│   └── utils.py                 # JSON helpers, token generation, etc.
├── public/                      # ← This entire folder is your web root (deploy as-is)
│   ├── index.html               # Main store homepage (dynamic via JS)
│   ├── assets/                  # CSS, JS, global images
│   │   ├── css/tailwind.css     # (or CDN)
│   │   └── js/main.js
│   ├── data/
│   │   └── apps.json            # Master list of all configs
│   └── apps/
│       └── <slug>/              # Example: duckduckgo/
│           ├── index.html       # Generated per-app download page
│           ├── apks.json        # All APK variants + client tokens
│           ├── icon.png         # App icon
│           └── apks/            # Actual APK files
│               ├── duck-client1.apk
│               └── duck-client2.apk
├── README.md
├── requirements.txt             # jinja2 (optional: rich for CLI beauty)
└── .gitignore                   # ignore __pycache__, etc.
```

**Why this structure?**  
- Scripts only ever write to `/public/`.  
- Web server only serves static files → works on Netlify, Vercel, GitHub Pages, Nginx, Apache, Cloudflare Pages, etc.  
- Each app is self-contained (easy backup, easy scaling).

### 2. Data Models (JSON Schemas)

**1. `public/data/apps.json`** (array – master index)
```json
[
  {
    "slug": "duckduckgo",
    "name": "DuckDuckGo Privacy Browser",
    "package_id": "com.duckduckgo.mobile.android",
    "short_desc": "Privacy-focused browser",
    "long_desc": "Full description text...",
    "category": "Productivity",
    "icon": "icon.png",
    "last_updated": "2026-04-04",
    "url": "/apps/duckduckgo/"
  }
]
```

**2. `public/apps/<slug>/apks.json`** (per-app file)
```json
{
  "config": { ...copy of fields from apps.json or reference... },
  "variants": [
    {
      "token": "client-abc123xyz",
      "apk_file": "duck-client1.apk",
      "version": "5.8.2",
      "size_mb": 48.7,
      "update_date": "2026-04-04",
      "changelog": "Custom build for Client #1 – removed telemetry"
    }
  ],
  "default_token": null
}
```

### 3. Python CLI Scripts (`beanis.py`)

Use `argparse` + `jinja2` (zero heavy deps). Install with `pip install jinja2 rich` (optional `rich` for nice CLI output).

**Core commands you will have:**

```bash
# Create new app config
python -m scripts.beanis create-config \
  --name "DuckDuckGo" \
  --slug duckduckgo \
  --package-id com.duckduckgo.mobile.android \
  --short-desc "..." \
  --long-desc "..." \
  --icon-path /path/to/icon.png

# Add (or update) an APK variant for a specific client
python -m scripts.beanis add-apk \
  --slug duckduckgo \
  --apk-path /local/apks/duck-custom-v1.apk \
  --token client-abc123xyz \     # you provide or let script auto-generate UUID
  --version 5.8.2 \
  --changelog "Custom build..."

# Utilities
python -m scripts.beanis list-configs
python -m scripts.beanis regenerate-all     # rebuild all HTML pages
python -m scripts.beanis remove-variant --slug duckduckgo --token client-abc123xyz
```

**What the scripts do internally** (workflow):
1. Validate inputs.
2. Create/copy directories and files (`shutil`).
3. Load → modify → save JSON (`json` module).
4. Render HTML from Jinja2 templates (pass data + current date).
5. Update master `apps.json`.

### 4. Web Frontend (Static HTML + JS)

**Homepage (`index.html`)**  
- Hero banner: “Beanis – Free, open APK sharing. No account. No ads. Direct downloads.”  
- Features grid: Client-specific builds • Privacy-first • Instant updates • Self-hosted.  
- Search bar (live JS filter on app cards).  
- Responsive grid of app cards (icon + name + short_desc) – fetched from `/data/apps.json`.  
- “Browse all” or category filters (if you add categories later).

**Per-app download page (`/apps/<slug>/index.html`)** – APK Pure style  
- Hero: big icon, app name, package ID, latest version.  
- Prominent **Download** button (changes based on token).  
- Sections:  
  - Description  
  - What’s new / changelog (from the matched variant)  
  - App details (version, size, update date)  
  - Direct APK link (e.g. `/apps/duckduckgo/apks/duck-client1.apk`)  
- **Client-token logic (pure JS)**:
  ```js
  const params = new URLSearchParams(window.location.search);
  const token = params.get('r');
  const data = await fetch('/apps/duckduckgo/apks.json').then(r => r.json());
  
  const variant = data.variants.find(v => v.token === token);
  if (variant) {
    // Show personalized download button + changelog
    downloadLink.href = `/apps/duckduckgo/apks/${variant.apk_file}`;
  } else {
    // Fallback: show all variants or “Invalid token” message
  }
  ```

Use **Tailwind CSS via CDN** (or build once) for a clean, modern look identical to APK stores.

### 5. Full End-to-End Workflow (How you use Beanis daily)

1. **Add a new app**  
   `beanis create-config ...` → folder + empty apks.json + generated HTML created.

2. **Upload first APK (public or default client)**  
   `beanis add-apk ...` → APK copied, JSON updated, HTML regenerated.

3. **Share to Client #1**  
   `beanis add-apk --token client-abc123xyz ...`  
   → Give them the link: `https://yourdomain.com/apps/duckduckgo/?r=client-abc123xyz`  
   They land on a fully personalized download page with their exact APK.

4. **Update any variant**  
   Re-run `add-apk` with same token → overwrites APK + updates metadata.

5. **Regenerate site** (after manual JSON edits)  
   `beanis regenerate-all`

6. **Deploy**  
   Upload/sync the entire `public/` folder to your static host.  
   Recommended: Vercel (free, instant, custom domain) or Netlify.

### 6. Phased Implementation Plan (Total ~1 week for MVP)

**Phase 1 – Core Scripts (2 days)**  
- Set up project skeleton + CLI skeleton.  
- Implement `create-config` + `add-apk`.  
- Define exact JSON schemas + Jinja2 templates.  
- Test locally with 2–3 dummy apps.

**Phase 2 – Web UI (2–3 days)**  
- Build `index.html` + card grid + search.  
- Build `app_detail.html` template + client-token JS logic.  
- Style to match APK Pure (hero, sections, responsive).  
- Add favicon, meta tags, basic SEO.

**Phase 3 – Polish & Polish (1–2 days)**  
- Add token auto-generation (UUID).  
- Add `list-configs`, validation, error messages.  
- Write full README with examples + deployment guide.  
- Test full flow end-to-end.

**Phase 4 – Launch**  
- Deploy `public/` folder.  
- Create first real config + share test links.  
- Optional: add analytics (simple static counter via external service) or screenshots field later.

### 7. Technologies & Recommendations

- **Scripts**: Python 3.10+ (standard library + Jinja2).  
- **Web**: HTML5 + Tailwind CSS + Vanilla JS (no build step needed).  
- **Hosting**: Vercel / Netlify (best) or any static server.  
- **Version control**: Git (ignore `public/apps/*/apks/*.apk` if they get huge – or use Git LFS).  
- **Optional upgrades later**:  
  - Add screenshots per variant.  
  - Dark mode.  
  - PWA manifest.  
  - Simple stats page (still static).

### 8. Security & Best Practices

- Tokens are **not secrets** – they are just selectors. Use long random strings.  
- Anyone who guesses a direct APK path can download it (normal for static hosting).  
- Use HTTPS.  
- Set correct MIME type for `.apk` (`application/vnd.android.package-archive`).  
- Keep your local `beanis-project` private – only `public/` goes online.  
- Legal note: only distribute APKs you have rights to.

This plan gives you a **fully functional, maintainable, APK Pure-like distribution system** with zero backend cost or complexity.

Would you like me to:
- Generate the complete `beanis.py` CLI code right now?
- Provide the full Jinja2 templates + JS snippets?
- Or start with the exact folder setup + first script skeleton?

Just say the word and we’ll build it step-by-step. Beanis is going to be clean and powerful. 🚀
