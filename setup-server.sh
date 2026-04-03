#!/usr/bin/env bash
set -euo pipefail

DOMAIN="caffeineoperator.online"
PROXY_PORT="8081"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
NGINX_LINK="/etc/nginx/sites-enabled/$DOMAIN"
COMPOSE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Redeploying Docker containers..."
cd "$COMPOSE_DIR"
docker compose down
docker compose up -d --build

echo "==> Waiting for container to be ready on port $PROXY_PORT..."
for i in $(seq 1 30); do
    if curl -s -o /dev/null http://127.0.0.1:$PROXY_PORT; then
        echo "    Container is up."
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "    WARNING: Container not responding on port $PROXY_PORT after 30s. Continuing anyway."
    fi
    sleep 1
done

echo "==> Creating host Nginx vhost at $NGINX_CONF..."
sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PROXY_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

if [ ! -L "$NGINX_LINK" ]; then
    echo "==> Enabling site..."
    sudo ln -s "$NGINX_CONF" "$NGINX_LINK"
else
    echo "==> Site already enabled."
fi

echo "==> Testing Nginx config..."
sudo nginx -t

echo "==> Reloading Nginx..."
sudo systemctl reload nginx

echo "==> Requesting SSL certificate..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect

echo ""
echo "Done! https://$DOMAIN should be live."
