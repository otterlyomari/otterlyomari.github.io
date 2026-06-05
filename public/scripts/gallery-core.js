import { initLightbox, openLightbox } from "./gallery-lightbox.js";

let galleryMounted = false;
let worker = null;

let layoutMap = [];
let gallery, buttons;
let resizeObserver = null;
let observer = null;
let videoObserver = null;

let layoutSeq = 0;
let resizeTimer = null;

/* ========================= INIT ========================= */

function initGallery() {
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
        { src: "/fursona-art/gyatt.webp", artist: "Kelouring" },
        { src: "/fursona-art/aussiekittenOma.webp", artist: "AussieKitten" },
        { src: "/fursona-art/omariBorger.webp", artist: "Zulples" },
        { src: "/fursona-art/omariHotter.webp", artist: "DivineTofu" },
        { src: "/fursona-art/flirtotterbox.webp", artist: "tbcMart (Base by Skunkify)" },
        { src: "/fursona-art/inlove-11.webm", artist: "RawBootyMeat" },
        { src: "/fursona-art/gayJuice.webp", artist: "Kelouring (Base by Skunkify)" },
        { src: "/fursona-art/fingerheartSkylar.webp", artist: "KeyniTheSnep (Base by Skunkify)" },
        { src: "/fursona-art/omariBaka.webp", artist: "Whatify" },
        { src: "/fursona-art/hoodieblep.webp", artist: "KeyniTheSnep (Base by Skunkify)" },
        { src: "/fursona-art/otterbox.webp", artist: "KeyniTheSnep (Base by arcadec0re)" },
        { src: "/fursona-art/boxHug.webp", artist: "EggVortex" },
        { src: "/fursona-art/awtterOma.webp", artist: "Omari Allyn Tidemere" },
        { src: "/fursona-art/cute.webp", artist: "Unknown" },
        { src: "/fursona-art/omariBlep.webp", artist: "CoalColorHusky" },
        { src: "/fursona-art/swerveCuddle.webp", artist: "TsukiTheBunny" },
        { src: "/fursona-art/omariAnime.webp", artist: "DoggieMedia" },
        { src: "/fursona-art/otterfox.webp", artist: "SataOwO" },
        { src: "/fursona-art/omariCute.webp", artist: "Pocki Lori" },
        { src: "/fursona-art/149_-_Omari_Symm_Headshot_gift.webp", artist: "Siozend" },
        { src: "/fursona-art/IMG_3250.webp", artist: "Unknown" },
        { src: "/fursona-art/IMG_3251.webp", artist: "Unknown" },
        { src: "/fursona-art/IMG_3253.webp", artist: "Unknown" },
        { src: "/fursona-art/image.webp", artist: "Siozend" },
        { src: "/fursona-art/Omari-maw (4).webp", artist: "Grey" },
        { src: "/fursona-art/IMG_2010.webp", artist: "Paraslider" },
        { src: "/fursona-art/photo_2025-10-15_16-18-21.webp", artist: "Grey" },
        { src: "/fursona-art/omari_hello.webm", artist: "Unknown" },
        { src: "/fursona-art/omariBakaColoured.webp", artist: "Whatify" },
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
        "/vrchat-pics/VRChat_2026_016.webp",
        "/vrchat-pics/yass.webm",
        "/vrchat-pics/cutie_detected.webm",
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
    return galleryData.flatMap(section => {
      if (filter !== "all" && section.category !== filter) return [];

      return section.images.map(src => {
        // ART ONLY: enrich with metadata object
        if (section.category === "art") {
          if (typeof src === "string") {
            return {
              src,
              category: section.category,
              artist: section.artist || null
            };
          }

          return {
            src: src.src,
            category: section.category,
            artist: src.artist || section.artist || null
          };
        }

        // EVERYTHING ELSE: unchanged
        return {
          src: typeof src === 'string' ? src : src.src,
          category: section.category,
          artist: null
        };
      });
    });
  }

  async function setPool(newPoolRaw, { transition = false } = {}) {
    const pool = newPoolRaw.map(item => ({
      src: item.src,
      ratio: getRatio(item),
      type: getType(item.src),
      artist: item.artist ?? null
    }));

    if (transition) {
      gallery.style.opacity = "0";

      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
      showSkeletons(pool.length);
    }

    gallery.replaceChildren();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < newPoolRaw.length; i++) {
      const div = document.createElement("div");
      div.className = "gallery-item-wrapper";
      div.style.height = "200px"; // prevents layout shift

      fragment.appendChild(div);
    }

    gallery.appendChild(fragment);

    worker.postMessage({ type: "INIT", data: { pool } });
    requestLayout();

    const warmup = () => warmupMedia(pool);
    if ("requestIdleCallback" in window) {
      requestIdleCallback(warmup, { timeout: 2000 });
    } else {
      setTimeout(warmup, 200);
    }
  }

  /* ========================= WORKER ========================= */

  worker = new Worker(
    new URL("./layout-engine.worker.js", import.meta.url),
    { type: "module" }
  );

  worker.onmessage = (e) => {
    const { type } = e.data;

    if (type === "LAYOUT_ERROR") {
      console.error("[gallery worker]", e.data.message);
      return;
    }

    if (type !== "LAYOUT_RESULT") return;
    if (e.data.seq !== layoutSeq) return;

    layoutMap = e.data.layout;
    gallery.style.height = `${e.data.totalHeight}px`;

    render();

    requestAnimationFrame(() => {
      gallery.style.opacity = "1";
    });
  };

  worker.onerror = (err) => {
    console.error("[gallery worker error]", err.message);
  };

  function requestLayout() {
    const width = Math.floor(gallery.getBoundingClientRect().width);
    if (!width) return;
    const seq = ++layoutSeq;
    worker.postMessage({ type: "LAYOUT", data: { width }, seq });
  }

  /* ========================= RESIZE ========================= */

  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(requestLayout, 80);
  });

  resizeObserver.observe(gallery);

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

  // Video intersection observer — only responsible for pausing when off-screen.
  // Playing is driven by hover on desktop (see createItem), and by this observer
  // on touch devices where hover doesn't exist.
  videoObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;

      if (!entry.isIntersecting) {
        video.pause();
        continue;
      }

      if (!video.src) {
        video.src = video.dataset.src;
      }

      if (!window.matchMedia("(hover: hover)").matches) {
        video.play().catch(() => {});
      }
    }
  }, { threshold: 0.25 });

  window.addEventListener("lightbox:open", () => {});
  window.addEventListener("lightbox:close", () => {});

  /* ========================= PRELOAD ========================= */

  function warmupMedia(list) {
    for (const item of list.slice(0, 12)) {
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

  /* ========================= SKELETON ========================= */

  function showSkeletons(count) {
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

  /* ========================= ITEMS ========================= */

  function createItem(item, index) {
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

      // Hover-to-play on desktop: play on enter, pause on leave.
      // The video stays muted — sound only comes through the lightbox.
      // On touch devices the videoObserver handles playback instead.
      if (window.matchMedia("(hover: hover)").matches) {
        wrapper.addEventListener("mouseenter", () => video.play().catch(() => {}));
        wrapper.addEventListener("mouseleave", () => video.pause());
      }

      video.addEventListener("click", () =>
        openLightbox(item, currentSources(), index)
      );

      videoObserver.observe(video);
      wrapper.appendChild(video);
      return wrapper;
    }

    const img = document.createElement("img");


    img.dataset.src = src;
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";

    img.fetchPriority = index < 3 ? "high" : "low";

    img.width = 350;
    img.height = 350;

    img.onerror = () => {
      img.classList.add("load-error");
      img.removeAttribute("data-src");
      observer.unobserve(img);
    };

    observer.observe(img);
    img.addEventListener("click", () =>
      openLightbox(item, currentSources(), index)
    );

    wrapper.appendChild(img);
    return wrapper;
  }

  /* ========================= PLAYLIST ========================= */

  function currentSources() {
    return layoutMap.map(item => ({ src: item.src, artist: item.artist ?? null }));
  }

  /* ========================= RENDER ========================= */

  function render() {
    for (const el of gallery.querySelectorAll("img")) observer.unobserve(el);
    for (const el of gallery.querySelectorAll("video")) videoObserver.unobserve(el);

    gallery.replaceChildren();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < layoutMap.length; i++) {
      const item = layoutMap[i];
      const el = createItem(item, i);

      el.style.cssText = `
        position: absolute;
        transform: translate3d(${item.x}px, ${item.y}px, 0);
        width: ${item.w}px;
        height: ${item.h}px;
        overflow: hidden;
        will-change: transform;
        contain: layout paint;
        --item-index: ${Math.min(i, 16)};
      `;

      fragment.appendChild(el);
    }

    gallery.appendChild(fragment);
  }

  /* ========================= FILTERS ========================= */

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setPool(buildPool(btn.dataset.filter), { transition: true });
    });
  });

  /* ========================= CLEANUP ========================= */

  document.addEventListener("astro:before-swap", () => {
    worker?.terminate();
    resizeObserver?.disconnect();
    observer?.disconnect();
    videoObserver?.disconnect();
    clearTimeout(resizeTimer);

    worker = null;
    resizeObserver = null;
    observer = null;
    videoObserver = null;
    layoutMap = [];
    galleryMounted = false;
  }, { once: true });

  /* ========================= BOOT ========================= */

  requestAnimationFrame(() => {
    const initialPool = buildPool("all");
    showSkeletons(initialPool.length);
    setPool(initialPool);
  });
}

document.addEventListener("DOMContentLoaded", initGallery);
document.addEventListener("astro:page-load", initGallery);