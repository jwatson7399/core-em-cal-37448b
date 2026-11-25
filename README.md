# Posting calendar (iPhone web app)

A small installable web app: Today, Week and Month views of the X and Instagram posting plan. There is no build step. The page shell stays put; a bot replaces `data.json` each morning and pushes to GitHub Pages.

This is an unlisted public site. The repo name is not obvious, `robots.txt` disallows crawlers, and the page has a noindex tag. There is no login gate.

## Daily update

After the morning calendar refresh writes `/workspace/coreem/calendar-plan/posts-v2.json` from the live Sheet, run:

```
/workspace/coreem/calendar-app/publish.sh
```

That regenerates `data.json` (and refreshes thumbnails or card images if the local sources changed), commits, and pushes to `main`. GitHub Pages serves the new files. No dashboard click is required.

## Install on iPhone

1. Open the live Pages URL in Safari.
2. Share > Add to Home Screen. Leave Open as Web App on.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app. |
| `data.json` | Post data, overwritten each morning. |
| `sw.js` | Service worker for offline use. |
| `manifest.webmanifest` | App name, icon, standalone mode. Relative `start_url` and `scope` (`./`) so it works under the Pages subpath. |
| `icons/` | Home Screen icons. |
| `assets/` | Post thumbnails (`thumb` values of the form `asset:name.jpg` load `assets/name.jpg`). |
| `media/` | Same-site card images for Save media. |
| `robots.txt` | Disallows all crawlers. |
