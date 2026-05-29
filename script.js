/* =========================================================
   Youth Rising — script.js
   Vanilla JS. No frameworks, no build step.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------
     1 & 9. VIEW SWITCHING + BACK HOME
     ---------------------------------------------------------- */
  const views = {
    home:    $("#view-home"),
    explore: $("#view-explore"),
    about:   $("#view-about"),
    cited:   $("#view-cited"),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      const isTarget = key === name;
      if (isTarget) {
        el.hidden = false;
        // allow display to apply before fading in
        requestAnimationFrame(() => el.classList.add("is-active"));
      } else {
        el.classList.remove("is-active");
        // wait for fade-out before hiding so it transitions cleanly
        window.setTimeout(() => { if (!el.classList.contains("is-active")) el.hidden = true; }, 500);
      }
    });

    // reset explore scroll & re-run reveals each time it opens
    if (name === "explore") {
      const scroller = $("#exploreScroll");
      if (scroller) scroller.scrollTop = 0;
      window.setTimeout(primeRevealsInView, 60);
    } else {
      // reveal centered/cited content
      window.setTimeout(() => primeRevealsInView(views[name]), 60);
    }

    closeMobileNav();
    // move focus to the new view for screen-reader/keyboard users
    const target = views[name];
    if (target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
  }

  $$("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.goto));
  });

  /* ----------------------------------------------------------
     8. SMOOTH SCROLL TO SECTIONS + sidebar click
     ---------------------------------------------------------- */
  const sideLinks = $$(".side-link");

  function scrollToSection(id) {
    const section = document.getElementById(id);
    const scroller = $("#exploreScroll");
    if (!section || !scroller) return;
    scroller.scrollTo({
      top: section.offsetTop,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }

  sideLinks.forEach((link) => {
    link.addEventListener("click", () => {
      scrollToSection(link.dataset.section);
      closeMobileNav();
    });
  });

  /* ----------------------------------------------------------
     2 & 3. MOBILE NAV MENU (hover handled by CSS on desktop)
     ---------------------------------------------------------- */
  const navToggle = $("#navToggle");
  const sidebar = $("#sidebar");

  function closeMobileNav() {
    if (!sidebar || !navToggle) return;
    sidebar.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open section menu");
  }

  if (navToggle && sidebar) {
    navToggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
    });
  }

  /* ----------------------------------------------------------
     4. INTERSECTIONOBSERVER — active section highlight
     ---------------------------------------------------------- */
  const stories = $$(".story");

  function setActive(id) {
    sideLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.section === id));
  }

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { root: $("#exploreScroll"), threshold: 0.55 }
  );
  stories.forEach((s) => activeObserver.observe(s));

  /* ----------------------------------------------------------
     5. REVEAL ANIMATIONS (only for sections in view)
     ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  function observeReveals(ctx = document) {
    $$(".reveal", ctx).forEach((el) => {
      if (!el.classList.contains("is-visible")) revealObserver.observe(el);
    });
  }

  // For the explore scroller (custom root), use a dedicated observer
  const exploreRevealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { root: $("#exploreScroll"), threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  function primeRevealsInView(view) {
    if (view === views.explore || view === undefined) {
      $$("#view-explore .reveal").forEach((el) => {
        if (!el.classList.contains("is-visible")) exploreRevealObserver.observe(el);
      });
    }
    if (view && view !== views.explore) {
      $$(".reveal", view).forEach((el) => el.classList.add("is-visible"));
    }
  }

  // initial run
  observeReveals();
  // explore content is hidden at first; will be primed when opened

  /* ----------------------------------------------------------
     IMPACT CARDS — click to expand (hover handled by CSS)
     ---------------------------------------------------------- */
  $$(".impact-card").forEach((card) => {
    card.addEventListener("click", () => {
      const open = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ----------------------------------------------------------
     6. ACTIVIST OVERLAY (accessible dialog)
     ---------------------------------------------------------- */
  const activists = {
    greta: {
      title: "Greta Thunberg",
      sub: "The school strike that became global.",
      story: "In 2018, Greta Thunberg began striking outside the Swedish Parliament. Her protest helped inspire Fridays for Future, a global youth climate movement.",
      problem: "Governments were not acting fast enough.",
      tactics: ["School strikes", "Speeches", "Media pressure", "Moral pressure on leaders"],
      impact: "Helped turn school strikes into a global youth movement.",
      sources: ["Fridays for Future, “Who We Are”", "Britannica, “Greta Thunberg”"],
    },
    vanessa: {
      title: "Vanessa Nakate",
      sub: "Centering African climate justice.",
      story: "Vanessa Nakate is a Ugandan climate activist who began striking in Kampala in 2019. She focuses on African climate justice and marginalized voices.",
      problem: "African communities face severe climate impacts despite contributing less to emissions.",
      tactics: ["Climate strikes", "Public speaking", "Rise Up Movement", "Solar projects in Ugandan schools"],
      impact: "Elevated African youth voices in global climate conversations.",
      sources: ["UNICEF, “Vanessa Nakate”", "United Nations, “Vanessa Nakate: Climate Change Is about the People”"],
    },
    xiuhtezcatl: {
      title: "Xiuhtezcatl Martinez",
      sub: "Climate justice, Indigenous rights, and youth power.",
      story: "Xiuhtezcatl Martinez connects climate activism with Indigenous identity, land protection, legal action, culture, and future generations.",
      problem: "Climate change threatens land, culture, Indigenous communities, and future generations.",
      tactics: ["Speeches", "Organizing", "Legal activism", "Music", "Youth movement-building"],
      impact: "Showed that climate activism can use law, culture, identity, and art.",
      sources: ["Xiuhtezcatl, “Activism”", "Earth Guardians", "Our Children’s Trust, “Juliana v. United States”"],
    },
  };

  const overlay = $("#overlay");
  const overlayPanel = $(".overlay-panel", overlay);
  let lastFocused = null;

  function fillList(ul, items) {
    ul.innerHTML = "";
    items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
  }

  function openOverlay(key) {
    const data = activists[key];
    if (!data) return;
    lastFocused = document.activeElement;

    $("#overlaySub").textContent = data.sub;
    $("#overlayTitle").textContent = data.title;
    $("#overlayStory").textContent = data.story;
    $("#overlayProblem").textContent = data.problem;
    $("#overlayImpact").textContent = data.impact;
    fillList($("#overlayTactics"), data.tactics);
    fillList($("#overlaySources"), data.sources);

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    $(".overlay-close").focus();
    document.addEventListener("keydown", onOverlayKey);
  }

  function closeOverlay() {
    overlay.classList.remove("is-open");
    document.removeEventListener("keydown", onOverlayKey);
    document.body.style.overflow = "";
    window.setTimeout(() => { overlay.hidden = true; }, 450);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onOverlayKey(e) {
    if (e.key === "Escape") { closeOverlay(); return; }
    if (e.key === "Tab") {
      // focus trap
      const focusables = $$('button, [href], [tabindex]:not([tabindex="-1"])', overlayPanel)
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  $$(".person-card").forEach((card) => {
    card.addEventListener("click", () => openOverlay(card.dataset.activist));
  });
  $$("[data-close]", overlay).forEach((el) => el.addEventListener("click", closeOverlay));

  /* ----------------------------------------------------------
     7. ACTION ROLE RESULTS (one at a time)
     ---------------------------------------------------------- */
  const roleData = {
    organizer:  { you: "You bring people together.", step: "Start a school climate justice club or organize a small awareness event." },
    researcher: { you: "You use facts to make the issue clear.", step: "Find one local climate justice issue and create a short fact sheet." },
    speaker:    { you: "You use your voice to create pressure.", step: "Present climate justice to a class, club, or community group." },
    designer:   { you: "You make the movement visible.", step: "Create a poster, infographic, or social media campaign." },
    policy:     { you: "You focus on systems and laws.", step: "Write an email to a local official asking for youth involvement in climate decisions." },
  };

  const roleBtns = $$(".role-btn");
  const roleResult = $("#roleResult");

  roleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = roleData[btn.dataset.role];
      if (!data) return;
      roleBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      roleResult.innerHTML =
        '<p class="role-answer"><span class="role-you">' + data.you + "</span>" +
        '<span class="role-step"><b>Action step:</b> ' + data.step + "</span></p>";
    });
  });

})();
