# Beanis Quick Reference

Fast commands for common tasks.

## 🚀 Quick Start

```bash
# Create new app
python scripts/beanis.py create-config --slug SLUG --name "NAME" --package-id PACKAGE --short-desc "DESC"

# Add APK
python scripts/beanis.py add-apk --slug SLUG --apk-path /path/to/file.apk

# List all apps
python scripts/beanis.py list-configs
```

---

## 📝 Command Reference

### Create App
```bash
python scripts/beanis.py create-config \
  --slug "appname" \
  --name "Display Name" \
  --package-id "com.example.app" \
  --short-desc "Brief description" \
  --long-desc "Full description" \
  --icon-path "/path/to/icon.png" \
  --category "Productivity"
```

### Add APK
```bash
# Basic
python scripts/beanis.py add-apk --slug "appname" --apk-path "/path/to/app.apk"

# With all options
python scripts/beanis.py add-apk \
  --slug "appname" \
  --apk-path "/path/to/app.apk" \
  --token "client-name" \
  --version "1.0.0" \
  --changelog "Release notes"
```

### Manage
```bash
# List apps
python scripts/beanis.py list-configs

# Remove variant
python scripts/beanis.py remove-variant --slug "appname" --token "client-name"

# Regenerate HTML
python scripts/beanis.py regenerate-all
```

---

## 🎯 Common Workflows

### Add Public App
```bash
python scripts/beanis.py create-config --slug "myapp" --name "My App" --package-id "com.app" --short-desc "Desc"
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app.apk"
```

### Add Client-Specific Build
```bash
python scripts/beanis.py add-apk --slug "myapp" --apk-path "client.apk" --token "client-001"
# Share: https://yoursite.com/apps/myapp/?r=client-001
```

### Update APK
```bash
# Same token = same client gets updated APK
python scripts/beanis.py add-apk --slug "myapp" --apk-path "client-v2.apk" --token "client-001"
```

---

## 📂 File Locations

```
public/
├── data/apps.json              # App list
├── apps/{slug}/
│   ├── index.html              # Detail page
│   ├── icon.png                # App icon
│   ├── apks.json              # Variants
│   └── apks/                   # APK files
└── index.html                 # Homepage
```

---

## 🔗 URL Format

```
App page:       https://yoursite.com/apps/{slug}/
Client link:    https://yoursite.com/apps/{slug}/?r={token}
```

---

## ⚙️ Valid Categories

- Productivity
- Communication
- Social
- Entertainment
- Tools
- Shopping
- Games
- Finance
- Health
- Education
- Other

---

## 💡 Pro Tips

### Auto-Generated Tokens
```bash
# Don't specify --token to auto-generate
python scripts/beanis.py add-apk --slug "myapp" --apk-path "file.apk"
# Token displayed in output
```

### Version Detection
```bash
# APK version auto-detected from filename
# Manual override:
python scripts/beanis.py add-apk --slug "myapp" --apk-path "file.apk" --version "2.0.0"
```

### Regenerate After Manual Changes
```bash
# After editing JSON files
python scripts/beanis.py regenerate-all
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| App already exists | Use different `--slug` |
| APK not found | Check file path |
| HTML not updating | Run `regenerate-all` |
| Download broken | Check token matches `apks.json` |

---

## 📊 View Status

```bash
# List all apps
python scripts/beanis.py list-configs

# Check specific app
cat public/apps/{slug}/apks.json

# View files
ls -la public/apps/{slug}/apks/
```

---

## 🚀 Deploy

```bash
# GitHub Pages
git add public/
git commit -m "Update"
git push

# Netlify/Vercel
# Upload public/ folder
```

---

**Full Guide:** See [USER_GUIDE.md](USER_GUIDE.md)
