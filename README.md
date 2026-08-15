# pz-obituaries

A memorial gallery for Project Zomboid characters. Living characters can be
edited freely (goals, traits, points of interest visited); when a character
dies, a death form records the details and locks them onto a tombstone.

Character data is stored as plain JSON files under `server/data/obituaries/`
and uploaded photos under `public/obituaries/` — no database required.
Reference catalogs (skills, POIs, traits, occupations) ship as code under
`server/catalog/` and aren't meant to be edited at runtime.

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

`docker-compose.yml` bind-mounts `server/data` and `public/obituaries` to
real host directories (`/volume1/docker/pz-obituaries-storage/` by
default) rather than Docker-managed named volumes, so the character JSON
and uploaded photos are plain files you can browse and edit directly via
File Station or SSH — the running container reads/writes the exact same
files. Adjust those host paths in `docker-compose.yml` if you want them
somewhere else. On first run, an empty bind-mount directory is seeded with
whatever's baked into the image (the sample characters, unless you've
replaced them); after that, the host directory is the sole source of
truth and image rebuilds never touch it.

On a Synology NAS, either SSH in and run the `docker compose` command
above from the project folder, or use **Container Manager**'s Project
feature, which reads the same `docker-compose.yml`. `scripts/deploy.sh`
automates a full deploy from a local checkout: it packs the working tree,
ships it to the NAS over `scp`, and runs `docker-compose up -d --build`
there — see the comments at the top of that script for the one-time SSH
key setup it expects.

This app has no authentication. If you expose it beyond your LAN, put it
behind a reverse proxy with auth (Synology's own reverse proxy, or
something like Authelia/Tailscale) rather than port-forwarding it directly.