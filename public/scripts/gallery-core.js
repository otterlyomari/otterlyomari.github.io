const gallery = document.getElementById("gallery");
const buttons = document.querySelectorAll(".filter-btn");

let pool = [];
let mode = "all";
let renderToken = 0;

const WINDOW_SIZE = 10;
const BUFFER = 10;

/* =========================
   DATA (UNCHANGED)
========================= */
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
      "/fursona-art/omariAnime.bmp",
      "/fursona-art/otterfox.png",
      "/fursona-art/omariCute.bmp",
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

/* =========================
   POOL
========================= */
function buildPool(filter) {
  if (filter === "all") return galleryData.flatMap(s => s.images);
  return galleryData.find(s => s.category === filter)?.images || [];
}

/* =========================
   STATE
========================= */
const elements = new Map();
const sizeCache = new Map();

/* =========================
   GLOBAL OBSERVER (FIXED)
========================= */
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const img = entry.target;
    observer.unobserve(img);

    loadImage(img, img.dataset.src);
  }
}, {
  rootMargin: "800px"
});

/* =========================
   CREATE ITEM
========================= */
function createItem(src) {
  const wrapper = document.createElement("div");
  wrapper.className = "gallery-item-wrapper";

  const img = document.createElement("img");

  img.dataset.src = src;
  img.loading = "lazy";
  img.decoding = "async";

  img.style.width = "100%";
  img.style.height = "auto";
  img.style.display = "block";
  img.style.opacity = "0";
  img.style.transition = "opacity 300ms ease";

  wrapper.appendChild(img);

  return { wrapper, img };
}

/* =========================
   ASPECT RATIO
========================= */
function applyAspectRatio(img, src) {
  const size = sizeCache.get(src);

  if (size) {
    img.style.aspectRatio = `${size.w} / ${size.h}`;
  } else {
    img.style.aspectRatio = "4 / 3";
  }
}

/* =========================
   LOAD IMAGE (CLEAN + SAFE)
========================= */
function loadImage(img, src) {
  const token = renderToken;

  if (img.dataset.loaded) return;
  img.dataset.loaded = "true";

  const placeholder =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
        <rect width="100%" height="100%" fill="rgba(255,255,255,0.05)"/>
      </svg>
    `);

  img.src = placeholder;

  const realImg = new Image();
  realImg.src = src;

  realImg.onload = () => {
    if (token !== renderToken) return;

    sizeCache.set(src, {
      w: realImg.naturalWidth,
      h: realImg.naturalHeight
    });

    applyAspectRatio(img, src);
    img.src = src;

    requestAnimationFrame(() => {
      if (token === renderToken) {
        img.style.opacity = "1";
      }
    });
  };
}

/* =========================
   FULL MODE
========================= */
function renderAll() {
  const token = renderToken;

  for (const src of pool) {
    if (token !== renderToken) return;
    if (elements.has(src)) continue;

    const { wrapper, img } = createItem(src);

    applyAspectRatio(img, src);

    gallery.appendChild(wrapper);
    elements.set(src, img);

    observer.observe(img);
  }
}

/* =========================
   WINDOW MODE
========================= */
function renderWindow() {
  const token = renderToken;

  const approxItemHeight = 240;
  const start = Math.max(0, Math.floor(window.scrollY / approxItemHeight));
  const end = Math.min(pool.length, start + WINDOW_SIZE + BUFFER * 2);

  const active = new Set();

  for (let i = start; i < end; i++) {
    if (token !== renderToken) return;

    const src = pool[i];
    active.add(src);

    let img = elements.get(src);

    if (!img) {
      const { wrapper, img: newImg } = createItem(src);

      applyAspectRatio(newImg, src);

      gallery.appendChild(wrapper);
      elements.set(src, newImg);

      observer.observe(newImg);
      img = newImg;
    }

    requestAnimationFrame(() => {
      if (token === renderToken) {
        img.style.opacity = "1";
      }
    });
  }

  for (const [src, img] of elements) {
    if (!active.has(src)) {
      img.style.opacity = "0";

      const t = renderToken;

      setTimeout(() => {
        if (t !== renderToken) return;
        if (!active.has(src)) {
          img.parentElement?.remove();
          elements.delete(src);
        }
      }, 300);
    }
  }
}

/* =========================
   RESET
========================= */
function resetGallery() {
  renderToken++;

  for (const el of elements.values()) {
    el.parentElement?.remove();
  }

  elements.clear();
}

/* =========================
   MASTER RENDER
========================= */
function render() {
  if (mode === "all") renderAll();
  else renderWindow();
}

/* =========================
   SCROLL
========================= */
let ticking = false;

window.addEventListener("scroll", () => {
  if (ticking) return;

  ticking = true;

  requestAnimationFrame(() => {
    render();
    ticking = false;
  });
});

/* =========================
   FILTERS
========================= */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    mode = btn.dataset.filter;
    pool = buildPool(mode);

    resetGallery();

    window.scrollTo(0, 0);

    requestAnimationFrame(() => render());
  });
});

/* =========================
   INIT
========================= */
pool = buildPool("all");
render();