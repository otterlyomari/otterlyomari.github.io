// gallery-render.js

import { openLightbox } from "./gallery-lightbox.js";

let imageObserver;
let videoObserver;
let getSources;

/* ========================= INIT ========================= */

export function initGalleryRender({
  imgObserver,
  vidObserver,
  sourcesFn
}) {
  imageObserver = imgObserver;
  videoObserver = vidObserver;
  getSources = sourcesFn;
}

/* ========================= SKELETON ========================= */

export function showSkeletons(gallery, count) {
  gallery.replaceChildren();
  gallery.style.opacity = "1";

  const fragment = document.createDocumentFragment();
  const w = gallery.getBoundingClientRect().width;
  const colCount = w < 700 ? 2 : w < 1100 ? 3 : 4;

  for (let i = 0; i < Math.min(count, colCount * 3); i++) {
    const sk = document.createElement("div");
    sk.className = "gallery-skeleton";
    sk.style.setProperty("--sk-delay", `${(i % colCount) * 0.1}s`);
    fragment.appendChild(sk);
  }

  gallery.appendChild(fragment);
}

/* ========================= ITEM ========================= */

function createItem(item, index, sources) {
  const wrapper = document.createElement("div");
  wrapper.className = "gallery-item-wrapper";

  const src = item.src;
  const isVideo = src.endsWith(".webm") || src.endsWith(".mp4");

  if (isVideo) {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";

    if (window.matchMedia("(hover: hover)").matches) {
      wrapper.addEventListener("mouseenter", () => video.play().catch(() => {}));
      wrapper.addEventListener("mouseleave", () => video.pause());
    }

    video.addEventListener("click", () =>
      openLightbox(item, sources, index)
    );

    videoObserver.observe(video);
    wrapper.appendChild(video);
    return wrapper;
  }

  const img = document.createElement("img");
  img.dataset.src = src;
  img.decoding = "async";

  img.onerror = () => {
    img.classList.add("load-error");
    imageObserver.unobserve(img);
  };

  imageObserver.observe(img);

  img.addEventListener("click", () =>
    openLightbox(item, sources, index)
  );

  wrapper.appendChild(img);
  return wrapper;
}

/* ========================= RENDER ========================= */

export function renderGallery(gallery, layoutMap) {
  console.log("renderGallery CALLED");
  console.log("gallery:", gallery);
  console.log("layoutMap:", layoutMap);

  gallery.replaceChildren();

  const fragment = document.createDocumentFragment();
  const sources = getSources?.() ?? [];

  for (let i = 0; i < layoutMap.length; i++) {
    const item = layoutMap[i];
    const el = createItem(item, i, sources);

    el.style.cssText = `
      position: absolute;
      transform: translate3d(${item.x}px, ${item.y}px, 0);
      width: ${item.w}px;
      height: ${item.h}px;
      overflow: hidden;
      will-change: transform;
      contain: layout paint;
    `;

    fragment.appendChild(el);
  }

  gallery.appendChild(fragment);
}