// ===== Element references =====
const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const backToTop = document.getElementById("backToTop");

document.getElementById("year").textContent = new Date().getFullYear();

// ===== Mobile navigation =====
function closeMenu() {
  navMenu.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ===== Header style, active link and back-to-top on scroll =====
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 50);
  backToTop.classList.toggle("show", y > 500);

  let current = "home";
  sections.forEach((section) => {
    if (y >= section.offsetTop - 120) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

window.addEventListener("scroll", onScroll);
onScroll();

backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ===== Scroll reveal, counters and skill bars =====
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + (progress === 1 ? el.dataset.suffix || "" : "");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");

      el.querySelectorAll(".counter").forEach(animateCounter);
      el.querySelectorAll(".skill-fill").forEach((bar) => {
        bar.style.width = bar.dataset.width + "%";
      });

      observer.unobserve(el);
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== Portfolio filter =====
const filterBtns = document.querySelectorAll(".filter-btn");
const eventCards = document.querySelectorAll(".event-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", b === btn);
    });

    eventCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !show);
      card.classList.remove("fade-in");
      if (show) {
        void card.offsetWidth; // restart the animation
        card.classList.add("fade-in");
      }
    });
  });
});

// ===== Testimonial slider =====
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dots");
let currentSlide = 0;
let autoPlay;

slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
  dot.addEventListener("click", () => {
    showSlide(i);
    restartAutoPlay();
  });
  dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll(".dot");

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle("active", i === currentSlide));
  dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
}

function restartAutoPlay() {
  clearInterval(autoPlay);
  autoPlay = setInterval(() => showSlide(currentSlide + 1), 6000);
}

document.getElementById("prevSlide").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  restartAutoPlay();
});
document.getElementById("nextSlide").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  restartAutoPlay();
});

restartAutoPlay();

// ===== Enquiry form validation =====
const form = document.getElementById("enquiryForm");
const formSuccess = document.getElementById("formSuccess");
const message = document.getElementById("message");
const messageCount = document.getElementById("message-count");
const dateInput = document.getElementById("date");

// Event date cannot be in the past
dateInput.min = new Date().toISOString().split("T")[0];

message.addEventListener("input", () => {
  messageCount.textContent = `${message.value.length} / 500 characters`;
});

const rules = {
  name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
  email: (v) => {
    if (!v.trim()) return "Please enter your email address.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Please enter a valid email, e.g. name@example.com.";
  },
  phone: (v) => (v && !/^[0-9 +()-]{7,20}$/.test(v) ? "Please enter a valid phone number." : ""),
  date: (v) => {
    if (!v) return "Please choose your event date.";
    return v < dateInput.min ? "The event date can't be in the past." : "";
  },
  guests: (v) => {
    const n = Number(v);
    if (!v) return "Please enter the number of guests.";
    return n < 1 || n > 2000 || !Number.isInteger(n) ? "Enter a whole number between 1 and 2000." : "";
  },
  message: (v) => (v.trim().length < 10 ? "Please tell us a little more (at least 10 characters)." : ""),
};

function setError(input, errorId, text) {
  const errorEl = document.getElementById(errorId);
  errorEl.textContent = text;
  if (input) {
    input.classList.toggle("invalid", !!text);
    input.classList.toggle("valid", !text && input.value !== "");
    input.setAttribute("aria-invalid", !!text);
  }
  return !text;
}

function validateField(input) {
  return setError(input, `${input.id}-error`, rules[input.id](input.value));
}

// Validate a field when the user leaves it, and re-check while typing once it has an error
Object.keys(rules).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) validateField(input);
  });
});

function validateEventType() {
  const checked = form.querySelector('input[name="eventType"]:checked');
  return setError(null, "type-error", checked ? "" : "Please choose an event type.");
}

function validateConsent() {
  const consent = document.getElementById("consent");
  return setError(consent, "consent-error", consent.checked ? "" : "Please tick the box so we can contact you.");
}

form.querySelectorAll('input[name="eventType"]').forEach((r) => r.addEventListener("change", validateEventType));
document.getElementById("consent").addEventListener("change", validateConsent);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSuccess.textContent = "";

  const fieldsValid = Object.keys(rules).map((id) => validateField(document.getElementById(id)));
  const allValid = [...fieldsValid, validateEventType(), validateConsent()].every(Boolean);

  if (!allValid) {
    const firstInvalid = form.querySelector(".invalid, [aria-invalid='true']");
    if (firstInvalid) firstInvalid.focus();
    else form.querySelector('input[name="eventType"]').focus();
    return;
  }

  const name = document.getElementById("name").value.trim().split(" ")[0];
  formSuccess.textContent = `Thank you, ${name}! Your enquiry has been sent – we'll be in touch within 24 hours.`;
  form.reset();
  messageCount.textContent = "0 / 500 characters";
  form.querySelectorAll(".valid").forEach((el) => el.classList.remove("valid"));
});
