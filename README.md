# Zukunftsarena – Poll Everywhere

Live poll results on a PowerPoint slide, without Poll Everywhere's presenter chrome.

| File | Purpose |
| --- | --- |
| `poll-wrapper_1.html` | **Voting.** Wraps the `pe.app` response link so participants answer inside the Riddly webapp. |
| `addin/` | **Presenting on a slide.** A PowerPoint content add-in that renders our own page inside the slide. This is the main route. |
| `presenter-clean.js`, `bookmarklets.html`, `build-bookmarklets.py` | **Presenting in a browser.** Bookmarklet that strips the chrome from Poll Everywhere's own presentation view. Fallback / still useful for rehearsals. |
| `results-wrapper.html` | Standalone version of the crop-and-mask tool. Superseded by `addin/live.html`, kept for calibrating outside PowerPoint. |

## Why an add-in

The Poll Everywhere PowerPoint plugin renders the activity as an Office add-in painted
*on top of* the slide, so PowerPoint shapes cannot cover it and cropping the object at
the slide edge cannot reach the `Anonymous <n>` pill, which sits mid-canvas. Research
against Poll Everywhere's own documentation confirmed the pill and the sort icon have
**no hide setting at any plan tier, including Enterprise**, and that Poll Everywhere's
public REST API was retired on 2019-10-01 (`api.polleverywhere.com` no longer resolves),
with no CORS and no webhooks — so re-rendering the chart from an API is not an option
either.

What *does* work: **Send → Share and embed → Live presentation view** yields a URL of the
form `https://embed.polleverywhere.com/<type>/<id>` that is server-rendered, needs no
auth, and sends `frame-ancestors 'self' * capacitor:` — it can be framed cross-origin.
So we frame it in our own page and crop the chrome off, and we put that page on the
slide with our own content add-in.

Note: the legacy `?controls=none&short_poll=true` parameters are now a no-op — verified
byte-identical responses with and without them.

## Setup

### 1. Install the add-in (once per presenting machine)

```bash
./addin/install-mac.sh
```

Quit PowerPoint first. The script copies `manifest.xml` into
`~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef`. A sideloaded add-in
does **not** travel inside the `.pptx` — every machine that presents needs this.

Then in PowerPoint: **Home → Add-ins → My Add-ins → "Zukunftsarena Live"**. It inserts a
box onto the current slide; size and position it like any object.

### 2. Point it at the poll

In Poll Everywhere: activity → **Send** tab → **Share and embed** → **Live presentation
view** → copy the link. Paste it into the add-in's config panel, which appears only in
editing view.

### 3. Crop the chrome

The embed still renders an instruction line and a "Powered by" footer. Use the four crop
sliders to cut them off at the edges, and **+ Abdeckung** for anything mid-canvas — drag
to move, drag the bottom-right corner to resize. Set the colour picker to the poll's
background so the masks are invisible.

Click **Speichern**, then save the presentation (`Cmd+S`). The configuration is stored
per add-in instance via the Office settings API, so it travels inside the `.pptx` and
each slide can show a different question.

### 4. Present

In slideshow the config panel disappears — `getActiveViewAsync` reports `read` and the
page renders results only. If the view can't be determined within 3 seconds the panel
stays visible on purpose: an unconfigurable add-in is worse than a visible panel.

`AllowSnapshot` is `false`, so a network failure shows blank rather than a frozen old
result that looks current.

## Rebuilding the bookmarklets

```bash
python3 build-bookmarklets.py
```

The payload is inlined in the bookmarklet URL because `pe.app` sends
`script-src 'self' … 'unsafe-inline'` — a script loaded from `github.io` would be blocked
by CSP, inline code is not.
