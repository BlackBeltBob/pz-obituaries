# pz-obituaries

A memorial gallery for Project Zomboid characters. Living characters can be
edited freely (goals, traits, points of interest visited); when a character
dies, a death form records the details and locks them onto a tombstone.

All character data — including uploaded photos — lives entirely in the
visitor's own browser, in IndexedDB. There is no server-side datastore: the
backend (see below) only serves the built static frontend. This means every
visitor to a shared instance gets their own private, isolated set of
characters, with no shared data to protect and no login required. It also
means the data is only as durable as that browser profile — clearing site
data or switching browsers/devices loses it, so use the Export/Import
buttons in the header to back up to a JSON file (photos embedded as base64)
and restore it later or on another device.

Reference catalogs (skills, POIs, traits, occupations, items, skillbooks)
ship as static JSON under `src/data/` and aren't meant to be edited at
runtime.

## Development

Requires Node 22+.

```bash
npm install
npm run dev
```

This runs the Vite dev server on `:5173`. There's no API to proxy to
anymore — everything happens client-side.

Other scripts:

- `npm run lint` — ESLint
- `npm run build` — type-check and build the frontend to `dist/`

## Running in production

`npm start` runs a minimal Express process that serves the built frontend
from one port (`3001` by default, override with `PORT`) — a pure static
file server plus SPA fallback routing, nothing else. Build first:

```bash
npm run build
npm start
```

Since there's no server-side data, the built `dist/` is equally at home
behind this Express process or on any static host (e.g. GitHub Pages).

### Docker / Synology NAS

A `Dockerfile` and `docker-compose.yml` are included:

```bash
docker compose up -d --build
```

On a Synology NAS, either SSH in and run the `docker compose` command
above from the project folder, or use **Container Manager**'s Project
feature, which reads the same `docker-compose.yml`. `scripts/deploy.sh`
automates a full deploy from a local checkout: it packs the working tree,
ships it to the NAS over `scp`, and runs `docker-compose up -d --build`
there — see the comments at the top of that script for the one-time SSH
key setup it expects.

This app has no authentication. If you expose it beyond your LAN, put it
behind a reverse proxy with auth (Synology's own reverse proxy, or
something like Authelia/Tailscale) rather than port-forwarding it directly
— not because there's shared data to protect anymore, but because anyone
who can reach it can still create/delete characters in their own browser
session.