# Beanis User Guide

A simple guide to adding new apps and APK variants to your Beanis distribution.

## Table of Contents
- [Quick Start](#quick-start)
- [Adding a New App](#adding-a-new-app)
- [Adding an APK Variant](#adding-an-apk-variant)
- [Managing Apps](#managing-apps)
- [Example Workflow](#example-workflow)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Create a new app configuration
python scripts/beanis.py create-config \
  --slug "myapp" \
  --name "My App Name" \
  --package-id "com.example.myapp" \
  --short-desc "Brief description" \
  --long-desc "Full detailed description"

# 2. Add an APK for the app
python scripts/beanis.py add-apk \
  --slug "myapp" \
  --apk-path "/path/to/app.apk" \
  --version "1.0.0"

# 3. Done! The site is automatically updated
```

---

## Adding a New App

### What You Need
- App icon (PNG format, recommended 512x512px)
- App details (name, package ID, descriptions)
- Category (optional)

### Command Syntax

```bash
python scripts/beanis.py create-config \
  --slug SLUG \
  --name "APP NAME" \
  --package-id PACKAGE_ID \
  --short-desc "SHORT DESCRIPTION" \
  --long-desc "LONG DESCRIPTION" \
  --icon-path /path/to/icon.png \
  --category CATEGORY
```

### Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `--slug` | ✅ Yes | URL-safe identifier | `my-app`, `duckduckgo` |
| `--name` | ✅ Yes | Display name | `"My App"` |
| `--package-id` | ✅ Yes | Android package ID | `"com.example.app"` |
| `--short-desc` | ✅ Yes | Short description | `"A great app"` |
| `--long-desc` | ❌ No | Full description | `"Detailed info..."` |
| `--icon-path` | ❌ No | Path to icon PNG | `"/path/icon.png"` |
| `--category` | ❌ No | App category | `"Productivity"` |

### Valid Categories
- `Productivity`
- `Communication`
- `Social`
- `Entertainment`
- `Tools`
- `Shopping`
- `Games`
- `Finance`
- `Health`
- `Education`
- `Other`

### Example: Create DuckDuckGo App

```bash
python scripts/beanis.py create-config \
  --slug "duckduckgo" \
  --name "DuckDuckGo Privacy Browser" \
  --package-id "com.duckduckgo.mobile.android" \
  --short-desc "Privacy-focused browser" \
  --long-desc "DuckDuckGo Browser provides comprehensive privacy protection" \
  --icon-path "/path/to/icon.png" \
  --category "Productivity"
```

### What Happens
1. Creates directory: `public/apps/{slug}/`
2. Creates `apks.json` file
3. Copies icon to `public/apps/{slug}/icon.png`
4. Adds entry to `public/data/apps.json`
5. Generates HTML page at `public/apps/{slug}/index.html`
6. Regenerates homepage with new app

---

## Adding an APK Variant

### What You Need
- APK file (`.apk`)
- Version number (optional)
- Changelog/release notes (optional)
- Client token (optional - auto-generated if not provided)

### Command Syntax

```bash
python scripts/beanis.py add-apk \
  --slug SLUG \
  --apk-path /path/to/app.apk \
  --token CLIENT_TOKEN \
  --version VERSION \
  --changelog "CHANGELOG TEXT"
```

### Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `--slug` | ✅ Yes | App slug (must exist) | `duckduckgo` |
| `--apk-path` | ✅ Yes | Path to APK file | `"/path/app.apk"` |
| `--token` | ❌ No | Client token (auto-generated) | `"client-123"` |
| `--version` | ❌ No | Version string | `"1.0.0"` |
| `--changelog` | ❌ No | Release notes | `"Bug fixes"` |

### Client Tokens Explained

Tokens allow you to share different APK variants with different clients.

**Without Token (Public Build):**
```bash
python scripts/beanis.py add-apk \
  --slug "myapp" \
  --apk-path "app-v1.apk"
```

**With Token (Client-Specific Build):**
```bash
python scripts/beanis.py add-apk \
  --slug "myapp" \
  --apk-path "app-client1.apk" \
  --token "client-abc123"
```

Each token gets a unique download link:
- Public: `https://yoursite.com/apps/myapp/`
- Client 1: `https://yoursite.com/apps/myapp/?r=client-abc123`
- Client 2: `https://yoursite.com/apps/myapp/?r=client-xyz789`

### Example: Add APK for Client

```bash
python scripts/beanis.py add-apk \
  --slug "duckduckgo" \
  --apk-path "/Downloads/duckduckgo-custom.apk" \
  --token "client-alpha" \
  --version "5.8.2" \
  --changelog "Custom build with enhanced privacy features"
```

### What Happens
1. APK copied to `public/apps/{slug}/apks/{token}.apk`
2. Variant added to `public/apps/{slug}/apks.json`
3. Download link displayed with `?r={token}`
4. HTML pages regenerated

---

## Managing Apps

### List All Apps

```bash
python scripts/beanis.py list-configs
```

Output:
```
┏━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━┓
┃ Slug       ┃ Name                   ┃ Category     ┃ Variants ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━┩
│ duckduckgo │ DuckDuckGo Privacy     │ Productivity │ 2        │
│ myapp      │ My Application         │ Tools        │ 1        │
└────────────┴────────────────────────┴──────────────┴──────────┘
```

### Remove an APK Variant

```bash
python scripts/beanis.py remove-variant \
  --slug "myapp" \
  --token "client-abc123"
```

### Regenerate All HTML

If you manually edit JSON files, regenerate HTML:

```bash
python scripts/beanis.py regenerate-all
```

---

## Example Workflow

### Scenario: Distribute Custom APK to 3 Clients

```bash
# 1. Create the app
python scripts/beanis.py create-config \
  --slug "custombrowser" \
  --name "Custom Privacy Browser" \
  --package-id "com.browser.custom" \
  --short-desc "Custom privacy browser" \
  --long-desc "A customized browser with enhanced privacy features" \
  --icon-path "/tmp/icon.png" \
  --category "Productivity"

# 2. Add public build
python scripts/beanis.py add-apk \
  --slug "custombrowser" \
  --apk-path "/tmp/browser-v1.0.apk" \
  --version "1.0.0" \
  --changelog "Initial public release"

# 3. Add build for Client A
python scripts/beanis.py add-apk \
  --slug "custombrowser" \
  --apk-path "/tmp/browser-clienta.apk" \
  --token "client-a-alpha" \
  --version "1.0.0" \
  --changelog "Custom build for Client A - Removed telemetry"

# 4. Add build for Client B
python scripts/beanis.py add-apk \
  --slug "custombrowser" \
  --apk-path "/tmp/browser-clientb.apk" \
  --token "client-b-beta" \
  --version "1.0.0" \
  --changelog "Custom build for Client B - Added custom branding"

# 5. Add build for Client C
python scripts/beanis.py add-apk \
  --slug "custombrowser" \
  --apk-path "/tmp/browser-clientc.apk" \
  --token "client-c-gamma" \
  --version "1.0.0" \
  --changelog "Custom build for Client C - Preconfigured settings"

# 6. Share the links
# Public:  https://yoursite.com/apps/custombrowser/
# Client A: https://yoursite.com/apps/custombrowser/?r=client-a-alpha
# Client B: https://yoursite.com/apps/custombrowser/?r=client-b-beta
# Client C: https://yoursite.com/apps/custombrowser/?r=client-c-gamma
```

---

## Troubleshooting

### App Already Exists

```
✗ App with slug 'myapp' already exists
```

**Solution:** Use a different slug or remove the existing app first.

### APK File Not Found

```
✗ APK file not found: /path/to/file.apk
```

**Solution:** Check the file path is correct and the file exists.

### Invalid Icon

```
✗ Icon file not found: /path/to/icon.png
```

**Solution:** Ensure icon exists and is a valid PNG file.

### HTML Not Updating

```
✗ Failed to generate HTML
```

**Solution:** Check file permissions and run `regenerate-all` manually:
```bash
python scripts/beanis.py regenerate-all
```

### Download Links Not Working

**Check:**
1. APK file exists in `public/apps/{slug}/apks/`
2. `apks.json` has correct variant data
3. Token matches exactly

---

## File Structure

```
public/
├── data/
│   └── apps.json              # Master app index
├── apps/
│   └── {slug}/                # App directory
│       ├── index.html          # Generated detail page
│       ├── icon.png            # App icon
│       ├── apks.json          # APK variants
│       └── apks/              # APK files
│           ├── {token}.apk
│           └── variant.apk
└── index.html                 # Homepage
```

---

## Data Models

### apps.json (Master Index)
```json
[
  {
    "slug": "myapp",
    "name": "My App",
    "package_id": "com.example.myapp",
    "short_desc": "Brief description",
    "long_desc": "Full description",
    "category": "Productivity",
    "icon": "icon.png",
    "rating": 4.5,
    "downloads": 10000,
    "min_android": "Android 5.0+",
    "last_updated": "2026-04-03",
    "url": "/apps/myapp/"
  }
]
```

### apks.json (Per App)
```json
{
  "config": { ... },
  "variants": [
    {
      "token": "client-abc123",
      "apk_file": "myapp-client.apk",
      "version": "1.0.0",
      "size_mb": 48.7,
      "update_date": "2026-04-03",
      "changelog": "Custom build"
    }
  ],
  "default_token": null
}
```

---

## Pro Tips

### 1. Organize Your APKs
```
my-downloads/
├── icons/
│   └── app-icon.png
└── apks/
    ├── app-v1.0.apk
    ├── app-client1.apk
    └── app-client2.apk
```

### 2. Use Meaningful Tokens
```bash
# Good
--token "client-alpha-release"
--token "beta-tester-01"

# Avoid
--token "randomstring"
```

### 3. Version Naming
```bash
# Semantic versioning recommended
--version "1.0.0"
--version "2.1.0-beta"
--version "3.0.0-rc1"
```

### 4. Backup Before Bulk Changes
```bash
# Backup entire public folder
cp -r public public-backup-$(date +%Y%m%d)
```

---

## Advanced Usage

### Update Existing App

Edit `public/data/apps.json` then regenerate:
```bash
python scripts/beanis.py regenerate-all
```

### Bulk Add APKs

Create a shell script:
```bash
#!/bin/bash
# add-multiple.sh

APPS=("app1" "app2" "app3")
VERSION="1.0.0"

for app in "${APPS[@]}"; do
  python scripts/beanis.py add-apk \
    --slug "$app" \
    --apk-path "/apks/$app-$VERSION.apk" \
    --version "$VERSION"
done
```

### Custom Download Links

The format is always:
```
https://yourdomain.com/apps/{slug}/?r={token}
```

---

## Getting Help

### View All Commands
```bash
python scripts/beanis.py --help
```

### View Specific Command Help
```bash
python scripts/beanis.py create-config --help
python scripts/beanis.py add-apk --help
```

### Check Status
```bash
# List all apps
python scripts/beanis.py list-configs

# Check app directory
ls public/apps/{slug}/

# View APK variants
cat public/apps/{slug}/apks.json
```

---

## Next Steps

After adding apps:
1. ✅ Test download links manually
2. ✅ Verify homepage displays correctly
3. ✅ Check app detail pages
4. ✅ Deploy `public/` folder to your host
5. ✅ Share links with clients

---

## Deployment

### GitHub Pages
```bash
# Push to GitHub
git add public/
git commit -m "Add new app"
git push

# Or push entire public folder
```

### Netlify
```bash
# Drag and drop public/ folder to Netlify dashboard
```

### Vercel
```bash
vercel --prod
```

---

**Need more help?** Check the main README.md or open an issue on GitHub!
