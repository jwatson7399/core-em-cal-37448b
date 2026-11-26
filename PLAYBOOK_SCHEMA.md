# playbook.json schema

schemaVersion 1. One JSON object. Future daily or weekly runs append to lists and refresh stats without changing app code. The file lives next to data.json in the site folder and is read by the Playbook tab in index.html.

Top-level fields:
- schemaVersion (number)
- asOf (string, human stamp in America/New_York, for example "Thursday, November 26, 2026, 10:34 AM ET")
- asOfIso (string, ISO-8601 with offset). The app prefers this for the header stamp and falls back to asOf.
- timezone (string, "America/New_York")
- scope (string)
- sources (object of named source strings). Values starting with https:// are shown as links.
- metricsNotes (object): publiclyAvailable and notPubliclyAvailable (arrays of strings), engagementRateDefinition (string)
- account (object): handle, userId, name, verified, verifiedType, createdAt, description, followers, following, tweetCount, listedCount, mediaCount, lifetimeLikesGiven, source, asOf
- followerTrend (array of {asOf, followers, source}), oldest first
- recentPosts (array of post objects, newest first): id, url, createdAtET, title, format, likes, impressions, bookmarks, reposts, replies, quotes, videoViews (number or null), firstLine, engagementRatePct
- topPosts (array, usually 3): same post fields plus rank and rankedBy
- currentRules, priorRules, proposedRules (arrays of rule objects)
- evidence (array of dated log entries, oldest first; append new entries to the end)
- observedEffects (array of change logs; append new entries)

Date and time strings the app can read:
- "YYYY-MM-DD" for rule and log dates.
- "YYYY-MM-DD H:MM AM ET" (createdAtET, followerTrend asOf, frozenAt).
- "Weekday, Month D, YYYY, H:MM AM ET" (asOf, liveRefreshAt).
The time part is optional. Anything else is shown as plain text.

Rule object:
- id (string, stable)
- title, detail (strings)
- status: "current" | "prior" | "proposed"
- adopted and/or proposedOn and/or replacedOn (YYYY-MM-DD or null if unknown)
- replacedBy (id, for prior rules). The app links both ways: a current rule lists the rules it replaced.
- source (string)
- items (optional array; used for the held hooks). Each item: date (YYYY-MM-DD), title, hook. Any other string or number field on an item is shown as a labeled line.

Evidence entry:
- id, logged (YYYY-MM-DD), loggedAt, title, sample (object), source (array of strings, or one string), headline, findings (array), caveats (array)
- sample: number values are shown as tiles, string values as labeled lines. Keys are turned into labels (peerPosts becomes "Peer posts").
- findings: objects {n, finding, numbers, strength}, or plain strings.

Observed-effect entry:
- id, change, startDate, endDatePlanned, status, results, note
- status: free text. Words like "in progress" or "running" show blue; "complete" or "done" green; "stopped" or "cancelled" red.
- baseline (object): label, frozenAt, frozenSource, frozenMedians, liveRefreshAt, liveRefreshSource, liveMedians, posts (array of post objects)
- after (object or null until results exist). When results exist, use this shape:
  - label (string), measuredAt (string, same formats as above), source (string)
  - medians (object, same keys as frozenMedians: impressions, likes, bookmarks, reposts, replies, engagementRatePct)
  - posts (array of post objects that went out under the change)
  - summary (optional string, one or two plain sentences)
  The app shows each after median with its change against frozenMedians (percent for counts, percentage points for engagement rate).

Median keys the app knows by name: impressions, likes, bookmarks, reposts, replies, quotes, engagementRatePct. Other numeric keys still show, with a label made from the key.

Engagement rate is 100 * (likes + reposts + replies + quotes + bookmarks) / impressions.
Impressions are post public_metrics.impression_count. videoViews are native video view_count and are not impressions.
Never invent numbers. If a field is unknown, use null or omit it and say so in the UI.

Changes in this revision (still schemaVersion 1, fully backward compatible): documented the after shape, item fields, accepted date formats, and how the app orders and shows each list. No field was renamed or removed.

Hook item (inside proposedRules[].items):
- date, title, hook (strings)
- optional status and note (strings). Used to flag a hook that must not ship as written. The tab prints these as extra lines under the hook.
- optional other string or number fields also show under the hook.
