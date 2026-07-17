/* ============================================================================
   PASTOR ABRAHAM PRAISE — LANDING PAGE SCRIPTS (vanilla JS, no libraries)
   ----------------------------------------------------------------------------
   1. Sticky nav — shrink-on-scroll effect
   2. Mobile nav — hamburger toggle
   3. Scroll-reveal animations (IntersectionObserver)
   4. Testimonials carousel (auto-rotating + manual controls)
   5. Booking form — mailto: fallback (swap for Formspree for real submissions)
   6. Footer — automatic copyright year
   ============================================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. STICKY NAV — adds .scrolled to the header once the page scrolls,
        which shrinks the nav padding and adds a shadow (see style.css).
     ------------------------------------------------------------------------ */
  var header = document.getElementById("site-header");

  function handleNavShrink() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  handleNavShrink();
  window.addEventListener("scroll", handleNavShrink, { passive: true });

  /* ------------------------------------------------------------------------
     2. MOBILE NAV — hamburger toggle.
        - Toggles .open on the menu and keeps aria-expanded in sync.
        - Closes when a link is tapped, when Escape is pressed, or when the
          viewport is resized up to desktop.
     ------------------------------------------------------------------------ */
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  navMenu.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navMenu.classList.contains("open")) {
      closeMenu();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) closeMenu();
  });

  /* ------------------------------------------------------------------------
     3. SCROLL-REVEAL — elements with .reveal fade/slide in when they enter
        the viewport (styles live in style.css, section 11).
     ------------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback for very old browsers: just show everything.
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------------
     4. TESTIMONIALS CAROUSEL
        - Auto-rotates every 6 seconds (disabled if the visitor prefers
          reduced motion).
        - Previous/next buttons and dots for manual navigation.
        - Pauses on hover and while keyboard focus is inside the carousel.
     ------------------------------------------------------------------------ */
  var carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".carousel__slide"));
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var prevBtn = carousel.querySelector("[data-carousel-prev]");
    var nextBtn = carousel.querySelector("[data-carousel-next]");
    var AUTOPLAY_MS = 6000;
    var currentIndex = 0;
    var timer = null;
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build one dot per slide.
    var dots = slides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot";
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var isActive = i === currentIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", String(i === currentIndex));
      });
    }

    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function startAutoplay() {
      if (prefersReducedMotion || timer) return;
      timer = setInterval(function () { goTo(currentIndex + 1); }, AUTOPLAY_MS);
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); restartAutoplay(); });
    nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); restartAutoplay(); });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);

    goTo(0);
    startAutoplay();
  }

  /* ------------------------------------------------------------------------
     5. BOOKING FORM — MAILTO FALLBACK
        This is a static site (GitHub Pages) with no backend, so submitting
        the form opens the visitor's email client with a pre-filled booking
        request addressed to the ministry office.

        TO SWITCH TO FORMSPREE (or a similar service) FOR REAL SUBMISSIONS:
          1. Create a free form at https://formspree.io and copy your form ID.
          2. In index.html, change the form tag to:
             <form id="booking-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
          3. Delete this entire submit handler — the browser will then post
             the form to Formspree normally.
     ------------------------------------------------------------------------ */
  var BOOKING_EMAIL = "Abrahampraiseworld@yahoo.com";

  var form = document.getElementById("booking-form");
  var formNote = document.getElementById("form-note");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var org = (data.get("organization") || "").toString().trim();
      var date = (data.get("event_date") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var subject = "Booking Request — " + name + (org ? " (" + org + ")" : "");
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Organization / Church: " + (org || "—") + "\n" +
        "Event Date: " + (date || "—") + "\n\n" +
        "Message:\n" + message + "\n";

      window.location.href =
        "mailto:" + BOOKING_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (formNote) {
        formNote.textContent =
          "Your email app should now open with a pre-filled booking request. If it doesn't, please email " +
          BOOKING_EMAIL + " directly.";
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. FOOTER — keep the copyright year current automatically.
     ------------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
