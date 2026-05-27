let galleryMounted = false;
let observer = null;

export function initGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;
  if (galleryMounted) return;
  galleryMounted = true;

  let pool = [];
  let mode = "all";

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

   function buildPool(filter) {
    if (filter === "all") return galleryData.flatMap(s => s.images);
    return galleryData.find(s => s.category === filter)?.images || [];
  }

  /* -----------------------------
     SHARED OBSERVER (important fix)
  ----------------------------- */
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const img = entry.target;
        observer.unobserve(img);

        const src = img.dataset.src;
        if (!src) return;

        img.src = src;

        img.decode?.()
          .catch(() => {})
          .then(() => {
            img.classList.add("loaded");
          });
      }
    }, {
      rootMargin: "250px"
    });
  }

  /* -----------------------------
     FAST DOM CREATION
  ----------------------------- */
  function createItem(src) {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";

    const img = document.createElement("img");
    img.dataset.src = src;
    img.loading = "lazy";
    img.decoding = "async";

    wrapper.appendChild(img);

    // single handler shared via function reference reuse
    img.addEventListener("click", toggleFullscreen, { passive: true });

    return { wrapper, img };
  }

  async function toggleFullscreen(e) {
    const el = e.currentTarget;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    el.requestFullscreen?.();
  }

  /* -----------------------------
     MORE EFFICIENT RENDERING
  ----------------------------- */
  function renderAll() {
    gallery.replaceChildren(); // faster than innerHTML = ""

    const BATCH = 20;
    let i = 0;

    function batch() {
      const fragment = document.createDocumentFragment();
      const slice = pool.slice(i, i + BATCH);

      for (const src of slice) {
        const { wrapper, img } = createItem(src);
        fragment.appendChild(wrapper);
        observer.observe(img);
      }

      gallery.appendChild(fragment);

      i += BATCH;

      if (i < pool.length) {
        setTimeout(batch, 0); // better yielding than idle callback here
      }
    }

    batch();
  }

  function setFilter(filter) {
    mode = filter;
    pool = buildPool(mode);
    renderAll();
  }

  /* -----------------------------
     BUTTONS (no cloning needed)
  ----------------------------- */
  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setFilter(btn.dataset.filter);
    };
  });

  pool = buildPool("all");
  renderAll();
}

/* boot */
function bootGallery() {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll(".filter-btn");

  if (!gallery || !buttons.length) return;

  if (window.__galleryRoot !== gallery) {
    window.__galleryRoot = gallery;
    galleryMounted = false;
  }

  initGallery();
}

document.addEventListener("DOMContentLoaded", bootGallery);
document.addEventListener("astro:page-load", bootGallery);