# pz-obituaries

A memorial gallery for Project Zomboid characters. Living characters can be
edited freely (goals, traits, points of interest visited); when a character
dies, a death form records the details and locks them onto a tombstone.

Data is stored as plain JSON files under `server/data/` and uploaded photos
under `public/obituaries/` — no database required.

## Development

Requires Node 22+.

```bash
npm install
npm run dev
```

This runs the Vite dev server (`:5173`) and the Express API (`:3001`)
together, with `/api` proxied from the client to the server.

Other scripts:

- `npm run lint` — ESLint
- `npm run build` — type-check and build the frontend to `dist/`

## Running in production

`npm start` runs a single Express process that serves the built frontend,
the API, and uploaded images all from one port (`3001` by default, override
with `PORT`). Build first:

```bash
npm run build
npm start
```

### Docker / Synology NAS

A `Dockerfile` and `docker-compose.yml` are included:

```bash
docker compose up -d --build
```

or without Compose:

```bash
docker build -t pz-obituaries .
docker run -d \
  --name pz-obituaries \
  -p 3001:3001 \
  -v pz-obituaries-data:/app/server/data \
  -v pz-obituaries-photos:/app/public/obituaries \
  pz-obituaries
```

The two volumes hold your character data and uploaded photos, so they
survive rebuilding or updating the image. On first run they'll be seeded
with whatever is baked into the image (the sample characters, unless
you've replaced them).

On a Synology NAS, either SSH in and run the `docker compose` command above
from the project folder, or use **Container Manager**'s Project feature,
which reads the same `docker-compose.yml` — point it at the project folder
and it builds and starts it for you. Swap the named volumes for bind mounts
to a Synology shared folder if you'd rather browse the JSON/photos directly
from File Station.

This app has no authentication. If you expose it beyond your LAN, put it
behind a reverse proxy with auth (Synology's own reverse proxy, or
something like Authelia/Tailscale) rather than port-forwarding it directly.