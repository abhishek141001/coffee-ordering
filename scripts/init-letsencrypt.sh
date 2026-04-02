#!/bin/bash

# Initial SSL certificate provisioning for caffeineoperator.online
# Run this once on first deployment

set -e

DOMAINS=(caffeineoperator.online www.caffeineoperator.online)
EMAIL="" # Add your email for Let's Encrypt notifications
DATA_PATH="./certbot"
RSA_KEY_SIZE=4096

# Check if certificates already exist
if [ -d "/var/lib/docker/volumes/$(basename $(pwd))_certbot_conf/_data/live/caffeineoperator.online" ]; then
  echo "Certificates already exist. Skipping initialization."
  exit 0
fi

echo "### Creating dummy certificate for ${DOMAINS[0]} ..."
mkdir -p "$DATA_PATH/conf/live/caffeineoperator.online"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
    -keyout '/etc/letsencrypt/live/caffeineoperator.online/privkey.pem' \
    -out '/etc/letsencrypt/live/caffeineoperator.online/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx

echo "### Deleting dummy certificate ..."
docker compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/caffeineoperator.online && \
  rm -rf /etc/letsencrypt/archive/caffeineoperator.online && \
  rm -rf /etc/letsencrypt/renewal/caffeineoperator.online.conf" certbot

echo "### Requesting Let's Encrypt certificate for ${DOMAINS[*]} ..."

# Build domain args
DOMAIN_ARGS=""
for domain in "${DOMAINS[@]}"; do
  DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
done

# Select appropriate email arg
if [ -z "$EMAIL" ]; then
  EMAIL_ARG="--register-unsafely-without-email"
else
  EMAIL_ARG="--email $EMAIL"
fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $EMAIL_ARG \
    $DOMAIN_ARGS \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal" certbot

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

echo "### Done! SSL certificates are now installed."
