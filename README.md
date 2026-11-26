# Posting calendar (iPhone web app)

A small installable web app: Today and Calendar views of the X and Instagram posting plan, plus a Playbook tab for X. There is no build step. The page shell stays put; a bot replaces `data.json` each morning (and `playbook.json` when the playbook changes) and pushes to GitHub Pages.

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
| `playbook.json` | Playbook tab data (X only). Edited by the playbook run, not by `build_data.py`. |
| `sw.js` | Service worker for offline use. |
| `manifest.webmanifest` | App name, icon, standalone mode. Relative `start_url` and `scope` (`./`) so it works under the Pages subpath. |
| `icons/` | Home Screen icons. |
| `assets/` | Post thumbnails (`thumb` values of the form `asset:name.jpg` load `assets/name.jpg`). |
| `media/` | Same-site card images for Save media. |
| `robots.txt` | Disallows all crawlers. |

## Playbook tab and `playbook.json`

The Playbook tab shows the living X playbook for @Core_EM: account stats and trends, current, prior, and proposed rules, a dated evidence log, and observed effects of deliberate changes. It is X only. Every number, rule, and log line comes from `playbook.json`, which sits next to `data.json` in the site folder. Nothing about the playbook is written into `index.html`, so a daily or weekly run can update the tab by editing the JSON alone.

Publishing: `build_data.py` does not touch `playbook.json`. The playbook run writes it into the site folder, and `publish.sh` (or a plain `git add playbook.json && git commit && git push`) ships it. The header refresh button reloads both files. The service worker caches `playbook.json` network first, like `data.json`, so the tab works offline after one load. The page also keeps the last good copy in localStorage.

Schema (version 1, full detail in `PLAYBOOK_SCHEMA.md`):

| Field | What the tab does with it |
|---|---|
| `schemaVersion` | If higher than the page knows (1), a banner says some parts may not show. |
| `asOf`, `asOfIso` | Header stamp "As of H:MM AM ET" and the stats card stamp. Older than 7 days shows a warning banner. |
| `scope`, `sources` | Scope line at the top; Data sources box at the bottom. `https://` values become links; paths show as text. |
| `metricsNotes` | "Not shown publicly by X" list, "What this pull can see", and the engagement rate definition. |
| `account` | Followers headline, plus following, posts, lists, media. |
| `followerTrend[]` | Follower sparkline and readings list. Needs 2 or more readings. Sorted by `asOf` time. |
| `recentPosts[]` | Median per post and a sparkline for likes, views (impressions), bookmarks, reposts, replies, engagement rate; then one row per post. `videoViews` shows as "video views", never as views. |
| `topPosts[]` | Ranked list with "Open post on X" links. Sorted by `rank`. |
| `currentRules[]` | Newest `adopted` first. Shows which prior rules each one replaced. |
| `priorRules[]` | Newest `replacedOn` first, with what replaced it. |
| `proposedRules[]` | Dashed outline and a "Proposed, not adopted" tag. `items[]` (date, title, hook) list under a "Show N held first lines" panel. |
| `evidence[]` | Append new entries to the end. Shown newest `logged` first; the newest one opens by default. |
| `observedEffects[]` | Append new entries to the end. Shown newest `startDate` first, with a day counter, a Baseline / Re-read / After table, and baseline and after post lists. Leave `after` as `null` until results exist; the column then reads "not yet". |

Rules for the run that edits it: never invent a number; use `null` or leave a field out when X does not give it. Keep ids stable. Append to `evidence` and `observedEffects` rather than rewriting old entries.
