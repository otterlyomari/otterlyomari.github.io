let galleryMounted = false;

export function initGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;

  if (galleryMounted) return;
  galleryMounted = true;

  let pool = [];
  let mode = "all";

  const elements = new Map();

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

  function buildPool(filter) {
    if (filter === "all") return galleryData.flatMap(s => s.images);
    return galleryData.find(s => s.category === filter)?.images || [];
  }

  /* =========================
     CREATE ITEM
  ========================= */
  function createItem(src) {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";

    const img = document.createElement("img");

    img.src = src;                // 🔥 INSTANT LOAD
    img.loading = "eager";        // optional hint
    img.decoding = "async";

    img.style.width = "100%";
    img.style.display = "block";
    img.style.opacity = "0";
    img.style.transition = "opacity 300ms ease";

    img.onload = () => {
      img.style.opacity = "1";
    };

    wrapper.appendChild(img);
    return { wrapper, img };
  }

  /* =========================
     RENDER ALL (NO LAZY)
  ========================= */
  function renderAll() {
    gallery.innerHTML = "";
    elements.clear();

    for (const src of pool) {
      const { wrapper, img } = createItem(src);

      gallery.appendChild(wrapper);
      elements.set(src, img);
    }
  }

  /* =========================
     FILTERS
  ========================= */
  function setFilter(filter) {
    mode = filter;
    pool = buildPool(mode);
    renderAll();
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      setFilter(btn.dataset.filter);

      window.scrollTo(0, 0);
    });
  });

  /* =========================
     INIT
  ========================= */
  pool = buildPool("all");
  renderAll();
}

/* =========================
   BOOT (ASTRO SAFE)
========================= */
function bootGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;

  if (window.__galleryMounted) return;
  window.__galleryMounted = true;

  initGallery();
}

document.addEventListener("DOMContentLoaded", bootGallery);
document.addEventListener("astro:page-load", bootGallery);
document.addEventListener("astro:after-swap", bootGallery);
window.addEventListener("load", bootGallery);