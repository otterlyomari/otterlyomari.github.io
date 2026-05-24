let galleryMounted = false;
let observer = null;

export function initGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;

  // prevent double init per page instance
  if (galleryMounted) return;
  galleryMounted = true;

  let pool = [];
  let mode = "all";

  const elements = new Map();

  /* =========================
     DATA SOURCES
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

  function buildPool(filter) {
    if (filter === "all") return galleryData.flatMap(s => s.images);
    return galleryData.find(s => s.category === filter)?.images || [];
  }

  function createObserver() {
    return new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const img = entry.target;
        observer.unobserve(img);

        const src = img.dataset.src;
        if (!src || img.dataset.loaded) return;

        img.dataset.loaded = "true";

        const real = new Image();
        real.src = src;

        real.onload = () => {
          img.src = src;
          img.style.opacity = "1";
        };
      }
    }, { rootMargin: "200px" });
  }

  observer = createObserver();

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

function renderAll() {
  gallery.innerHTML = "";
  elements.clear();

  const BATCH_SIZE = 8;
  let index = 0;

  function loadBatch() {
    const slice = pool.slice(index, index + BATCH_SIZE);

    for (const src of slice) {
      const { wrapper, img } = createItem(src);

      gallery.appendChild(wrapper);
      elements.set(src, img);

      observer.observe(img);
    }

    index += BATCH_SIZE;

    if (index < pool.length) {
      requestIdleCallback(loadBatch);
    }
  }

  loadBatch();
}

  function setFilter(filter) {
    mode = filter;
    pool = buildPool(mode);
    renderAll();
  }

  // IMPORTANT: remove old listeners by cloning buttons
  buttons.forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.replaceWith(clone);
  });

  const freshButtons = document.querySelectorAll(".filter-btn");

  freshButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      freshButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      setFilter(btn.dataset.filter);

      window.scrollTo(0, 0);
    });
  });

  pool = buildPool("all");
  renderAll();
}


function bootGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;

  // CRITICAL: reset mount flag on Astro navigation
  if (window.__galleryRoot !== gallery) {
    window.__galleryRoot = gallery;
    galleryMounted = false;
  }

  initGallery();
}

/* Astro + normal lifecycle coverage */
document.addEventListener("DOMContentLoaded", bootGallery);
document.addEventListener("astro:page-load", bootGallery);
document.addEventListener("astro:after-swap", bootGallery);
window.addEventListener("load", bootGallery);