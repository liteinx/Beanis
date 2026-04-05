# Beanis - Token & URL Features

## ✅ Auto Token Generation

**Tokens are automatically generated** if you don't provide `--token`:

```bash
# Auto-generates token (UUID)
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app.apk"

# Output example:
# Token: ed96fec70b7249e8b3329e5115ae831d
```

### Token Format
- **Type:** UUID v4 (32 character hex string)
- **Example:** `ed96fec70b7249e8b3329e5115ae831d`
- **Secure:** Random and unique for each build
- **First 8 chars** used in APK filename for easy identification

---

## 📋 Enhanced URL Output

When you add an APK, you now get **multiple URL formats**:

### Example Output
```bash
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app.apk"
```

**Output:**
```
✓ ✓ APK added successfully!

ℹ Local file:
  → public/apps/myapp/apks/myapp-ed96fec7.apk

ℹ Local URL:
  → file:///home/user/Beanis/public/apps/myapp/index.html?r=ed96fec70b7249e8b3329e5115ae831d

ℹ GitHub Pages URL:
  → https://username.github.io/Beanis/apps/myapp/?r=ed96fec70b7249e8b3329e5115ae831d
```

---

## 🔗 URL Formats Explained

### 1. Local File Path
```
public/apps/{slug}/apks/{apk_file}
```
**Use for:** Checking the file was copied correctly

### 2. Local URL (Testing)
```
file:///full/path/to/public/apps/{slug}/index.html?r={token}
```
**Use for:** Opening directly in browser for local testing

### 3. GitHub Pages URL
```
https://{username}.github.io/{repo}/apps/{slug}/?r={token}
```
**Use for:** Sharing with clients after deployment

**Auto-detected from:** `git remote -v`

---

## 🎯 Quick Examples

### Without Token (Auto-Generated)
```bash
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app.apk"
# Token automatically: a1b2c3d4e5f6...
# GitHub URL: https://username.github.io/Beanis/apps/myapp/?r=a1b2c3d4e5f6...
```

### With Custom Token
```bash
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app.apk" --token "client1"
# GitHub URL: https://username.github.io/Beanis/apps/myapp/?r=client1
```

### Without Version (Auto-Detected)
```bash
python scripts/beanis.py add-apk --slug "myapp" --apk-path "app-v1.0.apk"
# Version auto-detected from filename
```

---

## 📊 Shareable Link Structure

### URL Components
```
https://username.github.io/Beanis/apps/{slug}/?r={token}
       │                │       │       │    │
       │                │       │       │    └─ Token parameter
       │                │       │       └────── App slug
       │                │       └────────────── Apps directory
       │                └────────────────────── Repository name
       └────────────────────────────────────── GitHub username
```

### Query Parameter
```
?r={token}
```
- **`r`** = "release" or "variant"
- **`token`** = unique identifier for the build

---

## 💡 Pro Tips

### 1. Copy Token for Quick Re-use
```bash
# First time - shows token
python scripts/beanis.py add-apk --slug "myapp" --apk-path "v1.apk"
# Token: abc123... (copy this)

# Next time - use same token to update
python scripts/beanis.py add-apk --slug "myapp" --apk-path "v2.apk" --token "abc123..."
```

### 2. Generate Multiple Tokens at Once
```bash
# Use bash to generate multiple builds
for client in client1 client2 client3; do
  python scripts/beanis.py add-apk \
    --slug "myapp" \
    --apk-path "${client}.apk" \
    --token "${client}"
done
```

### 3. Test Locally Before Deploying
```bash
# Use the local URL to test
file:///home/user/Beanis/public/apps/myapp/index.html?r=token

# Or use a simple HTTP server
cd public
python3 -m http.server 8000
# Open: http://localhost:8000/apps/myapp/?r=token
```

### 4. Version Your Builds
```bash
# Include version in APK filename for auto-detection
python scripts/beanis.py add-apk \
  --slug "myapp" \
  --apk-path "myapp-2.1.0.apk"  # Version auto-detected
```

---

## 🔒 Token Security

### Token Properties
- **Format:** 32-character hex string (UUID without dashes)
- **Entropy:** 122 bits (cryptographically secure)
- **Collision probability:** Virtually impossible
- **Example:** `ed96fec70b7249e8b3329e5115ae831d`

### Security Notes
1. **Tokens are identifiers, not secrets**
   - Anyone with the link can download
   - Use HTTPS for传输 protection
   - Don't embed sensitive data in tokens

2. **Token generation**
   ```python
   # Uses Python's uuid4 (RFC 4122)
   import uuid
   token = str(uuid.uuid4()).replace("-", "")
   # Example output: "ed96fec70b7249e8b3329e5115ae831d"
   ```

3. **Best practices**
   - Use descriptive tokens for client builds: `client-acme`, `beta-tester-01`
   - Store token-to-client mapping locally (not in public repo)
   - Rotate tokens periodically if needed

---

## 🚀 Deployment URLs

### GitHub Pages
```
https://{username}.github.io/{repository}/apps/{slug}/?r={token}
```

### Custom Domain
```
https://customdomain.com/apps/{slug}/?r={token}
```

### Local Testing
```
file://{project-root}/public/apps/{slug}/index.html?r={token}
```

### Subdirectory Hosting
```
https://domain.com/subdir/apps/{slug}/?r={token}
```

---

## 📋 Checklist

When adding an APK, you'll see:

- ✅ **Token** - Auto-generated or custom
- ✅ **APK filename** - `{slug}-{token[:8]}.apk`
- ✅ **Version** - Auto-detected or manual
- ✅ **Size** - Auto-calculated
- ✅ **Date** - Today's date
- ✅ **Changelog** - Default or custom
- ✅ **Local file path** - Where it's stored
- ✅ **Local URL** - For testing
- ✅ **GitHub URL** - For sharing

---

## 🎓 Summary

| Feature | Status |
|---------|--------|
| Auto token generation | ✅ Implemented |
| Token format | ✅ UUID v4 (32 chars) |
| Auto version detection | ✅ From filename |
| Auto size calculation | ✅ In MB |
| Print all URLs | ✅ Local + GitHub |
| Git remote detection | ✅ Automatic |
| Custom tokens | ✅ Supported |

---

**Need help?** See [USER_GUIDE.md](USER_GUIDE.md) or [QUICKREF.md](QUICKREF.md)
