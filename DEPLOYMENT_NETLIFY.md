# Deploying Cyber-Scan Dashboard to Netlify

This repository is configured to deploy the Cyber-Scan static frontend dashboard to **Netlify**.

---

## 1. Project Configuration Files

- [netlify.toml](file:///c:/Users/sujic/Downloads/oops%20-%20netify/netlify.toml): Configures Netlify with:
  - `publish = "src/main/resources/static"`
  - `command = "npm run build"`
  - Built-in HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- [package.json](file:///c:/Users/sujic/Downloads/oops%20-%20netify/package.json): Simple build command for Netlify / static hosting.
- [app.js](file:///c:/Users/sujic/Downloads/oops%20-%20netify/src/main/resources/static/js/app.js): Supports `window.API_BASE_URL` and relative `/api/*` proxies.

---

## 2. Deployment Methods

### Method A: Deploy via Netlify Dashboard with GitHub (Recommended)

1. **Commit and push your files**:
   ```bash
   git add netlify.toml package.json src/main/resources/static/js/app.js
   git commit -m "Configure Netlify deployment"
   git push origin main
   ```

2. **Import into Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com) and log in.
   - Click **"Add new site"** &rarr; **"Import an existing project"**.
   - Select **GitHub** and authorize your account.
   - Choose your repository: `adisankar20247-lab/oops`.
   - Netlify will automatically detect [netlify.toml](file:///c:/Users/sujic/Downloads/oops%20-%20netify/netlify.toml):
     - **Base directory**: (leave blank or `/`)
     - **Build command**: `npm run build`
     - **Publish directory**: `src/main/resources/static`
   - Click **Deploy oops**.
   - Netlify will provide your live URL (e.g., `https://cyber-scan-xxxx.netlify.app`).

---

### Method B: Deploy via Netlify CLI (Terminal)

You can deploy directly from your local terminal using the Netlify CLI:

1. **Login to Netlify**:
   ```cmd
   cmd.exe /c "npx netlify login"
   ```
   *(This will open your browser to authorize your Netlify account).*

2. **Deploy to Production**:
   ```cmd
   cmd.exe /c "npx netlify deploy --prod --dir=src/main/resources/static"
   ```
   - When prompted:
     - Choose **Create & configure a new project** (first time).
     - Select your team.
     - Enter site name (optional, or press Enter for a random one).
     - Confirm publish directory: `src/main/resources/static`.
   - Your site will be live immediately!

---

### Method C: Instant Drag-and-Drop (Netlify Drop)

If you want a live URL in 10 seconds without terminal or git:
1. Open [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `src/main/resources/static` folder directly onto the browser window.
3. Your dashboard is instantly deployed.

---

## 3. Connecting your Spring Boot Backend

> [!NOTE]
> Netlify hosts static sites and serverless functions (Node.js/Go). The Java Spring Boot backend (REST API + JPA + Database) runs separately.

When your Spring Boot backend is hosted (e.g., on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io)):

### Option 1: Proxy via `netlify.toml` Redirects (Recommended)
Edit [netlify.toml](file:///c:/Users/sujic/Downloads/oops%20-%20netify/netlify.toml) and uncomment the redirect block:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://<your-backend-service>.onrender.com/api/:splat"
  status = 200
  force = true
```
This avoids CORS issues and keeps all requests on the same domain.

### Option 2: Set `window.API_BASE_URL` in `index.html`
In `src/main/resources/static/index.html` right before `<script src="js/app.js"></script>`:
```html
<script>
  window.API_BASE_URL = "https://<your-backend-service>.onrender.com";
</script>
```
