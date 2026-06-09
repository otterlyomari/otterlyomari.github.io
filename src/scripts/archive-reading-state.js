const STORAGE_KEY = "library-reading-state";

function getState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function formatProgress(p) {
  return Math.round((p || 0) * 100);
}

export function initArchiveReadingState() {
  const state = getState();

  document.querySelectorAll("[data-resume-id]").forEach((el) => {
    const id = el.dataset.resumeId;
    const entry = state[id];

    if (!entry || !entry.progress || entry.progress < 0.05) return;

    const chapter =
      entry.lastChapterTitle ||
      (entry.activeChapter ? `Chapter: ${entry.activeChapter}` : null);

    const badge = document.createElement("div");
    badge.className = "resume-pill";

    badge.textContent = chapter
      ? `Continue • ${chapter} • ${formatProgress(entry.progress)}%`
      : `Continue reading • ${formatProgress(entry.progress)}%`;

    el.appendChild(badge);
  });
}