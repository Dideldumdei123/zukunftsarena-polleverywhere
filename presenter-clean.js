/**
 * presenter-clean.js
 *
 * Blendet die Bedienelemente aus der Poll-Everywhere-Praesentationsansicht aus:
 *   - "Anonymous <n>" (Antwortzaehler) samt Sortier-Button daneben
 *   - Choices / Results / Lock / Correctness
 *   - Exit und die Seitennavigation ("1/1") der Web-Praesentation
 *   - optional die "Respond at"-Kopfzeile mit QR-Code
 *
 * Gesucht wird ueber die sichtbaren Texte, nicht ueber CSS-Klassen. Poll
 * Everywhere kann seine Klassennamen jederzeit aendern, die Beschriftungen
 * bleiben. Ein zweiter Aufruf blendet alles wieder ein.
 *
 * Einsatz als Bookmarklet, siehe bookmarklets.html.
 */
(function () {
  var HIDE_HEADER = false;

  var FLAG = "__pollevClean";
  var ATTR = "data-pe-clean";
  var STYLE_ID = "pe-clean-style";

  // Zweiter Aufruf -> aufraeumen und raus.
  if (window[FLAG]) {
    window[FLAG].stop();
    delete window[FLAG];
    return;
  }

  // maxW / maxH / maxArea: Anteil des Viewports, den ein Element hoechstens
  // einnehmen darf, um noch ausgeblendet zu werden. Verhindert, dass beim
  // Hochlaufen im DOM versehentlich die halbe Folie erwischt wird.
  var TARGETS = [
    // siblings: der Sortier-Button neben der Pille traegt keinen Text und
    // wird darum ueber die Nachbarschaft mitgenommen.
    { terms: ["Anonymous"], maxW: 0.45, maxH: 0.14, siblings: true },
    { terms: ["Choices", "Results"], maxW: 0.99, maxH: 0.18 },
    { terms: ["Exit"], maxW: 0.45, maxH: 0.14 },
  ];
  if (HIDE_HEADER) {
    TARGETS.push({ terms: ["Respond at"], maxW: 1, maxH: 0.22 });
  }

  var MAX_AREA = 0.25;

  function vw() {
    return window.innerWidth || document.documentElement.clientWidth;
  }
  function vh() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  function fits(el, t) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (r.width > t.maxW * vw()) return false;
    if (r.height > t.maxH * vh()) return false;
    if ((r.width * r.height) / (vw() * vh()) > MAX_AREA) return false;
    return true;
  }

  // Tiefste Elemente, die alle gesuchten Begriffe enthalten.
  function deepestMatches(terms) {
    var hits = [];
    var all = document.body.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) {
      var text = all[i].textContent || "";
      var ok = true;
      for (var j = 0; j < terms.length; j++) {
        if (text.indexOf(terms[j]) === -1) {
          ok = false;
          break;
        }
      }
      if (ok) hits.push(all[i]);
    }
    // Nur die behalten, die keinen ebenfalls passenden Nachfahren haben.
    return hits.filter(function (el) {
      for (var k = 0; k < hits.length; k++) {
        if (hits[k] !== el && el.contains(hits[k])) return false;
      }
      return true;
    });
  }

  // Vom Treffer so weit nach oben wie moeglich, ohne die Groessengrenzen
  // zu sprengen -> das ist die Pille bzw. die komplette Schalterleiste.
  function largestSafeAncestor(el, t) {
    var chosen = fits(el, t) ? el : null;
    var cur = el;
    while (cur.parentElement && cur.parentElement !== document.body) {
      cur = cur.parentElement;
      if (!fits(cur, t)) break;
      chosen = cur;
    }
    return chosen;
  }

  // Kleiner, textloser Nachbar = Icon-Button, der zum Treffer gehoert.
  function hideIconSiblings(el) {
    [el.previousElementSibling, el.nextElementSibling].forEach(function (sib) {
      if (!sib || sib.hasAttribute(ATTR)) return;
      if ((sib.textContent || "").trim().length > 2) return;
      var r = sib.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.width > 0.08 * vw() || r.height > 0.14 * vh()) return;
      sib.setAttribute(ATTR, "");
    });
  }

  function apply() {
    for (var i = 0; i < TARGETS.length; i++) {
      var t = TARGETS[i];
      var matches = deepestMatches(t.terms);
      for (var m = 0; m < matches.length; m++) {
        var el = largestSafeAncestor(matches[m], t);
        if (!el) continue;
        if (!el.hasAttribute(ATTR)) el.setAttribute(ATTR, "");
        if (t.siblings) hideIconSiblings(el);
      }
    }
  }

  var style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    // visibility statt display: nichts verrutscht, das Layout bleibt exakt.
    style.textContent = "[" + ATTR + "]{visibility:hidden !important}";
    document.head.appendChild(style);
  }

  apply();

  // Poll Everywhere baut die Seite bei jeder neuen Antwort neu auf
  // (Turbo). Darum nach jeder DOM-Aenderung erneut anwenden.
  var timer = null;
  var observer = new MutationObserver(function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(apply, 150);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window[FLAG] = {
    stop: function () {
      observer.disconnect();
      if (timer) clearTimeout(timer);
      var hidden = document.querySelectorAll("[" + ATTR + "]");
      for (var i = 0; i < hidden.length; i++) hidden[i].removeAttribute(ATTR);
      var s = document.getElementById(STYLE_ID);
      if (s) s.remove();
    },
  };

  // Kurze Rueckmeldung, damit man sieht, dass es gelaufen ist.
  var n = document.querySelectorAll("[" + ATTR + "]").length;
  var toast = document.createElement("div");
  toast.textContent = n + " Element(e) ausgeblendet";
  toast.style.cssText =
    "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;" +
    "padding:8px 18px;border-radius:999px;background:rgba(0,0,0,.82);color:#fff;" +
    "font:13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;pointer-events:none";
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.remove();
  }, 1500);
})();
