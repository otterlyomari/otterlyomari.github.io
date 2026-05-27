import { initLightbox, openLightbox } from "./gallery-lightbox.js";

let galleryMounted = false;
let worker = null;

let layoutMap = [];
let gallery, buttons;
let observer = null;

/* IMPORTANT: now stores { src, ratio } */
let pool = [];

/* ========================= INIT ========================= */

export function initGallery() {
  gallery = document.getElementById("gallery");
  buttons = document.querySelectorAll(".filter-btn");

  initLightbox();

  if (!gallery || !buttons.length) return;
  if (galleryMounted) return;
  galleryMounted = true;

  /* ========================= DATA ========================= */

  const galleryData = [
    {
      category: "art",
      images: [
        "/fursona-art/gyatt.png",
        "/fursona-art/aussiekittenOma.png",
        "/fursona-art/omariBorger.jpg",
        "/fursona-art/omariHotter.png",
        "/fursona-art/flirtotterbox.jpg",
        "/fursona-art/inlove 11.gif",
        "/fursona-art/gayJuice.png",
        "/fursona-art/fingerheartSkylar.png",
        "/fursona-art/omariBaka.png",
        "/fursona-art/hoodieblep.png",
        "/fursona-art/otterbox.png",
        "/fursona-art/boxHug.png",
        "/fursona-art/awtterOma.png",
        "/fursona-art/cute.png",
        "/fursona-art/omariBlep.png",
        "/fursona-art/swerveCuddle.png",
        "/fursona-art/omariAnime.png",
        "/fursona-art/otterfox.png",
        "/fursona-art/omariCute.png",
        "/fursona-art/149_-_Omari_Symm_Headshot_gift.png",
        "/fursona-art/IMG_3250.png",
        "/fursona-art/IMG_3251.png",
        "/fursona-art/IMG_3253.png",
        "/fursona-art/image.png",
        "/fursona-art/Omari-maw (4).png",
        "/fursona-art/IMG_2010.PNG",
        "/fursona-art/photo_2025-10-15_16-18-21.jpg"
      ]
    },
    {
      category: "vrchat",
      images: [
        "/vrchat-pics/VRChat_2022_001.png",
        "/vrchat-pics/VRChat_2022_002.png",
        "/vrchat-pics/VRChat_2022_003.png",
        "/vrchat-pics/VRChat_2022_004.png",
        "/vrchat-pics/VRChat_2022_005.png",
        "/vrchat-pics/VRChat_2023_001.png",
        "/vrchat-pics/VRChat_2023_002.png",
        "/vrchat-pics/VRChat_2025_001.png",
        "/vrchat-pics/VRChat_2025_002.png",
        "/vrchat-pics/VRChat_2025_003.png",
        "/vrchat-pics/VRChat_2025_004.png",
        "/vrchat-pics/VRChat_2025_005.png",
        "/vrchat-pics/VRChat_2025_006.png",
        "/vrchat-pics/VRChat_2025_007.png",
        "/vrchat-pics/VRChat_2025_008.png",
        "/vrchat-pics/VRChat_2025_009.png",
        "/vrchat-pics/VRChat_2025_010.png",
        "/vrchat-pics/VRChat_2025_011.png",
        "/vrchat-pics/VRChat_2026_001.png",
        "/vrchat-pics/VRChat_2026_002.png",
        "/vrchat-pics/VRChat_2026_003.png",
        "/vrchat-pics/VRChat_2026_004.png",
        "/vrchat-pics/VRChat_2026_005.png",
        "/vrchat-pics/VRChat_2026_006.png",
        "/vrchat-pics/VRChat_2026_007.png",
        "/vrchat-pics/VRChat_2026_008.png",
        "/vrchat-pics/VRChat_2026_009.png",
        "/vrchat-pics/VRChat_2026_010.png",
        "/vrchat-pics/VRChat_2026_011.png",
        "/vrchat-pics/VRChat_2026_012.png",
        "/vrchat-pics/VRChat_2026_013.png",
        "/vrchat-pics/VRChat_2026_014.png",
        "/vrchat-pics/VRChat_2026_015.png",
        "/vrchat-pics/VRChat_2026_016.png"
      ]
    }
  ];

  /* ========================= IMAGE LOADER (CRITICAL FIX) ========================= */

  function loadRatio(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        resolve({
          src,
          ratio: img.height / img.width
        });
      };

      img.onerror = () => {
        resolve({
          src,
          ratio: 1
        });
      };
    });
  }

  function buildPool(filter) {
    const raw =
      filter === "all"
        ? galleryData.flatMap(s => s.images)
        : galleryData.find(s => s.category === filter)?.images || [];

    return raw;
  }

  async function setPool(newPoolRaw) {
    const enriched = await Promise.all(
      newPoolRaw.map(loadRatio)
    );

    pool = enriched;

    worker.postMessage({
      type: "INIT",
      data: { pool }
    });

    setTimeout(requestLayout, 0);
  }

  /* ========================= WORKER ========================= */

  worker = new Worker(
    new URL("./layout-engine.worker.js", import.meta.url),
    { type: "module" }
  );

  worker.onmessage = (e) => {
    if (e.data.type !== "LAYOUT_RESULT") return;

    layoutMap = e.data.layout;

    gallery.style.height = `${e.data.totalHeight}px`;

    render();
  };

  function requestLayout() {
    worker.postMessage({
      type: "LAYOUT",
      data: { width: gallery.clientWidth }
    });
  }

  /* ========================= LAZY LOAD ========================= */

  observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const img = entry.target;
      obs.unobserve(img);

      img.src = img.dataset.src;
      img.onload = () => img.classList.add("loaded");
    }
  }, { rootMargin: "300px" });

  /* ========================= ITEM ========================= */

  function createItem(item) {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";

    const img = document.createElement("img");

    img.dataset.src = item.src;
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener("click", () => {
      openLightbox(item.src);
    });

    wrapper.appendChild(img);
    observer.observe(img);

    return wrapper;
  }

  /* ========================= RENDER ========================= */

  function render() {
    gallery.replaceChildren();

    const fragment = document.createDocumentFragment();

    for (const item of layoutMap) {
      const el = createItem(item);

      el.style.position = "absolute";
      el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      el.style.width = `${item.w}px`;
      el.style.height = `${item.h}px`;

      fragment.appendChild(el);
    }

    gallery.appendChild(fragment);
  }

  /* ========================= FILTERS ========================= */

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      setPool(buildPool(btn.dataset.filter));
    });
  });

  /* ========================= BOOT ========================= */

  setPool(buildPool("all"));

  window.addEventListener("resize", requestLayout);
}

document.addEventListener("DOMContentLoaded", initGallery);
document.addEventListener("astro:page-load", initGallery);