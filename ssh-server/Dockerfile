FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN rm -f host.key

EXPOSE 2222

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const net = require('net'); const s = net.createConnection(2222, 'localhost', () => { s.end(); process.exit(0); }); s.on('error', () => process.exit(1));"

CMD ["node", "server.js"]
