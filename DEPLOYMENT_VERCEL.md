# Deploying Cyber-Scan Dashboard to Vercel

This repository is configured to deploy the static Cyber-Scan frontend dashboard directly to **Vercel**.

---

## 1. Project Configuration

- [vercel.json](file:///c:/Users/sujic/Downloads/oops/vercel.json): Configured with `"outputDirectory": "src/main/resources/static"` so Vercel serves the static dashboard directly without requiring complex builds.
- [package.json](file:///c:/Users/sujic/Downloads/oops/package.json): Standardized for Vercel deployment with a clean build command.
- [app.js](file:///c:/Users/sujic/Downloads/oops/src/main/resources/static/js/app.js): Enhanced with `window.API_BASE_URL` support, so the dashboard can talk to your Spring Boot backend either via proxy or direct URL.

---

## 2. Deploying via Vercel Dashboard (Recommended)

1. **Push your changes to GitHub**:
   ```bash
   git add vercel.json package.json src/main/resources/static/js/app.js
   git commit -m "Configure Vercel static dashboard deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your GitHub repository (`adisankar20247-lab/oops`).
   - In **Build and Output Settings**:
     - Vercel will automatically read `vercel.json`.
     - Output Directory will be `src/main/resources/static`.
   - Click **Deploy**.

---

## 3. Deploying via Vercel CLI (Alternative)

If you have Node.js installed, you can deploy directly from your terminal using `npx`:

```bash
# In the project root:
npx vercel
```

- When asked to link to an existing project, select **No** (for first time).
- Confirm project settings and deploy.
- For production:
```bash
npx vercel --prod
```

---

## 4. Connecting your Spring Boot Backend

> [!NOTE]
> Because Vercel is a serverless frontend platform without a Java/JVM runtime, the Spring Boot application (REST API + JPA + MySQL/H2) runs separately.

When you host the Spring Boot backend (e.g. on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io)):

### Option A: Proxy through Vercel rewrites (Recommended)
Edit `vercel.json` to proxy `/api/*` requests to your hosted backend:
```json
{
  "version": 2,
  "outputDirectory": "src/main/resources/static",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://<your-backend-app>.onrender.com/api/:path*"
    }
  ]
}
```

### Option B: Set `window.API_BASE_URL` in `index.html`
In `src/main/resources/static/index.html` before `app.js`:
```html
<script>
  window.API_BASE_URL = "https://<your-backend-app>.onrender.com";
</script>
```
