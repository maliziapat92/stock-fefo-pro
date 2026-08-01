# Deploy to Fly.io

## Quick Start (Takes 5 minutes)

### 1. Install Fly CLI
```bash
# Mac/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to Fly.io
```bash
flyctl auth login
# Opens browser to sign up/login
```

### 3. Deploy
```bash
flyctl deploy
```

That's it! Your app will be live in minutes.

## View Logs
```bash
flyctl logs
```

## Get Your URL
```bash
flyctl info
```

## Set Environment Variables (if needed)
```bash
flyctl secrets set PORT=5000
flyctl secrets set NODE_ENV=production
```

---

**Your app will be available at:** `https://stock-fefo-pro.fly.dev`

(URL will be shown after first deployment)
