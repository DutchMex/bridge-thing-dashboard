# bridge-thing-dashboard

A custom dashboard for BridgeThing-ed CarThings

## Develop and test on a device

This repository uses the BridgeThing source workspace. Install Bun 1.4.0 or
newer, then install the workspace dependencies:

```sh
bun install
```

With a BridgeThing-enabled Car Thing reachable over USB or the local network:

```sh
bun run dev glass-dashboard          # develop against the connected device
bun run dev:device glass-dashboard   # show the dev server on the Car Thing
bun run push glass-dashboard         # build, install, and activate on hardware
```

The device is found as `bridgething.local` by default. To use another host,
set `SUPERBIRD_HOST` to its hostname or IP address. `bun run check` validates
the app and source before sharing changes.

## Publishing

The app is under `apps/glass-dashboard`. Its stable app ID is in
`apps/glass-dashboard/public/manifest.json`; keep that ID unchanged for future
releases. The source catalog URL is:

```text
https://dutchmex.github.io/bridge-thing-dashboard/catalog.v1.json
```

For a new release, update the app version with
`bun run bump glass-dashboard patch -m "Release notes"`, commit, and push to
`main`. The included GitHub Actions workflow builds the app and publishes the
catalog on the `gh-pages` branch. After the first push, configure GitHub Pages
in **Settings → Pages** to deploy from `gh-pages`, folder `/ (root)`.

Publishing the catalog does not submit it to the BridgeThing directory. When
you decide to list it, run `bun run submit` or paste the catalog URL into
[bridgething.com/apps](https://bridgething.com/apps).
