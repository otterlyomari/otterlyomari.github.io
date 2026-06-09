import {
  setActiveChapter,
  getActiveChapter,
} from "./reader.js";

export function initChapterSidebar(slug) {
  const sidebar = document.querySelector(".chapter-sidebar");
  const headings = document.querySelectorAll(
    ".entry-content h2[id]"
  );

  if (!sidebar || headings.length === 0) return;

  sidebar.innerHTML = "";

  const links = new Map();

  // -----------------------------
  // Build sidebar
  // -----------------------------
  headings.forEach((h) => {
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;

    sidebar.appendChild(a);
    links.set(h.id, a);

    // smooth scroll
    a.addEventListener("click", (e) => {
      e.preventDefault();

      document.getElementById(h.id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  // -----------------------------
  // Active chapter tracking (FIXED)
  // -----------------------------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        sidebar
          .querySelectorAll("a")
          .forEach((a) => a.classList.remove("active"));

        const active = links.get(id);
        if (active) active.classList.add("active");

        setActiveChapter(slug, id);
      });
    },
    {
      rootMargin: "-40% 0px -55% 0px",
      threshold: 0.1,
    }
  );

  headings.forEach((h) => observer.observe(h));

  // -----------------------------
  // Restore active chapter
  // -----------------------------
  const saved = getActiveChapter(slug);

  if (saved) {
    const el = links.get(saved);
    el?.classList.add("active");
  }
}