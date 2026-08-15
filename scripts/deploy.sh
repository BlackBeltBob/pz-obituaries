#!/usr/bin/env bash
# Sync the current working tree to the Synology NAS and build/restart the
# app there natively, then wait for it to come back up.
#
# This builds on the NAS's own x86_64 CPU rather than cross-building on a
# (likely Apple Silicon) Mac and shipping a multi-hundred-MB image tarball:
# QEMU emulation of the build steps (npm ci / tsc / vite build) is slower
# than the NAS just building it natively, and syncing source is a much
# smaller transfer than a full pre-built image.
#
# Source is shipped as a single tar.gz over scp rather than rsync: macOS's
# bundled `openrsync` fails authenticating against this NAS's GNU rsync in a
# way that a plain ssh/scp does not (confirmed: ssh auth succeeds, but the
# rsync session itself then dies with a bogus "Permission denied" once the
# remote rsync process starts) — not worth chasing further when scp already
# works reliably here.
#
# Usage: ./scripts/deploy.sh
#
# Requires: local `tar`/`scp`, and the `pz-nas` SSH host set up in
# ~/.ssh/config with key-based auth. `sudo` on the NAS still prompts for
# your DSM password interactively — that's separate from SSH auth and
# expected.

set -euo pipefail

NAS_HOST="pz-nas"
NAS_PATH="/volume1/docker/pz-obituaries"
REMOTE_TAR="/tmp/pz-obituaries-src.tar.gz"
CONTAINER_NAME="pz-obituaries_pz-obituaries_1"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

LOCAL_TAR="/tmp/pz-obituaries-src-$$.tar.gz"
trap 'rm -f "${LOCAL_TAR}"' EXIT

echo "==> [1/4] Packing source"
tar czf "${LOCAL_TAR}" \
  --no-xattrs --no-acls --no-fflags \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='dist-ssr' \
  --exclude='logs' \
  --exclude='*.log' \
  --exclude='.vscode' \
  --exclude='.idea' \
  --exclude='.DS_Store' \
  --exclude='*.local' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.claude' \
  .
echo "OK: $(du -h "${LOCAL_TAR}" | cut -f1) packed"

echo "==> [2/4] Copying source to ${NAS_HOST}:${REMOTE_TAR}"
# -O: use the legacy SCP protocol. Synology's sshd doesn't have the SFTP
# subsystem enabled, which modern scp otherwise defaults to (and fails
# against with "subsystem request failed").
if ! scp -O "${LOCAL_TAR}" "${NAS_HOST}:${REMOTE_TAR}"; then
  echo "FAILED: could not copy the source to the NAS. Nothing there has changed." >&2
  exit 1
fi
echo "OK: source copied"

echo "==> [3/4] Extracting and building on the NAS"
# `ssh host "command"` runs a *non-login* shell, which on Synology doesn't
# source the profile scripts that put Container Manager's binaries on PATH
# (that only happens for an actual interactive login). Source /etc/profile
# explicitly so `command -v docker-compose` can find it.
#
# No `sudo` needed here: bobwansink is a member of the `docker` group and
# /var/packages/Docker/etc/dockerd.json sets "group": "docker", so the
# Docker socket is group-accessible directly (set up 2026-08-15). If a
# future Container Manager update resets that config file, these commands
# will start failing with a socket permission error — see the group/socket
# setup notes from that date for how to redo it.
REMOTE_CMD="
set -e
source /etc/profile
mkdir -p '${NAS_PATH}'
tar xzf '${REMOTE_TAR}' -C '${NAS_PATH}'
rm -f '${REMOTE_TAR}'
cd '${NAS_PATH}'
COMPOSE_BIN=\$(command -v docker-compose || true)
if [ -z \"\$COMPOSE_BIN\" ]; then
  echo 'REMOTE FAILED: docker-compose not found on PATH, even after sourcing /etc/profile.' >&2
  exit 1
fi
# Compose v1 (1.28.5 on this NAS) preserves an existing container's actual
# volumes on recreate, silently ignoring any volume-mapping change in this
# file (--force-recreate does not override that) — confirmed 2026-08-15 when
# switching data/photos from named volumes to bind mounts had no effect
# until the old container was removed outright first.
\"\$COMPOSE_BIN\" rm -sf pz-obituaries
\"\$COMPOSE_BIN\" up -d --build
echo 'REMOTE OK: built and container recreated'
"
if ! ssh -t "${NAS_HOST}" "${REMOTE_CMD}"; then
  echo "FAILED: extract/build/restart failed on the NAS (see output above for why)." >&2
  exit 1
fi
echo "OK: container restarted on the NAS"

echo "==> [4/4] Waiting for the app to come back up..."
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null "http://10.0.0.80:3001/"; then
    echo "SUCCESS: deployed and responding at http://10.0.0.80:3001"
    exit 0
  fi
  sleep 1
done

echo "FAILED: container restarted, but the app didn't respond within 15s." >&2
echo "        Check logs with: ssh ${NAS_HOST} 'sudo docker logs ${CONTAINER_NAME} --tail 50'" >&2
exit 1
