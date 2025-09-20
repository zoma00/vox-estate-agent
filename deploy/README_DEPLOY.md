PropEstateAI - Deploy guide (quickstart)

This folder contains helper templates and a deploy script to get an MVP demo running on a remote Linux server.

Files
- `scripts/deploy.sh` - build frontends, upload artifacts and backend directory to a remote server. Usage: `./scripts/deploy.sh <server> <user> <remote_base_dir>`
- `deploy/nginx-systemd/propestate-nginx.conf.template` - nginx server block template. Replace `YOUR_DOMAIN_OR_IP` and `root` paths as needed.
- `deploy/nginx-systemd/realestate-uvicorn.service.template` - systemd service unit template for Uvicorn (edit `User`, `WorkingDirectory`, and `Environment` PATH).

Quick steps after running `scripts/deploy.sh`
1. SSH into the remote server: `ssh user@server`
2. Install Python & create venv, install requirements
   ```bash
   cd /var/www/propestate/backend/realestate_agent
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configure environment variables (API keys) in `/etc/environment` or a dedicated file referenced by systemd unit.
4. Copy nginx template to sites-available, update server_name and root path, then enable it:
   ```bash
   sudo cp deploy/nginx-systemd/propestate-nginx.conf.template /etc/nginx/sites-available/propestate
   # edit /etc/nginx/sites-available/propestate and set server_name and root
   sudo ln -s /etc/nginx/sites-available/propestate /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
5. Install systemd unit (edit the template and move it into /etc/systemd/system):
   ```bash
   sudo cp deploy/nginx-systemd/realestate-uvicorn.service.template /etc/systemd/system/realestate-uvicorn.service
   sudo systemctl daemon-reload
   sudo systemctl enable realestate-uvicorn.service
   sudo systemctl start realestate-uvicorn.service
   ```
6. Verify the site
   - Visit `http://YOUR_SERVER/` for web frontend
   - Visit `http://YOUR_SERVER/api/docs` for FastAPI docs (if enabled)

Notes & tips
- If builds fail on the server due to node env, build locally and use `scp` to copy the `build/` and `dist/` folders instead.
- If you want HTTPS, run Certbot and enable HTTPS in nginx. If you don’t have a domain, consider using ngrok for a quick public URL.
- This guide aims for an MVP demo. For production consider using Docker, a CI pipeline, and a managed database.
