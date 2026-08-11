FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Character data and uploaded photos live here. Mount these to host
# directories so they survive container recreation/image updates.
VOLUME ["/app/server/data", "/app/public/obituaries"]

CMD ["npm", "run", "start"]