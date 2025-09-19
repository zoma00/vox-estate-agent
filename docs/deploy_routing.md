# Deploy routing and SPA hosting (React + FastAPI)

This document describes how to deploy the React single-page app (SPA) produced by `npm run build` together with a FastAPI backend. It focuses on routing behavior and common server configurations so client-side routes like `/chat` and `/gallery` work in production.

Contents
- Quick summary
- Build output to copy
- Hosting options: Netlify, Vercel
- Self-hosting with Nginx (recommended)
- Self-hosting with Apache
- SPA fallback and BrowserRouter vs HashRouter
- Subpath/base deployments
- Local testing tips

Quick summary
- After running `npm run build` the static assets are in `web-frontend/webfront/build`.
- Serve those static files from a web server. For client-side routes to work with `BrowserRouter`, the server must return `index.html` for unknown paths under the app root (SPA fallback).
- If you cannot configure the server, use `HashRouter` in the React app (URLs become `/#/chat`) so no server rewrite is required.

Build output to copy
- Recommended: create a tarball and copy to your VPS:

```bash
cd web-frontend/webfront
npm run build
tar -czf propestateai_web_build.tgz -C build .
scp propestateai_web_build.tgz user@your-vps:/tmp/
```

Then on the server:

```bash
sudo mkdir -p /var/www/propestateai
sudo tar -xzf /tmp/propestateai_web_build.tgz -C /var/www/propestateai
sudo chown -R www-data:www-data /var/www/propestateai
```

Netlify
- Netlify automatically supports SPAs. Drag-and-drop the `build` folder or connect a repo and set the build command and publish folder:
  - Build command: `npm run build`
  - Publish directory: `web-frontend/webfront/build`
- Netlify will serve `index.html` for client-side routes by default (redirects are handled automatically). Use `_redirects` for custom rewrites if needed.

Vercel
- Vercel also supports SPAs. Connect the repo and configure the output directory to `web-frontend/webfront/build`. Vercel will handle routing for single-page apps and return `index.html` on unknown paths.

Nginx (Self-hosting, recommended)
- Example site config (replace `example.com` and `proxy_pass` target as needed):

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/propestateai;
    index index.html;

    # Serve static files directly, fallback to index.html for SPA routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to FastAPI running on localhost:8000
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Notes:
- `try_files $uri $uri/ /index.html;` ensures unknown paths return `index.html` so `BrowserRouter` can handle the route client-side.
- If your FastAPI app runs behind a different path or port, adjust `proxy_pass` accordingly.

Apache (Self-hosting)
- Enable `mod_rewrite` and add a rewrite rule to send unknown requests to `index.html`:

```apache
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/propestateai

    <Directory /var/www/propestateai>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Fallback to index.html for SPA
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ /index.html [L]

    # Proxy /api/ to FastAPI
    ProxyPass /api/ http://127.0.0.1:8000/api/
    ProxyPassReverse /api/ http://127.0.0.1:8000/api/
</VirtualHost>
```

BrowserRouter vs HashRouter
- BrowserRouter: Clean URLs like `/chat` and `/gallery`. Requires server-side SPA fallback to `index.html` (one of the above `try_files`/Rewrite rules). Recommended if you control the server.
- HashRouter: URLs contain a hash fragment like `/#/chat`. Works without server changes because everything before `#` is handled by the server and the client reads the hash after load. Use this if you deploy to a static host you can't configure.

Subpath / basePath deployments
- If your app will be served from a subpath like `https://example.com/app/`:
  - Set the `homepage` field in `web-frontend/webfront/package.json` to `/app/` (or the full URL).
  - Update the Nginx `location` rules and `try_files` to use `/app/` as the root or add `alias` accordingly.
  - If you use BrowserRouter, set the `basename` prop:
    ```jsx
    <BrowserRouter basename="/app/"> ... </BrowserRouter>
    ```

Local testing tips
- Test SPA fallback locally using `serve` (install with `npm i -g serve`) or `npx serve`:

```bash
cd web-frontend/webfront/build
npx serve -s . -l 5000
```

- Visit `http://localhost:5000/chat` directly to confirm the server returns `index.html` and the SPA renders the `/chat` route.
- If you see a 404, the server is not configured for SPA fallback.

Testing API proxying
- With the frontend served at `/` and the FastAPI backend on `http://127.0.0.1:8000`, requests to `/api/*` should be proxied to the backend. Test with:

```bash
curl -v http://example.com/api/health
```

If you're using relative URLs in the client (e.g., `fetch('/api/tts')`) this proxy will keep the same origin and avoid CORS issues. If your backend is on a different origin, configure CORS in FastAPI and use the full backend URL in the client.

Advanced: systemd + FastAPI (quick example)
- A minimal `systemd` service to run FastAPI with `uvicorn`:

```ini
[Unit]
Description=PropEstateAI FastAPI
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/youruser/propestateai/backend
ExecStart=/home/youruser/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable propestateai-fastapi
sudo systemctl start propestateai-fastapi
```

TLS (Certbot) quick notes
- Use Certbot (Let's Encrypt) with Nginx plugin to obtain TLS certs:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

Wrap up
- If you can provide the target domain and whether you'll host on a VPS or a managed static host (Netlify/Vercel), I can generate a ready-to-run Nginx config, a `systemd` service file, and an upload script (rsync/scp) tailored to your environment.

If you want, I can also add this file to the repository and update the `README.md` with a short deploy checklist.
