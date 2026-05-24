let galleryMounted = false;

export function initGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;
  if (galleryMounted) return;
  galleryMounted = true;

  /* =========================
     DATA
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
     STATE
  ========================= */
  let pool = [];
  let mode = "all";

  const elements = new Map();

  const ITEM_HEIGHT = 260;
  const BUFFER = 8;

  /* =========================
     POOL
  ========================= */
  function buildPool(filter) {
    if (filter === "all") return galleryData.flatMap(s => s.images);
    return galleryData.find(s => s.category === filter)?.images || [];
  }

  /* =========================
     PLACEHOLDER (FAST LOAD)
  ========================= */
  function createPlaceholder() {
    const div = document.createElement("div");
    div.className = "gallery-item-wrapper";

    div.innerHTML = `
      <div class="skeleton"></div>
    `;

    return div;
  }

  /* =========================
     IMAGE LOAD (PROGRESSIVE)
  ========================= */
  function loadImage(img, src) {
    if (img.dataset.loaded) return;
    img.dataset.loaded = "true";

    const real = new Image();
    real.src = src;

    real.onload = () => {
      img.src = src;
      img.classList.add("loaded");
    };
  }

  /* =========================
     RENDER VISIBLE ONLY
  ========================= */
  function render() {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
    const end = Math.min(pool.length, Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER);

    const active = new Set();

    for (let i = start; i < end; i++) {
      const src = pool[i];
      active.add(src);

      let el = elements.get(src);

      if (!el) {
        el = createPlaceholder();

        const img = document.createElement("img");
        img.dataset.src = src;
        img.loading = "lazy";
        img.decoding = "async";

        el.appendChild(img);
        gallery.appendChild(el);

        elements.set(src, img);

        loadImage(img, src);
      }
    }

    // remove out-of-view items
    for (const [src, img] of elements) {
      if (!active.has(src)) {
        img.parentElement?.remove();
        elements.delete(src);
      }
    }
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
     FILTERS (INSTANT SWITCH)
  ========================= */
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      mode = btn.dataset.filter;
      pool = buildPool(mode);

      elements.forEach(el => el.parentElement?.remove());
      elements.clear();

      window.scrollTo(0, 0);
      render();
    });
  });

  /* =========================
     INIT
  ========================= */
  pool = buildPool("all");
  render();
}