// -----------------------------
// HELPERS
// -----------------------------
function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function applyHighlights(text, indices = []) {
  if (!indices.length) return escapeHTML(text);

  let result = "";
  let lastIndex = 0;

  indices.forEach(([start, end]) => {
    result += escapeHTML(text.slice(lastIndex, start));
    result += `<mark>${escapeHTML(text.slice(start, end + 1))}</mark>`;
    lastIndex = end + 1;
  });

  result += escapeHTML(text.slice(lastIndex));
  return result;
}

// -----------------------------
// STATE STORAGE
// -----------------------------
function getAllState() {
  try {
    return JSON.parse(localStorage.getItem("library-reading-state") || "{}");
  } catch {
    return {};
  }
}

function getArchiveState(id) {
  return getAllState()[id] || {};
}

// -----------------------------
// FORMATTING (SAFE + CONSISTENT)
// -----------------------------
function formatResume(state) {
  if (!state) return null;

  const parts = [];

  // progress
  if (typeof state.progress === "number") {
    parts.push(`${Math.round(state.progress * 100)}%`);
  }

  // chapter (SAFE NORMALIZATION)
  let chapter = null;

  if (typeof state.activeChapterTitle === "string") {
    chapter = state.activeChapterTitle;
  }

  if (chapter) parts.push(chapter);

  return parts.length ? parts : null;
}

// -----------------------------
// INIT
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  const data = window.archiveData || [];

  const grid = document.querySelector("#archiveGrid");
  const searchInput = document.querySelector("#archiveSearch");
  const typeButtons = document.querySelectorAll(".tag-btn");

  if (!grid) return;

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  const SORT_OPTIONS = {
    default: (a, b) => 0,
    az: (a, b) => a.item.title.localeCompare(b.item.title),
    za: (a, b) => b.item.title.localeCompare(a.item.title),
  };

  const state = {
    query: "",
    type: "all",
    sort: "default",
    focusedIndex: 0,
  };

  const fuse = new Fuse(data, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "description", weight: 0.3 },
      { name: "tags", weight: 0.1 },
    ],
    includeMatches: true,
    threshold: 0.35,
    ignoreLocation: true,
  });

  // -----------------------------
  // FILTERING
  // -----------------------------
  function getFiltered() {
    const results = state.query
      ? fuse.search(state.query)
      : data.map((item) => ({ item, matches: [] }));

    const filtered = results.filter(
      (r) => state.type === "all" || r.item.type === state.type
    );

    return filtered.sort(
      SORT_OPTIONS[state.sort] || SORT_OPTIONS.default
    );
  }

  // -----------------------------
  // FOCUS
  // -----------------------------
  function updateFocus() {
    const cards = [...document.querySelectorAll(".archive-card")];
    if (!cards.length) return;

    state.focusedIndex = Math.max(
      0,
      Math.min(state.focusedIndex, cards.length - 1)
    );

    cards.forEach((c) => c.classList.remove("focused"));

    const active = cards[state.focusedIndex];
    if (active) {
      active.classList.add("focused");
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  // -----------------------------
  // CARD
  // -----------------------------
  function createCard(result) {
    const item = result.item;
    const matches = result.matches || [];

    const a = document.createElement("a");
    a.className = "archive-card";
    a.href = `/library/${item.id}`;
    a.dataset.id = item.id;
    a.rel = "prefetch";
    a.tabIndex = 0;

    const titleMatch = matches.find((m) => m.key === "title");
    const descMatch = matches.find((m) => m.key === "description");

    const titleHTML = applyHighlights(
      item.title,
      titleMatch?.indices || []
    );

    const descHTML = applyHighlights(
      item.description,
      descMatch?.indices || []
    );

    const tags = (item.tags || [])
      .map((t) => `<span class="tag">${escapeHTML(t)}</span>`)
      .join("");

    a.innerHTML = `
      ${item.cover ? `<img src="${item.cover}" class="archive-cover" />` : ""}

      <div class="archive-card-content">
        <h3>${titleHTML}</h3>

        <p class="archive-card-meta">
          <span>${item.type}</span>
          ${
            item.pubDate
              ? `<span>${new Date(item.pubDate).toDateString()}</span>`
              : ""
          }
        </p>

        <div class="archive-resume"></div>

        <p class="archive-desc">${descHTML}</p>

        <div class="tag-row">${tags}</div>
      </div>
    `;

    a.addEventListener("mouseenter", () => {
      const cards = [...document.querySelectorAll(".archive-card")];
      state.focusedIndex = cards.indexOf(a);
      updateFocus();
    });

    return a;
  }

  // -----------------------------
  // RESUME UI
  // -----------------------------
  function hydrateResumeCards() {
    const cards = document.querySelectorAll(".archive-card");

    cards.forEach((card) => {
      const id = card.dataset.id;
      if (!id) return;

      const state = getArchiveState(id);
      const box = card.querySelector(".archive-resume");
      const desc = card.querySelector(".archive-desc");

      if (!box) return;

      const resumeParts = formatResume(state);

      if (!resumeParts) return;

      const [progress, chapter] = resumeParts;

      if (!resumeParts) {
        box.innerHTML = "";
        if (desc) desc.style.display = "block";
        return;
      }

      box.innerHTML = `
        <div class="resume-pill">📖 Continue reading</div>
        <div class="resume-meta">
          ${progress ? `${progress}` : ""}
          ${chapter ? ` • ${escapeHTML(chapter)}` : ""}
        </div>
      `;

      if (desc) desc.style.display = "none";
    });
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  function render() {
    const items = getFiltered();

    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML = `<p style="opacity:.6">No results found</p>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach((r) => frag.appendChild(createCard(r)));

    grid.appendChild(frag);

    state.focusedIndex = 0;

    requestAnimationFrame(() => {
      updateFocus();
      hydrateResumeCards();
    });
  }

  // -----------------------------
  // INPUTS
  // -----------------------------
  searchInput?.addEventListener(
    "input",
    debounce((e) => {
      state.query = e.target.value.trim();
      render();
    }, 120)
  );

  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.type = btn.dataset.type;

      typeButtons.forEach((b) =>
        b.classList.toggle("active", b === btn)
      );

      render();
    });
  });

  const sortSelect = document.querySelector("#archiveSort");
  sortSelect?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  // initial render
  render();
});

window.dispatchEvent(new Event("archive:rendered"));