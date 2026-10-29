(function () {
  "use strict";

  var interestsKey = "afj-travel-interests";
  var tallyFormId = "yPVYJW";
  var whatsappNumber = "255725451451";
  var tallyScriptPromise;
  document.documentElement.classList.add("js-enabled");

  function savedInterests() {
    try {
      var saved = sessionStorage.getItem(interestsKey);
      var parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function selectedInterests() {
    if (!document.querySelector("[data-interest]")) return savedInterests();
    var buttons = document.querySelectorAll("[data-interest]");
    var selected = Array.prototype.filter.call(buttons, function (button) {
      return button.type === "checkbox" ? button.checked : button.getAttribute("aria-pressed") === "true";
    }).map(function (button) {
      return button.type === "checkbox" ? button.value : button.getAttribute("data-interest");
    });
    try {
      sessionStorage.setItem(interestsKey, JSON.stringify(selected));
    } catch (error) {}
    return selected.length ? selected : savedInterests();
  }

  function updateWhatsAppLinks() {
    var interests = selectedInterests().join(", ");
    document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
      var message = "Hello African Journal Safari Tours, I would like to plan a Tanzania journey.";
      var theme = link.getAttribute("data-theme");
      if (theme) message += " Journey theme: " + theme + ".";
      if (interests) message += " My interests: " + interests + ".";
      link.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
    });
  }

  function loadTally() {
    if (window.Tally && typeof window.Tally.openPopup === "function") return Promise.resolve(window.Tally);
    if (tallyScriptPromise) return tallyScriptPromise;

    tallyScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://tally.so/widgets/embed.js";
      script.async = true;
      script.onload = function () {
        if (window.Tally && typeof window.Tally.openPopup === "function") {
          resolve(window.Tally);
        } else {
          reject(new Error("The enquiry form service did not initialize."));
        }
      };
      script.onerror = function () {
        reject(new Error("The enquiry form service could not be loaded."));
      };
      document.head.appendChild(script);
    });
    return tallyScriptPromise;
  }

  function openTallyForm(link) {
    var status = document.querySelector("[data-contact-status]");
    if (status) status.hidden = true;
    link.setAttribute("aria-busy", "true");
    loadTally().then(function (tally) {
      var interests = selectedInterests().join(", ");
      var theme = link.getAttribute("data-theme");
      var hiddenFields = {};
      if (interests || theme) hiddenFields.interests = [theme, interests].filter(Boolean).join(", ");
      tally.openPopup(tallyFormId, {
        layout: "modal",
        width: 560,
        autoClose: 0,
        hiddenFields: hiddenFields
      });
      link.removeAttribute("aria-busy");
    }).catch(function (error) {
      link.removeAttribute("aria-busy");
      if (status) {
        status.textContent = "The enquiry form could not load. Please use WhatsApp or the Contact page.";
        status.hidden = false;
      }
      console.error(error);
    });
  }

  function updateInterestSummaries() {
    var selected = selectedInterests().join(", ");
    document.querySelectorAll("[data-selected-interests]").forEach(function (summary) {
      summary.textContent = selected ? "Selected: " + selected : "No interests selected yet.";
    });
    updateWhatsAppLinks();
  }

  var interestButtons = document.querySelectorAll("[data-interest]");
  var saved = savedInterests();
  interestButtons.forEach(function (button) {
    if (button.type === "checkbox") {
      button.checked = saved.indexOf(button.value) !== -1;
    } else {
      button.setAttribute("aria-pressed", String(saved.indexOf(button.getAttribute("data-interest")) !== -1));
    }
  });
  updateInterestSummaries();

  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-interest]");
    if (!button || button.type === "checkbox") return;
    button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
    updateInterestSummaries();
  });
  document.addEventListener("change", function (event) {
    if (event.target.matches && event.target.matches("input[type='checkbox'][data-interest]")) updateInterestSummaries();
  });
  document.addEventListener("click", function (event) {
    var tallyLink = event.target.closest && event.target.closest("[data-tally-form]");
    if (!tallyLink) return;
    event.preventDefault();
    openTallyForm(tallyLink);
  });

  var page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".primary-nav [data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === page) link.setAttribute("aria-current", "page");
  });

  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.getElementById("primary-nav");

  function closeMenu(returnFocus) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      var opening = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(opening));
      menuButton.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("is-open", opening);
    });
    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    document.addEventListener("click", function (event) {
      if (menuButton.getAttribute("aria-expanded") === "true" && !event.target.closest(".header-inner")) closeMenu(false);
    });
  }

  var header = document.querySelector(".site-header.site-header-overlay");
  function updateHeaderState() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();

  var video = document.getElementById("hero-video");
  var videoButton = document.querySelector("[data-video-toggle]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setVideoButton(playing) {
    if (!videoButton) return;
    videoButton.setAttribute("aria-pressed", String(playing));
    videoButton.setAttribute("aria-label", playing ? "Pause background film" : "Play background film");
    var label = videoButton.querySelector("[data-video-label]");
    var icon = videoButton.querySelector(".video-toggle-icon");
    if (label) label.textContent = playing ? "Pause film" : "Play film";
    if (icon) icon.textContent = playing ? "Ⅱ" : "▶";
  }

  if (video && videoButton) {
    videoButton.addEventListener("click", function () {
      if (video.paused) {
        var playAttempt = video.play();
        if (playAttempt && playAttempt.catch) playAttempt.catch(function () { setVideoButton(false); });
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () { setVideoButton(true); });
    video.addEventListener("pause", function () { setVideoButton(false); });
    if (reduceMotion) {
      video.pause();
      setVideoButton(false);
    } else {
      var playAttempt = video.play();
      if (playAttempt && playAttempt.catch) playAttempt.catch(function () { setVideoButton(false); });
    }
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });


  /* ---- theme + night sky ---- */
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme-toggle");
  var sky = document.querySelector(".night-sky");
  var ctx = sky && sky.getContext && sky.getContext("2d");
  var stars = [], raf = 0, lastTs = 0, W = 0, H = 0;
  function makeStars() {
    if (!sky) return;
    W = sky.width = window.innerWidth; H = sky.height = window.innerHeight;
    stars = [];
    for (var i = 0, n = Math.round(W * H / 9000); i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .4, a: Math.random() * .5 + .35, s: Math.random() * 4 + 1, p: Math.random() * 6 });
    }
  }
  function drawSky(ts) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff7e6";
    stars.forEach(function (s) {
      ctx.globalAlpha = reduceMotion ? s.a : s.a * (.75 + .25 * Math.sin(ts / 1400 + s.p));
      ctx.fillRect(s.x, s.y, s.r, s.r);
    });
  }
  function tick(ts) {
    var dt = Math.min((ts - lastTs) / 1000, .1); lastTs = ts;
    stars.forEach(function (s) { s.x -= s.s * dt; if (s.x < 0) s.x += W; });
    drawSky(ts);
    raf = window.requestAnimationFrame(tick);
  }
  function syncSky() {
    if (!ctx) return;
    window.cancelAnimationFrame(raf);
    if (root.getAttribute("data-theme") !== "dark") return;
    makeStars();
    if (reduceMotion) { drawSky(0); return; }
    lastTs = performance.now(); raf = window.requestAnimationFrame(tick);
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(t === "dark"));
      themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to day theme" : "Switch to night theme");
    }
    syncSky();
  }
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("afj-theme", next); } catch (e) {}
    applyTheme(next);
  });
  window.addEventListener("resize", function () { if (root.getAttribute("data-theme") === "dark") syncSky(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden) window.cancelAnimationFrame(raf); else syncSky(); });
  applyTheme(root.getAttribute("data-theme") || "light");

  /* ---- field journal (hero) ---- */
  var journal = document.querySelector(".journal3d");
  if (journal) {
    var jt = journal.querySelector(".jtoggle");
    function setJournal(open) { journal.classList.toggle("is-open", open); jt.setAttribute("aria-expanded", String(open)); }
    jt.addEventListener("click", function () { setJournal(!journal.classList.contains("is-open")); });
    journal.querySelector(".jclose").addEventListener("click", function () { setJournal(false); jt.focus(); });
  }

  /* ---- trip planner: validate on blur, send via WhatsApp / Tally ---- */
  var form = document.getElementById("trip-form");
  if (form) {
    var status = document.getElementById("trip-status");
    var draftBox = document.getElementById("trip-draft");
    var draftText = document.getElementById("trip-draft-text");
    var rules = {
      name: function (v) { return v.trim() ? "" : "Enter your name so we know who to reply to."; },
      contact: function (v) {
        v = v.trim();
        if (!v) return "Enter an email or WhatsApp number we can reply to.";
        return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.replace(/\D/g, "").length >= 7) ? "" : "Enter an email like name@example.com or a phone number with country code.";
      }
    };
    function showError(input, msg) {
      var slot = input.parentNode.querySelector(".field-error");
      if (!msg) { input.removeAttribute("aria-invalid"); if (slot) slot.remove(); return; }
      input.setAttribute("aria-invalid", "true");
      if (!slot) { slot = document.createElement("p"); slot.className = "field-error"; slot.id = input.id + "-error"; input.parentNode.appendChild(slot); input.setAttribute("aria-describedby", slot.id); }
      slot.textContent = msg;
    }
    Object.keys(rules).forEach(function (key) {
      var input = form.elements[key];
      input.addEventListener("blur", function () { showError(input, rules[key](input.value)); });
      input.addEventListener("focus", function () { showError(input, ""); });
    });
    function validateAll() {
      var first = null;
      Object.keys(rules).forEach(function (key) {
        var input = form.elements[key], msg = rules[key](input.value);
        showError(input, msg);
        if (msg && !first) first = input;
      });
      if (first) first.focus();
      return !first;
    }
    function brief() {
      var v = form.elements;
      return [
        "Hello African Journal Safari Tours, I would like to plan a Tanzania journey.",
        "Name: " + v.name.value.trim(),
        "Reach me at: " + v.contact.value.trim(),
        "Travel dates: " + (v.dates.value.trim() || "Flexible"),
        "Travellers: " + (v.travellers.value.trim() || "Not specified"),
        "Interests: " + (selectedInterests().join(", ") || "Not selected"),
        "Notes: " + (v.notes.value.trim() || "None")
      ].join("\n");
    }
    function say(text) { if (status) status.textContent = text; }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateAll()) return;
      window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(brief()), "_blank", "noopener");
      say("WhatsApp is open with your trip brief. Press send there to reach the team.");
    });
    var tallyBtn = document.getElementById("open-tally");
    if (tallyBtn) tallyBtn.addEventListener("click", function () { openTallyForm(tallyBtn); });
    var copyBtn = document.getElementById("copy-trip-brief");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      if (!validateAll()) return;
      var text = brief();
      draftText.value = text;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { say("Trip brief copied. Paste it into an email or message to us."); })
          .catch(function () { draftBox.hidden = false; draftText.select(); say("Copy was blocked. The brief is selected so you can copy it."); });
      } else { draftBox.hidden = false; draftText.select(); say("The brief is selected so you can copy it."); }
    });
  }
})();
