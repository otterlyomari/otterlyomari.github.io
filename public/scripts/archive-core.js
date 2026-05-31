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
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  const SORT_OPTIONS = {
    default:  (a, b) => 0,
    az:       (a, b) => a.item.title.localeCompare(b.item.title),
    za:       (a, b) => b.item.title.localeCompare(a.item.title),
  };

  // Add sort to state
  const state = {
    query: "",
    type: "all",
    sort: "default",
    focusedIndex: 0,
    items: []
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
  // FILTER
  // -----------------------------
  function getFiltered() {
    const results = state.query
      ? fuse.search(state.query)
      : data.map(item => ({ item, matches: [] }));

    const filtered = results.filter(r =>
      state.type === "all" || r.item.type === state.type
    );

    return [...filtered].sort(SORT_OPTIONS[state.sort] ?? SORT_OPTIONS.default);
  }

  // -----------------------------
  // FOCUS ENGINE (FIXED)
  // -----------------------------
  function updateFocus() {
    const cards = [...document.querySelectorAll(".archive-card")];
    if (!cards.length) return;

    state.focusedIndex = Math.max(
      0,
      Math.min(state.focusedIndex, cards.length - 1)
    );

    cards.forEach(c => c.classList.remove("focused"));

    const active = cards[state.focusedIndex];
    if (!active) return;

    active.classList.add("focused");
    active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // -----------------------------
  // CARD CREATION
  // -----------------------------
  function createCard(result, index) {
    const item = result.item;
    const matches = result.matches || [];

    const a = document.createElement("a");
    a.className = "archive-card";
    a.href = `/library/${item.id}`;
    a.tabIndex = 0;

    const titleMatch = matches.find(m => m.key === "title");
    const descMatch = matches.find(m => m.key === "description");

    const titleHTML = applyHighlights(item.title, titleMatch?.indices || []);
    const descHTML = applyHighlights(item.description, descMatch?.indices || []);

    const tags = (item.tags || [])
      .map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
      .join("");

    a.innerHTML = `
      ${item.cover ? `<img src="${item.cover}" class="archive-cover" />` : ""}
      <h3>${titleHTML}</h3>
      <p>${descHTML}</p>
      <div class="tag-row">${tags}</div>
    `;

    // hover sync
    a.addEventListener("mouseenter", () => {
      const cards = [...document.querySelectorAll(".archive-card")];
      state.focusedIndex = cards.indexOf(a);
      updateFocus();
    });

    return a;
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  function render() {
    const items = getFiltered();
    state.items = items;

    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML = `<p style="opacity:.6">No results found</p>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach((item, i) => {
      frag.appendChild(createCard(item, i));
    });

    grid.appendChild(frag);

    state.focusedIndex = 0;
    requestAnimationFrame(updateFocus);
  }

  // -----------------------------
  // GLOBAL KEYBOARD (FIXED BIG ISSUE)
  // -----------------------------
  window.addEventListener("keydown", (e) => {
    const cards = [...document.querySelectorAll(".archive-card")];
    if (!cards.length) return;

    const activeEl = document.activeElement;
    const typingInInput =
      activeEl &&
      (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

    if (!typingInInput) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.focusedIndex++;
        updateFocus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        state.focusedIndex--;
        updateFocus();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const active = cards[state.focusedIndex];
        if (active) window.location.href = active.href;
      }
    }
  });

  // -----------------------------
  // SEARCH
  // -----------------------------
  searchInput?.addEventListener("input", debounce((e) => {
    state.query = e.target.value.trim();
    render();
  }, 120));

  // -----------------------------
  // FILTERS
  // -----------------------------
  typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.type = btn.dataset.type;

      typeButtons.forEach(b =>
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
  render();
});