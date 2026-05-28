import { initLightbox, openLightbox } from "./gallery-lightbox.js";

let galleryMounted = false;
let worker = null;

let layoutMap = [];
let gallery, buttons;
let observer = null;
let videoObserver = null;

/* ========================= INIT ========================= */

export function initGallery() {
  gallery = document.getElementById("gallery");
  buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;
  if (galleryMounted) return;
  galleryMounted = true;

  initLightbox();

  /* ========================= DATA ========================= */

  const galleryData = [
    {
      category: "art",
      images: [
        "/fursona-art/gyatt.webp",
        "/fursona-art/aussiekittenOma.webp",
        "/fursona-art/omariBorger.webp",
        "/fursona-art/omariHotter.webp",
        "/fursona-art/flirtotterbox.webp",
        "/fursona-art/inlove-11.webm",
        "/fursona-art/gayJuice.webp",
        "/fursona-art/fingerheartSkylar.webp",
        "/fursona-art/omariBaka.webp",
        "/fursona-art/hoodieblep.webp",
        "/fursona-art/otterbox.webp",
        "/fursona-art/boxHug.webp",
        "/fursona-art/awtterOma.webp",
        "/fursona-art/cute.webp",
        "/fursona-art/omariBlep.webp",
        "/fursona-art/swerveCuddle.webp",
        "/fursona-art/omariAnime.webp",
        "/fursona-art/otterfox.webp",
        "/fursona-art/omariCute.webp",
        "/fursona-art/149_-_Omari_Symm_Headshot_gift.webp",
        "/fursona-art/IMG_3250.webp",
        "/fursona-art/IMG_3251.webp",
        "/fursona-art/IMG_3253.webp",
        "/fursona-art/image.webp",
        "/fursona-art/Omari-maw (4).webp",
        "/fursona-art/IMG_2010.webp",
        "/fursona-art/photo_2025-10-15_16-18-21.webp"
      ]
    },
    {
      category: "vrchat",
      images: [
        "/vrchat-pics/VRChat_2022_001.webp",
        "/vrchat-pics/VRChat_2022_002.webp",
        "/vrchat-pics/VRChat_2022_003.webp",
        "/vrchat-pics/VRChat_2022_004.webp",
        "/vrchat-pics/VRChat_2022_005.webp",
        "/vrchat-pics/VRChat_2023_001.webp",
        "/vrchat-pics/VRChat_2023_002.webp",
        "/vrchat-pics/VRChat_2025_001.webp",
        "/vrchat-pics/VRChat_2025_002.webp",
        "/vrchat-pics/VRChat_2025_003.webp",
        "/vrchat-pics/VRChat_2025_004.webp",
        "/vrchat-pics/VRChat_2025_005.webp",
        "/vrchat-pics/VRChat_2025_006.webp",
        "/vrchat-pics/VRChat_2025_007.webp",
        "/vrchat-pics/VRChat_2025_008.webp",
        "/vrchat-pics/VRChat_2025_009.webp",
        "/vrchat-pics/VRChat_2025_010.webp",
        "/vrchat-pics/VRChat_2025_011.webp",
        "/vrchat-pics/VRChat_2026_001.webp",
        "/vrchat-pics/VRChat_2026_002.webp",
        "/vrchat-pics/VRChat_2026_003.webp",
        "/vrchat-pics/VRChat_2026_004.webp",
        "/vrchat-pics/VRChat_2026_005.webp",
        "/vrchat-pics/VRChat_2026_006.webp",
        "/vrchat-pics/VRChat_2026_007.webp",
        "/vrchat-pics/VRChat_2026_008.webp",
        "/vrchat-pics/VRChat_2026_009.webp",
        "/vrchat-pics/VRChat_2026_010.webp",
        "/vrchat-pics/VRChat_2026_011.webp",
        "/vrchat-pics/VRChat_2026_012.webp",
        "/vrchat-pics/VRChat_2026_013.webp",
        "/vrchat-pics/VRChat_2026_014.webp",
        "/vrchat-pics/VRChat_2026_015.webp",
        "/vrchat-pics/VRChat_2026_016.webp"
      ]
    }
  ];

  /* ========================= MEDIA TYPE ========================= */

  const VIDEO_EXT = [".webm", ".mp4"];

  function getType(src) {
    return VIDEO_EXT.some(ext => src.endsWith(ext)) ? "video" : "image";
  }

  function getRatio(item) {
    if (item.src.endsWith(".webm")) return 1080 / 1920;
    if (item.src.includes("/vrchat-pics/")) return 1080 / 1920;
    return 1;
  }

  /* ========================= POOL ========================= */

  function buildPool(filter) {
    const raw =
      filter === "all"
        ? galleryData.flatMap(s =>
            s.images.map(src => ({ src, category: s.category }))
          )
        : galleryData
            .find(s => s.category === filter)
            ?.images.map(src => ({ src, category: filter })) || [];

    return raw;
  }

  async function setPool(newPoolRaw) {
    const pool = newPoolRaw.map(item => ({
      src: item.src,
      ratio: getRatio(item),
      type: getType(item.src)
    }));

    worker.postMessage({
      type: "INIT",
      data: { pool }
    });

    requestLayout();
    warmupMedia(pool);
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
    const width = Math.floor(gallery.getBoundingClientRect().width);

    worker.postMessage({
      type: "LAYOUT",
      data: { width }
    });
  }

  /* ========================= OBSERVERS ========================= */

  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target;
        obs.unobserve(el);

        el.src = el.dataset.src;
        el.onload = () => el.classList.add("loaded");
      }
    },
    { rootMargin: "800px 0px" }
  );

  videoObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;

        if (!entry.isIntersecting) {
          video.pause();
          continue;
        }

        const rect = entry.boundingClientRect;
        const centerBias = Math.abs(rect.top - window.innerHeight / 2);

        if (centerBias < 400) {
          video.play().catch(() => {});
        }
      }
    },
    { threshold: 0.25 }
  );

  /* ========================= PRELOAD ========================= */

  function warmupMedia(list) {
    const center = Math.floor(list.length / 2);

    const priority = [
      ...list.slice(center, center + 6),
      ...list.slice(0, 6)
    ];

    for (const item of priority) {
      if (item.type === "video") {
        const v = document.createElement("video");
        v.src = item.src;
        v.preload = "metadata";
      } else {
        const img = new Image();
        img.src = item.src;
      }
    }
  }

  /* ========================= ITEMS ========================= */

  function createItem(item) {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";

    const src = item.src;
    const type = getType(src);

    if (type === "video") {
      const video = document.createElement("video");

      video.src = src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";

      video.addEventListener("click", () => openLightbox(src));

      videoObserver.observe(video);

      wrapper.appendChild(video);
      return wrapper;
    }

    const img = document.createElement("img");

    img.dataset.src = src;
    img.loading = "eager";
    img.decoding = "async";

    const preload = new Image();
    preload.src = src;

    preload.onload = () => {
      img.src = src;
    };

    img.addEventListener("click", () => openLightbox(src));

    observer.observe(img);

    wrapper.appendChild(img);
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
      el.style.overflow = "hidden";
      el.style.willChange = "transform";

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

  requestAnimationFrame(() => {
    setPool(buildPool("all"));
  });

  window.addEventListener("resize", requestLayout);
}

document.addEventListener("DOMContentLoaded", initGallery);
document.addEventListener("astro:page-load", initGallery);