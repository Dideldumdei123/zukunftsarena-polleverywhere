#!/usr/bin/env python3
"""Baut bookmarklets.html aus presenter-clean.js.

Der Code muss vollstaendig im Bookmarklet stecken: die Content-Security-Policy
von pe.app erlaubt unter script-src nur 'self', cdn-01.pe.app und 'unsafe-inline'.
Ein nachgeladenes Script von github.io wuerde blockiert, Inline-Code nicht.

    python3 build-bookmarklets.py
"""

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).parent
SRC = ROOT / "presenter-clean.js"
OUT = ROOT / "bookmarklets.html"


def strip_comments(js: str) -> str:
    js = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
    js = re.sub(r"^\s*//.*$", "", js, flags=re.M)
    js = re.sub(r"[ \t]+//[^\n\"']*$", "", js, flags=re.M)
    js = re.sub(r"\n{2,}", "\n", js)
    return js.strip()


def bookmarklet(js: str, hide_header: bool) -> str:
    if hide_header:
        js, n = re.subn(r"var HIDE_HEADER = false;", "var HIDE_HEADER = true;", js)
        assert n == 1, "HIDE_HEADER-Schalter nicht gefunden"
    return "javascript:" + quote(js, safe="")


def main() -> None:
    js = strip_comments(SRC.read_text(encoding="utf-8"))
    plain = bookmarklet(js, False)
    with_header = bookmarklet(js, True)

    html = TEMPLATE.replace("__PLAIN__", plain).replace("__HEADER__", with_header)
    OUT.write_text(html, encoding="utf-8")
    print(f"{OUT.name}: {len(plain)} / {len(with_header)} Zeichen pro Bookmarklet")


TEMPLATE = """<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Poll Everywhere: Bedienelemente ausblenden</title>
    <style>
      body {
        max-width: 720px;
        margin: 0 auto;
        padding: 40px 24px 80px;
        font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #1c1c1c;
      }
      h1 { font-size: 26px; color: #e20074; }
      h2 { font-size: 18px; margin-top: 36px; }
      .bm {
        display: inline-block;
        margin: 6px 10px 6px 0;
        padding: 12px 22px;
        border-radius: 6px;
        background: #e20074;
        color: #fff;
        font-weight: 700;
        text-decoration: none;
        cursor: grab;
      }
      .bm.sec { background: #6b7280; }
      ol { padding-left: 22px; }
      li { margin: 8px 0; }
      code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
      }
      .note {
        margin-top: 28px;
        padding: 14px 18px;
        border-left: 4px solid #e20074;
        background: #fdf2f8;
        font-size: 15px;
      }
    </style>
  </head>
  <body>
    <h1>Bedienelemente ausblenden</h1>
    <p>
      Blendet in der Poll-Everywhere-Praesentationsansicht den Antwortzaehler
      (<b>Anonymous 0</b>), den Sortier-Button, die Schalter
      <b>Choices / Results / Lock / Correctness</b> sowie <b>Exit</b> und die
      Seitennavigation aus. Die Ergebnisse aktualisieren sich normal weiter.
    </p>

    <h2>1. Lesezeichen anlegen</h2>
    <p>Lesezeichenleiste einblenden (<code>Cmd+Shift+B</code>), dann einen der
      Buttons in die Leiste ziehen:</p>
    <p>
      <a class="bm" href="__PLAIN__">Poll aufraeumen</a>
      <a class="bm sec" href="__HEADER__">Poll aufraeumen + Kopfzeile</a>
    </p>
    <p>
      Die zweite Variante entfernt zusaetzlich die Kopfzeile mit QR-Code und
      <b>Respond at pe.app/tsystems</b>.
    </p>

    <h2>2. Benutzen</h2>
    <ol>
      <li>Aktivitaet in Poll Everywhere oeffnen und auf <b>Present</b> gehen.</li>
      <li>Auf das Lesezeichen klicken. Kurze Bestaetigung unten: fertig.</li>
      <li>Vollbild mit <code>Cmd+Ctrl+F</code>, dann praesentieren.</li>
      <li>Nochmal klicken blendet alles wieder ein &ndash; z.B. wenn im
        Hintergrund <b>Lock</b> gebraucht wird.</li>
    </ol>

    <div class="note">
      Nach einem <b>Neuladen</b> der Seite ist das Bookmarklet wieder weg, dann
      erneut klicken. Innerhalb der Praesentation bleibt es aktiv, auch wenn
      neue Antworten eintreffen.
    </div>
  </body>
</html>
"""


if __name__ == "__main__":
    main()
