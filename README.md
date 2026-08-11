# Zukunftsarena – Poll Everywhere

| File | Purpose |
| --- | --- |
| `poll-wrapper_1.html` | **Voting.** Wraps the `pe.app` response link so participants can answer inside the Riddly webapp. |
| `presenter-clean.js` | **Presenting.** Hides the Poll Everywhere chrome (response count, `Anonymous` pill, Choices / Results / Lock / Correctness, Exit, page nav) from the presentation view. Runs as a bookmarklet. |
| `bookmarklets.html` | Drag-to-install page for the two bookmarklet variants. Generated — do not edit by hand. |
| `build-bookmarklets.py` | Regenerates `bookmarklets.html` from `presenter-clean.js`. |
| `results-wrapper.html` | Standby. Crops/masks an embedded results view. Needs a results embed URL that Poll Everywhere 2.0 does not currently seem to expose for this activity — see below. |

## The problem

The Poll Everywhere PowerPoint plugin renders the activity as an Office add-in
painted *on top of* the slide, so shapes and cropping in PowerPoint cannot cover
anything it draws. Contrary to Poll Everywhere's docs, the control bar does **not**
auto-hide in Present mode in the current version — verified in both PowerPoint
Present mode and the web presentation view. The `Anonymous <n>` pill also sits
mid-canvas rather than at an edge, so cropping the object at the slide boundary
can't remove it either.

## The fix: `presenter-clean.js`

Present the activity from a **browser** (Poll Everywhere → activity → Present) and
run the bookmarklet. It hides the chrome in the page itself, which works because
this is our own browser on our own screen — no add-in sandbox in the way.

Why a self-contained bookmarklet rather than a hosted script: `pe.app` sends
`script-src 'self' https://cdn-01.pe.app … 'unsafe-inline'`, so an injected
`<script src="…github.io…">` would be blocked by CSP while inline code is allowed.
The whole payload therefore lives in the bookmarklet URL (~7 KB).

How it finds things: by **visible text**, not CSS classes — Poll Everywhere can
rename classes at any time, but the labels stay. From each text hit it walks up the
DOM to the largest ancestor that still fits size limits (max 45 % width / 14 %
height for the pill, 25 % of viewport area overall), which lands on the pill or the
button bar without ever swallowing the question or the answers. A `MutationObserver`
re-applies after every re-render, since Poll Everywhere rebuilds the DOM (Turbo) on
each incoming response. Clicking the bookmarklet a second time restores everything.

Regenerate after editing the script:

```bash
python3 build-bookmarklets.py
```

## Standby: `results-wrapper.html`

Would have been the tidier route — wrap the *embed* view on GitHub Pages, crop the
edges, mask the rest. `embed.polleverywhere.com` and `pollev-embeds.com` both send
`frame-ancestors *`, so they are framable from `*.github.io` (unlike `pe.app`).

It is parked because the activity's **Share & embed** panel only yields the response
link (the voting UI), and no results embed URL could be found:

```
pe.app/response_links/<uuid>/results                    404
pe.app/response_links/<uuid>/questions/<qid>/results    404
embed.polleverywhere.com/questions/<qid>                404
pollev-embeds.com/questions/<qid>                       soft-404
pollev-embeds.com/multiple_choice_polls/<qid>           soft-404
```

If a results embed URL ever does turn up, put it in `DEFAULTS.url` or append
`?url=<embed-url>`, press <kbd>K</kbd> to crop and mask, then **Link kopieren** —
the calibration is stored in the URL hash.
