/* =========================================================
   AMIGO MARKETING - CUSTOM JAVASCRIPT
   Vanilla JS only - no frameworks
   ========================================================= */

// Link builders and placeholder guards live in js/config.js,
// which is loaded before this file.

// ============ GENERATE FILTER PILLS ============
function generateFilterPills() {
  const container = document.getElementById("productFilters");
  if (!container) return;
  const cats = getCategories();
  container.innerHTML = cats.map(function (cat) {
    const active = cat === "All" ? " filter-active" : "";
    return '<button class="filter-pill' + active + '" data-category="' + cat + '">' + cat + '</button>';
  }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
  generateFilterPills();
});

// ============ WIRE UP WHATSAPP / DIRECTIONS / CALL LINKS ============
document.addEventListener("DOMContentLoaded", function () {

  const WHATSAPP_NOT_SET =
    "WhatsApp number is not set up yet. Please contact us by phone or visit our store.";
  const PHONE_NOT_SET =
    "Phone number is not set up yet. Please message us on WhatsApp or visit our store.";

  // Generic WhatsApp buttons (navbar, hero slides, CTA, contact, floating)
  const genericWhatsappIds = [
    "navWhatsappBtn",
    "heroWhatsapp1",
    "heroWhatsapp2",
    "heroWhatsapp3",
    "ctaWhatsappBtn",
    "contactWhatsappBtn",
    "floatingWhatsapp"
  ];

  const genericLink = buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE);
  genericWhatsappIds.forEach(function (id) {
    wireLinkOrWarn(document.getElementById(id), genericLink, WHATSAPP_NOT_SET);
  });

  // Directions buttons - these are always valid (address is known)
  ["ctaDirectionsBtn", "contactDirectionsBtn"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("href", buildDirectionsLink());
    }
  });

  // Call Now button
  wireLinkOrWarn(document.getElementById("contactCallBtn"), buildCallLink(), PHONE_NOT_SET);

  // ============ HERO CAROUSEL AUTOPLAY ============
  // Explicitly initialise and start cycling so the slider always auto-advances.
  // pause:false keeps it moving even while the cursor rests over the hero.
  const heroCarouselEl = document.getElementById("heroCarousel");
  if (heroCarouselEl && typeof bootstrap !== "undefined") {
    const heroCarousel = bootstrap.Carousel.getOrCreateInstance(heroCarouselEl, {
      interval: 4500,
      ride: "carousel",
      pause: false,
      wrap: true,
      touch: true
    });
    heroCarousel.cycle();

    // Resume cycling if the browser paused it (e.g. after tab switch or swipe).
    heroCarouselEl.addEventListener("mouseleave", function () {
      heroCarousel.cycle();
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        heroCarousel.cycle();
      }
    });
  }

  // ============ NAVBAR SCROLL EFFECT ============
  const navbar = document.getElementById("mainNavbar");
  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll);

  // Collapse mobile menu after clicking a nav link
  const navLinks = document.querySelectorAll("#navMenu .nav-link");
  const navMenu = document.getElementById("navMenu");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navMenu.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
        bsCollapse.hide();
      }
    });
  });

  // ============ FADE-IN ON SCROLL ANIMATION ============
  const fadeElements = document.querySelectorAll(".fade-in-section");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: reveal all sections immediately if IntersectionObserver unsupported
    fadeElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
});
