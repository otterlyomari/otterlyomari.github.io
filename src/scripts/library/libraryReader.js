import {
  restoreScroll,
  initProgressTracker,
} from "./reader.js";

import {
  initChapterSidebar,
} from "./chapterSidebar.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const slug =
      document.body.dataset.slug;

    if (!slug) return;

    restoreScroll(slug);

    initProgressTracker(slug);

    initChapterSidebar(slug);
  }
);