const STORAGE_KEY = "library-reading-state";

/* -----------------------------
Storage
----------------------------- */

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getState(slug) {
  return getAll()[slug] || {};
}

function setState(slug, patch) {
  const all = getAll();

  all[slug] = {
    ...all[slug],
    ...patch,
    lastUpdated: Date.now(),
  };

  saveAll(all);
}

/* -----------------------------
Kindle Location
----------------------------- */

function computeLocation() {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY;

  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  const location = Math.max(1, Math.round(progress * 10000));

  return { scrollTop, progress, location };
}

/* -----------------------------
Progress Bar
----------------------------- */

function updateProgressBar(progress) {
  const bar = document.querySelector(".reader-progress-fill");
  if (bar) bar.style.width = `${progress * 100}%`;
}

/* -----------------------------
Restore
----------------------------- */

function restoreLocation(state) {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  if (!docHeight) return;

  const scrollTop = Math.round((state.progress || 0) * docHeight);

  window.scrollTo({
    top: scrollTop,
    behavior: "smooth",
  });

  updateProgressBar(state.progress || 0);
}

/* -----------------------------
Toast
----------------------------- */

function formatTimeAgo(ms) {
  const diff = Date.now() - ms;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return `${hours}h ago`;
}

function getChapterTitle(id) {
  if (!id) return null;
  const el = document.getElementById(id);
  return el?.textContent?.trim() || null;
}

function showResumeToast(slug) {
  const state = getState(slug);

  let toast = document.querySelector(".reader-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "reader-toast";
    document.body.appendChild(toast);
  }

  const chapter = getChapterTitle(state.activeChapter);
  const timeText = state.lastReadAt ? formatTimeAgo(state.lastReadAt) : "";

  const label = chapter
    ? `Continue “${chapter}”`
    : `Continue reading`;

  toast.textContent = timeText ? `${label} • ${timeText}` : label;

  toast.classList.add("show");

  toast.onclick = () => {
    restoreLocation(state);

    toast.classList.remove("show");

    setState(slug, {
      lastResumeShown: Date.now(),
    });
  };

  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.classList.remove("show");
  }, 9000);
}

/* -----------------------------
Progress Tracker
----------------------------- */

export function initProgressTracker(slug) {
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const { scrollTop, progress, location } = computeLocation();

        setState(slug, {
          scrollY: scrollTop,
          progress,
          location,
          lastReadAt: Date.now(),
        });

        updateProgressBar(progress);
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* -----------------------------
Chapter tracking
----------------------------- */

export function initChapterTracking(slug) {
  requestAnimationFrame(() => {
    const headings = document.querySelectorAll(".entry-content h2[id]");
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          setState(slug, {
            activeChapter: entry.target.id,
            activeChapterTitle: entry.target.textContent?.trim() || null,
          });
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((h) => observer.observe(h));
  });
}

/* -----------------------------
Sidebar
----------------------------- */

export function initChapterSidebar(slug) {
  const sidebar = document.querySelector(".chapter-sidebar");
  const headings = document.querySelectorAll(".entry-content h2[id]");

  if (!sidebar || !headings.length) return;

  sidebar.innerHTML = "";

  const map = new Map();

  headings.forEach((h) => {
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;

    sidebar.appendChild(a);
    map.set(h.id, a);
  });

  function updateActive() {
    let current = headings[0];

    headings.forEach((h) => {
      if (h.getBoundingClientRect().top <= 150) {
        current = h;
      }
    });

    map.forEach((a) => a.classList.remove("active"));
    map.get(current.id)?.classList.add("active");
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
}

/* -----------------------------
SESSION BAR + AUTO HIDE
----------------------------- */

export function initReaderSessionBar(slug) {
  const bar = document.querySelector(".reader-session-bar");
  if (!bar) return;

  const chapterSelect = bar.querySelector(".rs-chapters");
  const bookmarkBtn = bar.querySelector(".rs-bookmark");

  const headings = document.querySelectorAll(".entry-content h2[id]");

  /* populate chapters */
  headings.forEach((h) => {
    const opt = document.createElement("option");
    opt.value = h.id;
    opt.textContent = h.textContent;
    chapterSelect.appendChild(opt);
  });

  chapterSelect.addEventListener("change", (e) => {
    const id = e.target.value;
    if (!id) return;

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  /* bookmark */
  bookmarkBtn.addEventListener("click", () => {
    const state = getState(slug);

    const bookmarks = state.bookmarks || [];

    bookmarks.push({
      location: state.location,
      activeChapter: state.activeChapter,
      createdAt: Date.now(),
    });

    setState(slug, { bookmarks });

    bookmarkBtn.textContent = "✔ Bookmarked";
    setTimeout(() => (bookmarkBtn.textContent = "🔖 Bookmark"), 1200);
  });

  /* -----------------------------
  AUTO HIDE LOGIC
  ----------------------------- */

  let lastScroll = window.scrollY;
  let visible = true;
  let hideTimer;

  const show = () => {
    if (!visible) {
      bar.style.transform = "translateY(0)";
      visible = true;
    }
  };

  const hide = () => {
    if (visible) {
      bar.style.transform = "translateY(-110%)";
      visible = false;
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY;

      const goingDown = current > lastScroll;

      clearTimeout(hideTimer);

      if (goingDown && current > 120) {
        hide();
      } else {
        show();
      }

      hideTimer = setTimeout(() => {
        hide();
      }, 1800);

      lastScroll = current;
    },
    { passive: true }
  );
}

/* -----------------------------
Resume
----------------------------- */

export function initResumePrompt(slug) {
  const state = getState(slug);

  const hasData =
    typeof state.progress === "number" || state.activeChapter;

  if (!hasData) return;

  showResumeToast(slug);
}