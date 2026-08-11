# Zukunftsarena – Poll Everywhere

Two GitHub Pages wrappers around the same Poll Everywhere activities.

| File | Purpose | Where it runs |
| --- | --- | --- |
| `poll-wrapper_1.html` | **Voting.** Wraps the `pe.app` response link so participants can answer inside the Riddly webapp. Has a "Umfrage aktualisieren" button that rebuilds the iframe with a cache buster. | Riddly webapp |
| `results-wrapper.html` | **Presenting.** Wraps the Poll Everywhere *embed* view and strips the presenter chrome (response count, "Anonymous" badge, Edit / Choices / Results / Lock / Correctness bar) that the PowerPoint plugin always draws. | PowerPoint slide / browser |

## Why a second wrapper instead of configuring PowerPoint

The Poll Everywhere PowerPoint plugin renders the activity as an Office add-in, which
paints *on top of* the slide. Shapes, rectangles, and cropping in PowerPoint can never
cover it, and the plugin exposes no option to hide the badge or the control bar.

The embed view (`embed.polleverywhere.com` / `pollev-embeds.com`) is a different render
of the same live activity. Those hosts send `Content-Security-Policy: frame-ancestors *`,
so they can be framed from `*.github.io` — which means we control the surrounding page and
can crop or mask anything that is left.

## Setup for `results-wrapper.html`

1. **Get the embed URL.** In Poll Everywhere open the activity → `Send` / `Share` tab →
   **Share & embed** → **Embed**. Take only the URL out of the snippet. It looks like:

   ```
   https://embed.polleverywhere.com/multiple_choice_polls/<ID>?controls=none&short_poll=true
   ```

   `controls=none` already removes the Poll Everywhere control elements.

2. **Point the wrapper at it** — either edit `DEFAULTS.url` in `results-wrapper.html`, or
   append `?url=<embed-url>` to the page URL. One file works for every activity.

3. **Calibrate.** Open the page and press <kbd>K</kbd>:
   - the four sliders crop the top / bottom / left / right edge (in % of the stage),
     which is how the header and footer bars get cut off;
   - **+ Abdeckung** adds a rectangle in the background colour to cover anything that
     is *not* on an edge (the "Anonymous 0" pill). Drag to move, drag the bottom-right
     corner to resize;
   - the colour picker sets both page background and mask colour — match it to the poll
     background so the masks are invisible.

4. **Copy link.** "Link kopieren" writes the whole calibration into the URL hash
   (`#cfg=<base64>`). That link is self-contained — nothing else needs to be deployed.

5. **Put it on the slide.** In the Poll Everywhere desktop app: `Poll Everywhere` →
   `Insert` → `Web page`, paste the calibrated link. Keep the slide's speaker notes
   intact — the app stores the URL there. (Microsoft's own "Web Viewer" add-in is being
   retired, so prefer the Poll Everywhere route.)

   Fallback with zero add-ins: open the link fullscreen in a browser and switch to it
   for the poll moment.

### Keyboard

| Key | Action |
| --- | --- |
| <kbd>K</kbd> | toggle calibration panel |
| <kbd>R</kbd> | rebuild the iframe (fresh session, cache-busted) |
