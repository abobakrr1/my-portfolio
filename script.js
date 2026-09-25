const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const isTouch = matchMedia("(hover: none)").matches;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ Preloader ============ */
document.body.classList.add("loading");
window.addEventListener("load", () => {
  setTimeout(() => {
    $("#loader").classList.add("hide");
    document.body.classList.remove("loading");
    startTyping();
  }, 1100);
});

/* ============ Typing effect ============ */
const roles = [
  "responsive websites.",
  "interactive web apps.",
  "real-time chat systems.",
  "clean user interfaces.",
  "solutions to problems.",
];

function startTyping() {
  const el = $("#typed");
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const word = roles[roleIndex];
    el.textContent = word.slice(0, charIndex);

    if (!deleting && charIndex < word.length) {
      charIndex++;
      setTimeout(tick, 70);
    } else if (!deleting) {
      deleting = true;
      setTimeout(tick, 1600);
    } else if (charIndex > 0) {
      charIndex--;
      setTimeout(tick, 35);
    } else {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(tick, 300);
    }
  }
  tick();
}

/* ============ Nav: scroll state, hide on scroll down, active link ============ */
const nav = $("#nav");
const progress = $("#scrollProgress");
let lastY = 0;

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);
  nav.classList.toggle("hidden", y > lastY && y > 400 && !nav.classList.contains("menu-open"));
  lastY = y;

  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${(y / max) * 100}%`;
}
window.addEventListener("scroll", onScroll, { passive: true });

const sections = $$("section[id]");
const navLinks = $$(".nav-link");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ============ Mobile menu ============ */
const menuBtn = $("#menuBtn");
const navLinksWrap = $("#navLinks");

function toggleMenu(force) {
  const open = force ?? !navLinksWrap.classList.contains("open");
  navLinksWrap.classList.toggle("open", open);
  menuBtn.classList.toggle("open", open);
  nav.classList.toggle("menu-open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
menuBtn.addEventListener("click", () => toggleMenu());
navLinks.forEach((link) => link.addEventListener("click", () => toggleMenu(false)));

/* ============ Reveal on scroll (+ skill bars, counters) ============ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("in");

      $$(".bar i", el).forEach((bar) => (bar.style.width = `${bar.dataset.w}%`));
      $$(".counter", el).forEach(animateCounter);
      if (el.classList.contains("counter")) animateCounter(el);

      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.15 }
);

// Stagger siblings that reveal together
$$(".reveal").forEach((el) => {
  const siblings = $$(":scope > .reveal", el.parentElement);
  el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 80}ms`;
  revealObserver.observe(el);
});

function animateCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = +el.dataset.target;
  const start = target > 100 ? target - 40 : 0;
  const duration = 1600;
  const t0 = performance.now();

  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased) + (p === 1 && target < 100 ? "+" : "");
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============ Cursor glow + spotlight cards ============ */
const glow = $("#cursorGlow");
if (!isTouch) {
  window.addEventListener("mousemove", (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

$$(".spotlight").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* ============ 3D tilt ============ */
if (!isTouch && !reducedMotion) {
  $$(".tilt").forEach((card) => {
    const max = card.classList.contains("code-card") ? 10 : 6;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

/* ============ Magnetic buttons ============ */
if (!isTouch && !reducedMotion) {
  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
  });
}

/* ============ Project filters ============ */
const projects = $$(".project");
$("#filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  $$(".filter").forEach((b) => b.classList.toggle("active", b === btn));

  const filter = btn.dataset.filter;
  projects.forEach((p) => {
    const show = filter === "all" || p.dataset.cat === filter;
    p.classList.toggle("hide", !show);
    if (show) {
      p.classList.remove("in");
      p.style.transitionDelay = "0ms";
      requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add("in")));
    }
  });
});

/* ============ Live mini counter (Counter App demo) ============ */
const miniCount = $("#miniCount");
let count = 0;
$$(".mini-counter button").forEach((btn) =>
  btn.addEventListener("click", () => {
    count += +btn.dataset.step;
    miniCount.textContent = count;
    miniCount.classList.remove("bump");
    void miniCount.offsetWidth;
    miniCount.classList.add("bump");
  })
);

/* ============ Contact form -> WhatsApp ============ */
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#cName").value.trim();
  const msg = $("#cMsg").value.trim();
  const text = encodeURIComponent(`Hi Abobakr, I'm ${name}.\n\n${msg}`);
  window.open(`https://wa.me/201140174204?text=${text}`, "_blank", "noopener");
  e.target.reset();
});

$("#year").textContent = new Date().getFullYear();

/* ============ Particle network background ============ */
(function particles() {
  if (reducedMotion) return;
  const canvas = $("#bgCanvas");
  const ctx = canvas.getContext("2d");
  let w, h, dots;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const count = Math.min(Math.floor((innerWidth * innerHeight) / 18000), 80);
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > innerWidth) a.vx *= -1;
      if (a.y < 0 || a.y > innerHeight) a.vy *= -1;

      ctx.fillStyle = "rgba(160, 140, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.25 * (1 - md / 180)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  resize();
  draw();
})();
