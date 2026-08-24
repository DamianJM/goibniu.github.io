/* Goibniu — Legal & Policies page: document switcher (progressive enhancement) */
(function () {
  "use strict";

  function ready() {
    var nav = document.querySelector("[data-legal-nav]");
    if (!nav) return;

    var tabs = Array.prototype.slice.call(nav.querySelectorAll("[data-legal-target]"));
    var docs = Array.prototype.slice.call(document.querySelectorAll("[data-legal-doc]"));
    if (!tabs.length || !docs.length) return;

    function show(id, opts) {
      opts = opts || {};
      var matched = false;

      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-legal-target") === id;
        if (isActive) matched = true;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.tabIndex = isActive ? 0 : -1;
      });

      if (!matched) return false;

      docs.forEach(function (doc) {
        var isActive = doc.getAttribute("data-legal-doc") === id;
        doc.classList.toggle("active", isActive);
        if (isActive) doc.removeAttribute("hidden");
        else doc.setAttribute("hidden", "");
      });

      if (opts.updateHash !== false) {
        history.replaceState(null, "", "#" + id);
      }
      if (opts.focus) {
        var activeTab = nav.querySelector('[data-legal-target="' + id + '"]');
        if (activeTab) activeTab.focus();
      }
      if (opts.scroll) {
        var content = document.querySelector(".legal-content");
        if (content) content.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return true;
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        show(tab.getAttribute("data-legal-target"));
      });

      /* Roving tabindex keyboard navigation between documents */
      tab.addEventListener("keydown", function (e) {
        var dir = 0;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") dir = 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") dir = -1;
        else if (e.key === "Home") { show(tabs[0].getAttribute("data-legal-target"), { focus: true }); e.preventDefault(); return; }
        else if (e.key === "End") { show(tabs[tabs.length - 1].getAttribute("data-legal-target"), { focus: true }); e.preventDefault(); return; }
        else return;

        e.preventDefault();
        var next = tabs[(index + dir + tabs.length) % tabs.length];
        show(next.getAttribute("data-legal-target"), { focus: true });
      });
    });

    /* Deep-link support: legal.html#refund-policy opens that document directly */
    var initial = (location.hash || "").replace("#", "");
    if (!initial || !show(initial, { updateHash: false })) {
      var firstTarget = tabs[0].getAttribute("data-legal-target");
      show(firstTarget, { updateHash: false });
    }

    window.addEventListener("hashchange", function () {
      var id = (location.hash || "").replace("#", "");
      if (id) show(id, { updateHash: false, scroll: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
