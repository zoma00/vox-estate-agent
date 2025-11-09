# Guide: Deploying React Frontend Build to Remote Server

This guide documents the steps and troubleshooting for copying your React build to a remote server and preparing it for production use with nginx.

---

## 1. Build the React Frontend Locally

In your local project directory:
```bash
npm run build
```
This creates a production build in `web-frontend/webfront/build/`.

---

## 2. Copy Build Files to Remote Server

Use `scp` to copy the build files to your server's deployment directory:
```bash
scp -r /home/hazem-elbatawy/Downloads/vox-estate-agent/web-frontend/webfront/build/* deploy@84.201.4.127:/opt/vox-estate-agent/web-frontend/dist/
```
- Replace `deploy@84.201.4.127` with your server's user and IP if different.
- If you get `Permission denied`, see step 3.

---

## 3. Fix Permissions on the Server

If you get permission errors, SSH into your server as root or with sudo privileges:
```bash
sudo -i
chown -R deploy:deploy /opt/vox-estate-agent/web-frontend/dist
chmod -R 775 /opt/vox-estate-agent/web-frontend/dist
```
Then retry the `scp` command.

---

## 4. Set Ownership for nginx

After copying, set ownership for nginx to serve the files:
```bash
chown -R www-data:www-data /opt/vox-estate-agent/web-frontend/dist
chmod -R 755 /opt/vox-estate-agent/web-frontend/dist
```

---

## 5. Reload nginx

Reload nginx to apply changes:
```bash
systemctl reload nginx
```

---

## 6. Troubleshooting Asset 404s

If you see 404 errors for assets like `/static/js/main.*.js` or `/static/css/main.*.css`:
- Check your nginx config for a conflicting `location /static/` block.
- Remove or comment out this block if it points to your backend static folder.
- Only use a separate block for backend audio files if needed (e.g., `/static/audio/`).

Example fix:
```nginx
# Remove or comment out this block:
# location /static/ {
#     alias /opt/vox-estate-agent/backend/realestate_agent/static/;
#     expires 1d;
#     add_header Cache-Control "public";
# }
```

Reload nginx after editing:
```bash
systemctl reload nginx
```

---

## 7. Verify Deployment

- Visit your site in the browser.
- Check that all assets load and the SPA works.
- If you see issues, check file permissions and nginx config.

---

**Summary:**
- Build locally, copy with `scp`, fix permissions, set nginx ownership, reload nginx, and check for asset path conflicts in nginx config.

Let me know if you need more help or want to automate these steps!