/* Goibniu — shared interactions (progressive enhancement, no dependencies) */
(function () {
  "use strict";

  /* ---- Theme ---- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("goibniu-theme"); } catch (e) {}
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("goibniu-theme", next); } catch (e) {}
  }

  /* ---- Mobile menu ---- */
  function ready() {
    var themeBtn = document.querySelector("[data-theme-toggle]");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (navToggle && mobileMenu) {
      navToggle.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      mobileMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
      });
    }

    /* ---- Nav shadow on scroll ---- */
    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () {
        if (window.scrollY > 8) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---- Scroll reveal ---- */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---- Contact form (submits to Web3Forms — no backend to host/maintain) ----
       Sign up free at https://web3forms.com to get an access key, then set it
       on the hidden "access_key" input in contact.html. Until a real key is
       set, submissions will fail and the form falls back to a mailto notice. */
    var form = document.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector("[data-form-status]");
        var submitBtn = form.querySelector('button[type="submit"]');
        var accessKeyInput = form.querySelector('input[name="access_key"]');
        var hasRealKey = accessKeyInput && accessKeyInput.value && accessKeyInput.value.indexOf("YOUR_") !== 0;

        function showStatus(text) {
          if (!status) return;
          status.textContent = text;
          status.style.display = "block";
        }

        function fallbackEmail() {
          var eu = "damianjmagill", ed = "gmail.com";
          showStatus("This form isn't connected yet — please email us directly at " + eu + "@" + ed + " and we'll respond promptly.");
        }

        if (!hasRealKey) {
          fallbackEmail();
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        showStatus("Sending…");

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success) {
              showStatus("Thanks — your message has been sent. We'll get back to you soon.");
              form.reset();
            } else {
              fallbackEmail();
            }
          })
          .catch(fallbackEmail)
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }

    /* ---- Obfuscated email: click-to-reveal ----
       Address is stored split across two data attributes (no "@" in the
       markup or JS source), and only assembled into text/a link once the
       visitor actively clicks. This clears basic HTML/JS scrapers; it can't
       hide the address from a scraper that fully renders the page and reads
       the DOM after interaction — no static-site technique can. */
    document.querySelectorAll("[data-reveal-email]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var user = btn.getAttribute("data-eu");
        var domain = btn.getAttribute("data-ed");
        var address = user + "@" + domain;
        var link = document.createElement("a");
        link.href = "mailto:" + address;
        link.textContent = address;
        link.style.color = "var(--cyan)";
        link.style.fontWeight = "600";
        btn.replaceWith(link);
      });
    });

    document.querySelectorAll("[data-mailto-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var user = a.getAttribute("data-eu");
        var domain = a.getAttribute("data-ed");
        var subject = a.getAttribute("data-subject") || "";
        var mailto = "mailto:" + user + "@" + domain + (subject ? "?subject=" + encodeURIComponent(subject) : "");
        window.location.href = mailto;
      });
    });

    /* ---- Footer year ---- */
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
