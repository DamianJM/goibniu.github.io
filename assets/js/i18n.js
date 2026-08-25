/* =========================================================================
   Goibniu — Click-to-translate (EN ⇄ FR)
   Progressive enhancement · no dependencies · no backend · no build step.

   How it works:
   - Walks visible TEXT NODES (so SVG icons / <strong> / gradient spans etc.
     are all preserved) and swaps each recognised English fragment for its
     French equivalent from window.GOIBNIU_I18N (loaded by i18n.fr.js).
   - Also translates chosen attributes (placeholder, aria-label, title, alt)
     and the <title> tag.
   - Remembers the choice in localStorage, exactly like your theme toggle.
   - Fully reversible: originals are cached the first time we translate.
   ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "goibniu-lang";
  var DEFAULT_LANG = "en";
  var SUPPORTED = ["en", "fr"];
  var ATTRS = ["placeholder", "aria-label", "title", "alt"];

  var ORIG_TEXT = new WeakMap();  // text node -> original English string

  function norm(s) { return (s || "").replace(/\s+/g, " ").trim(); }

  function dict() { return window.GOIBNIU_I18N || {}; }
  function TEXT()  { return dict().fr || {}; }
  function ATTR()  { return dict().fr_attr || {}; }
  function TITLE() { return dict().fr_title || {}; }

  function getLang() {
    try {
      var l = localStorage.getItem(STORAGE_KEY);
      if (l && SUPPORTED.indexOf(l) > -1) return l;
    } catch (e) {}
    return DEFAULT_LANG;
  }
  function saveLang(l) { try { localStorage.setItem(STORAGE_KEY, l); } catch (e) {} }

  /* ---- Text nodes ---- */
  function collectTextNodes() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName.toLowerCase();
        if (tag === "script" || tag === "style") return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest("[data-i18n-skip]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var out = [], n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  function translateText(toFr) {
    var map = TEXT();

    collectTextNodes().forEach(function (node) {
        if (toFr) {
            if (!ORIG_TEXT.has(node))
                ORIG_TEXT.set(node, node.nodeValue);

            var original = ORIG_TEXT.get(node);
            var val = map[norm(original)];

            if (val == null) return;

            var leading = original.match(/^\s*/)[0];
            var trailing = original.match(/\s*$/)[0];

            node.nodeValue = leading + val + trailing;
        } else if (ORIG_TEXT.has(node)) {
            node.nodeValue = ORIG_TEXT.get(node);
            ORIG_TEXT.delete(node);
        }
    });
}

  /* ---- Attributes ---- */
  function translateAttrs(toFr) {
    var map = ATTR();
    ATTRS.forEach(function (name) {
      var store = "data-i18n-a-" + name;
      var nodes = document.querySelectorAll("[" + name + "]");
      Array.prototype.slice.call(nodes).forEach(function (el) {
        if (el.closest("[data-i18n-skip]")) return;
        if (toFr) {
          var val = map[norm(el.getAttribute(name))];
          if (val == null) return;
          if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(name));
          el.setAttribute(name, val);
        } else if (el.hasAttribute(store)) {
          el.setAttribute(name, el.getAttribute(store));
          el.removeAttribute(store);
        }
      });
    });
  }

  /* ---- <title> + <html lang> ---- */
  function translateMeta(toFr) {
    var root = document.documentElement;
    root.setAttribute("lang", toFr ? "fr" : "en");
    if (toFr) {
      var t = TITLE()[norm(document.title)];
      if (t != null) {
        if (!root.hasAttribute("data-i18n-title")) root.setAttribute("data-i18n-title", document.title);
        document.title = t;
      }
    } else if (root.hasAttribute("data-i18n-title")) {
      document.title = root.getAttribute("data-i18n-title");
      root.removeAttribute("data-i18n-title");
    }
  }

  function apply(lang) {
    var toFr = lang === "fr";
    translateText(toFr);
    translateAttrs(toFr);
    translateMeta(toFr);
    updateButtons(lang);
  }

  function updateButtons(lang) {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.textContent = lang === "fr" ? "EN" : "FR";
      btn.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer en français");
      btn.setAttribute("title", lang === "fr" ? "English" : "Français");
    });
  }

  function ready() {
    var current = getLang();
    if (current === "fr") apply("fr"); else updateButtons("en");

    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = getLang() === "fr" ? "en" : "fr";
        saveLang(next);
        apply(next);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
