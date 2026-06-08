import { initLightbox } from "./gallery-lightbox.js";

import {
  initGalleryRender,
  renderGallery,
  showSkeletons
} from "./gallery-render.js";

import {
  initObservers,
  getImageObserver,
  getVideoObserver,
  disconnectObservers
} from "./gallery-observers.js";

import { categoryRegistry } from "../../data/gallery/index.js";

/* ========================= STATE ========================= */

let galleryMounted = false;

let worker;
let layoutMap = [];

let gallery, buttons;
let resizeObserver;
let resizeTimer;
let layoutSeq = 0;

const loadedCategories = new Map();

console.log("[gallery] loaded");

/* ========================= SAFE CATEGORY LOADER ========================= */

async function loadCategory(name) {
  if (loadedCategories.has(name)) {
    return loadedCategories.get(name);
  }

  const loader = categoryRegistry[name];

  if (typeof loader !== "function") {
    console.warn("[gallery] missing loader:", name);
    return [];
  }

  try {
    const data = await loader();

    const images = Array.isArray(data?.images)
      ? data.images
      : Array.isArray(data)
      ? data
      : [];

    loadedCategories.set(name, images);
    return images;

  } catch (err) {
    console.error("[gallery] failed category:", name, err);
    return [];
  }
}

/* ========================= INIT ========================= */

export function initGallery() {
  console.log("🔥 INIT GALLERY FIRED");
  window.__galleryInit = true;

  gallery = document.getElementById("gallery");
  buttons = document.querySelectorAll(".filter-btn");

  if (!gallery) {
    console.error("[gallery] missing #gallery");
    return;
  }

  if (!buttons.length) {
    console.warn("[gallery] .filter-btn not found yet — retrying");

    requestAnimationFrame(() => {
      buttons = document.querySelectorAll(".filter-btn");
      if (!buttons.length) {
        console.error("[gallery] buttons still missing");
        return;
      }

      continueInit();
    });

    return;
  }

  if (galleryMounted) return;
  galleryMounted = true;

  continueInit();
}

/* ========================= CONTINUE INIT ========================= */

function continueInit() {
  initLightbox();
  initObservers();

  initGalleryRender({
    imgObserver: getImageObserver(),
    vidObserver: getVideoObserver(),
    sourcesFn: () => layoutMap
  });

  worker = new Worker(
    new URL("./layout-engine.worker.js", import.meta.url),
    { type: "module" }
  );

  worker.onmessage = (e) => {
    console.log("[worker RAW]", e.data);
    if (e.data.type !== "LAYOUT_RESULT") return;
    if (e.data.seq !== layoutSeq) return;

    layoutMap = e.data.layout;

    gallery.style.height = `${e.data.totalHeight}px`;

    showSkeletons(gallery, layoutMap.length);
    renderGallery(gallery, layoutMap);
  };

  worker.onerror = (err) => {
    console.error("[worker error]", err);
  };

  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(requestLayout, 80);
  });

  resizeObserver.observe(gallery);

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (btn.classList.contains("active")) return;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const pool = await buildPool(btn.dataset.filter);
      setPool(pool, { transition: true });
    });
  });

  requestAnimationFrame(async () => {
    const pool = await buildPool("all");
    setPool(pool);
  });
}

/* ========================= POOL ========================= */

async function buildPool(filter) {
  console.log("[gallery] buildPool called with:", filter);

  if (filter === "all") {
    const all = await Promise.all(
      Object.keys(categoryRegistry).map(loadCategory)
    );

    console.log("[gallery] raw categories:", all);

    return all.flat();
  }

  const result = await loadCategory(filter);
  console.log("[gallery] single category:", result);

  return result;
}

/* ========================= RATIO ========================= */

function getRatio(src) {
  if (src.endsWith(".webm") || src.endsWith(".mp4")) return 1080 / 1920;
  if (src.includes("/vrchat-pics/")) return 1080 / 1920;
  return 1;
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;
  if (!item.src || typeof item.src !== "string") return null;

  return {
    src: item.src,
    thumb: item.thumb ?? null,
    artist: item.artist ?? null,

    type:
      item.src.endsWith(".webm") || item.src.endsWith(".mp4")
        ? "video"
        : "image",

    ratio: getRatio(item.src)
  };
}

/* ========================= SET POOL ========================= */

async function setPool(raw, { transition = false } = {}) {

  const pool = raw
    .map(normalizeItem)
    .filter(Boolean);

    window.__galleryPool = pool;
  console.log("[gallery] pool size:", pool.length);
  console.table(pool.slice(0, 5));

  console.log("[gallery] pool size:", pool.length);

  if (transition) {
    gallery.style.opacity = "0";
    void gallery.offsetHeight;
    await new Promise(r => setTimeout(r, 120));
  }

  showSkeletons(gallery, pool.length);

  worker.postMessage({
    type: "INIT",
    data: { pool }
  });

  requestLayout();
}

/* ========================= LAYOUT ========================= */

function requestLayout() {
  if (!worker || !gallery) return;

  const width = Math.floor(gallery.getBoundingClientRect().width || 0);

  if (!width) {
    requestAnimationFrame(requestLayout);
    return;
  }

  const seq = ++layoutSeq;
  worker.postMessage({ type: "LAYOUT", data: { width }, seq });
}

/* ========================= CLEANUP ========================= */

document.addEventListener("astro:before-swap", () => {
  worker?.terminate();
  resizeObserver?.disconnect();
  disconnectObservers();

  worker = null;
  galleryMounted = false;
}, { once: true });

/* ========================= BOOT ========================= */

function bootGallery() {
  if (window.__galleryInit) return;
  window.__galleryInit = true;

  const run = () => {
    console.log("[gallery] boot triggered");
    initGallery();
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    requestAnimationFrame(run);
  } else {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  }
}

bootGallery();

document.addEventListener("astro:page-load", () => {
  window.__galleryInit = false; // allow re-init per page swap
  bootGallery();
});