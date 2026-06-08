// gallery-observers.js

let imgObserver;
let videoObserver;

/* ========================= INIT ========================= */

export function initObservers() {
  imgObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const el = entry.target;
      obs.unobserve(el);

      if (el.dataset.src) {
        el.src = el.dataset.src;
      }

      el.onload = () => el.classList.add("loaded");
    }
  }, {
    rootMargin: "800px 0px"
  });

  videoObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;

      if (!entry.isIntersecting) {
        video.pause();
        continue;
      }

      if (!window.matchMedia("(hover: hover)").matches) {
        video.play().catch(() => {});
      }
    }
  }, {
    threshold: 0.25
  });
}

/* ========================= ACCESS ========================= */

export function getImageObserver() {
  return imgObserver;
}

export function getVideoObserver() {
  return videoObserver;
}

export function disconnectObservers() {
  imgObserver?.disconnect();
  videoObserver?.disconnect();
}