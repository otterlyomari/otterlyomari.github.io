/**
 * gallery-lightbox.js
 *
 * Handles lightbox lifecycle, prev/next navigation, and gesture handling
 * (pan, pinch-zoom, double-tap, swipe-to-navigate, wheel zoom).
 *
 * Gestures are DISABLED for video media — videos use click-to-play
 * and keyboard shortcuts instead. Images retain full gesture support.
 *
 * Keyboard shortcuts (video only):
 *   Space / K  — play / pause
 *   J          — seek −1 frame (~1/30s)
 *   L          — seek +1 frame (~1/30s)
 *   F          — toggle fullscreen
 *   ArrowLeft  — previous item
 *   ArrowRight — next item
 *   Escape     — close
 */

import { buildVideoControls } from "./gallery-video-controls.js";
import { attachGesture } from "./gesture-engine.js";

let lightbox, playerContainer, playerWrap, media, prevBtn, nextBtn;
let isOpen = false;

let bgTarget = 0.85;
let bgCurrent = 0.85;
let gestureActive = false;

/* ========================= MEDIA STATE ========================= */

let isVideoMedia = false; // true when current lightbox item is a video
let currentVideo = null;  // reference to the active <video> element

/* ========================= PLAYLIST ========================= */

let playlist     = [];
let currentIndex = 0;
let thumbnailStrip; 

/* ========================= TRANSFORM STATE ========================= */

let tx = 0, ty = 0, tScale = 1;
let sx = 0, sy = 0, sScale = 1;

let swipeStartX = 0;
let swipeStartY = 0;
let swipeStartTime = 0;

/* ========================= CONFIG ========================= */

const MIN_SCALE       = 1;
const MAX_SCALE       = 5;
const FRAME_DURATION  = 1 / 30; // seconds — used for J/L frame scrubbing

/* ========================= INIT ========================= */

export function initLightbox() {
  lightbox   = document.getElementById("lightbox");
  playerContainer = document.querySelector(".player-container");
  playerWrap = document.querySelector(".player-wrap");
  media      = document.getElementById("lightbox-media");
  thumbnailStrip = document.getElementById("lightbox-thumbnails");
  prevBtn    = document.getElementById("lightbox-prev");
  nextBtn    = document.getElementById("lightbox-next");
  const closeBtn = document.getElementById("lightbox-close");

  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", showPrev);
  nextBtn?.addEventListener("click", showNext);
  document.addEventListener("keydown", onKeyDown);

  if (!lightbox || !media || !playerWrap || !playerContainer) {
    console.error("Lightbox missing required DOM elements", {
      lightbox,
      media,
      playerWrap,
      playerContainer
    });
    return;
  }

  attachGesture(playerWrap, {
    onSwipe: handleSwipe,
    onVertical: handleVertical,
    onPan: handleDrag,

    onPinch: handlePinch,
    onWheel: handleWheel,
    onDoubleTap: handleDoubleTap,

    onEnd: onGestureEnd
  });

  requestAnimationFrame(loop);
}

/* ======================== GESTURE HANDLERS ================= */
let gestureType = "none";

function handleSwipe({ direction, velocity }) {
  if (!isOpen) return;

  // left = next, right = prev
  if (velocity > 0.4) {
    direction === "left" ? showPrev() : showNext();
    return;
  }

  direction === "left" ? showPrev() : showNext();
}

function handleVertical({ velocity, dy }) {
  if (!isOpen) return;

  if (velocity > 0.3 && Math.abs(dy) > 120) {
    closeLightbox();
  }
}

function handleDrag({ ddx, ddy, event }) {
  if (!isOpen || isVideoMedia) return;

  gestureActive = true;

  tx += ddx;
  ty += ddy;

  if (event?.pointerType !== "mouse") {
    const progress = Math.abs(ty) / 300;
    bgTarget = 0.85 - Math.min(progress, 0.4);
  }
}

function handlePinch({ scale }) {
  if (!isOpen || isVideoMedia) return;

  tScale = clamp(tScale * scale);
}

function handleWheel({ deltaY, x, y }) {
  if (!isOpen || isVideoMedia) return;

  const el = media.firstElementChild;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  const cx = x - (rect.left + rect.width / 2);
  const cy = y - (rect.top + rect.height / 2);

  const prev = tScale;
  const next = clamp(prev - deltaY * 0.002);
  const ratio = next / prev;

  tx = cx - (cx - tx) * ratio;
  ty = cy - (cy - ty) * ratio;
  tScale = next;
}

function handleDoubleTap({ x, y }) {
  if (!isOpen || isVideoMedia) return;

  zoomAtPoint(x, y);
}

function onGestureEnd() {
  gestureActive = false;

  const movedEnough = Math.hypot(dx, dy) > 25;

  if (!movedEnough) {
    snapBack();
    return;
  }

  if (tScale > 1.05) {
    snapBack();
    return;
  }

  const isHorizontal =
    Math.abs(dx) > 60 &&
    Math.abs(dx) > Math.abs(dy) * 1.5;

  if (isHorizontal) {
    dx > 0 ? showPrev() : showNext();
    snapBack();
    return;
  }

  const isVertical =
    Math.abs(dy) > 120 &&
    Math.abs(dy) > Math.abs(dx) * 1.5;

  const velocity = Math.abs(dy) / Math.max(performance.now() - swipeStartTime, 1);

  if (isVertical && velocity > 0.3) {
    closeLightbox();
    return;
  }

  snapBack();

  console.log("This works!")
}

/* ========================= KEYBOARD ========================= */

function onKeyDown(e) {
  if (!isOpen) return;

  const isArrow = e.key === "ArrowLeft" || e.key === "ArrowRight";

  if (isArrow) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (e.key === "Escape") { closeLightbox(); return; }

  if (e.key === "ArrowLeft") { showPrev(); return; }
  if (e.key === "ArrowRight") { showNext(); return; }

  if (!isVideoMedia || !currentVideo) return;

  switch (e.key) {
    case " ":
    case "k":
    case "K":
      e.preventDefault();
      currentVideo.paused
        ? currentVideo.play().catch(() => {})
        : currentVideo.pause();
      break;

    case "j":
    case "J":
      e.preventDefault();
      currentVideo.pause();
      currentVideo.currentTime = Math.max(0, currentVideo.currentTime - FRAME_DURATION);
      break;

    case "l":
    case "L":
      e.preventDefault();
      currentVideo.pause();
      currentVideo.currentTime = Math.min(
        currentVideo.duration || 0,
        currentVideo.currentTime + FRAME_DURATION
      );
      break;

    case "f":
    case "F":
      e.preventDefault();
      toggleFullscreen();
      break;
  }
}

/* ========================= FULLSCREEN ========================= */

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    (playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen)
      ?.call(playerWrap)
      .catch(() => {});
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }
}

/* ========================= OPEN / CLOSE ========================= */

export function openLightbox(src, list = null, index = 0) {
  isOpen   = true;
  playlist = Array.isArray(list) && list.length ? list : [src];

  window.__lightboxActive = true;

  currentIndex = index >= 0 && index < playlist.length
    ? index
    : Math.max(0, playlist.indexOf(src));

  const scrollY = window.scrollY;
  lightbox.classList.remove("hidden");
  window.dispatchEvent(new CustomEvent("lightbox:open"));
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${scrollY}px`;

  reset();
  setMedia(playlist[currentIndex]);
  updateNavButtons();
  renderThumbnails();
}

export function closeLightbox() {
  // Pause and clean up any playing video
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.src = "";  // Clear src to stop loading/decoding
    currentVideo.load();    // Force reset
    currentVideo = null;
  }
  
  isOpen       = false;
  isVideoMedia = false;

  window.__lightboxActive = false;

  lightbox.classList.add("hidden");
  window.dispatchEvent(new CustomEvent("lightbox:close"));
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";

  document.removeEventListener("keydown", onKeyDown);
  
  // Remove controls and overlay
  playerContainer.querySelector(".video-controls")?.remove();
  playerWrap.querySelector(".vc-click-overlay")?.remove();
  
  // Clear media container completely
  if (media) {
    media.innerHTML = "";  // This removes the video element entirely
  }
  
  reset();
}

/* ========================= NAVIGATION ========================= */

function showPrev() {
  if (currentIndex <= 0) return;
  switchTo(currentIndex - 1);
}

function showNext() {
  if (currentIndex >= playlist.length - 1) return;
  switchTo(currentIndex + 1);
}

function updateNavButtons() {
  const multiple = playlist.length > 1;
  if (prevBtn) prevBtn.style.display = multiple && currentIndex > 0 ? "" : "none";
  if (nextBtn) nextBtn.style.display = multiple && currentIndex < playlist.length - 1 ? "" : "none";
}

/* ========================= MEDIA ========================= */

function setMedia(item) {
  const src = typeof item === 'string' ? item : item.src;
  const artist = item?.artist ?? null;

  // Clean up previous video
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.src = "";
    currentVideo.load();
    currentVideo = null;
  }

  media.innerHTML = "";
  playerContainer.querySelector(".video-controls")?.remove();
  playerWrap.querySelector(".vc-click-overlay")?.remove();
  lightbox.querySelector(".lightbox-count")?.remove();
  lightbox.querySelector(".lightbox-credit")?.remove();

  // Count display
  if (playlist.length > 1) {
    const count = document.createElement("div");
    count.className = "lightbox-count";
    count.textContent = `${currentIndex + 1} out of ${playlist.length}`;
    lightbox.insertBefore(count, lightbox.firstChild);
  }

  const isVideo = src.endsWith(".webm") || src.endsWith(".mp4");
  isVideoMedia = isVideo;
  currentVideo = null;

  if (thumbnailStrip) {
    thumbnailStrip.style.display = isVideo ? "none" : "";
  }

  if (isVideo) {
    const video = document.createElement("video");
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.draggable = false;

    // Apply video-specific size constraints
    video.style.cssText = `
      max-width: 560px;
      max-height: 420px;
      width: auto;
      height: auto;
      object-fit: contain;
      transform-origin: center;
      cursor: default;
      display: block;
      margin: 0 auto;
    `;

    // Preserve pitch when playback rate changes
    video.preservesPitch = true;
    video.mozPreservesPitch = true;

    media.appendChild(video);
    currentVideo = video;

    video.addEventListener('loadedmetadata', () => {
      const hasAudio = video.mozHasAudio || 
                      video.webkitAudioDecodedByteCount !== undefined ||
                      (video.audioTracks && video.audioTracks.length > 0);
      
      if (hasAudio && window.__lightboxActive) {
        video.muted = false;
      }
    });

    const { bar, overlay } = buildVideoControls(video, playerWrap);
    playerWrap.appendChild(overlay);
    playerContainer.appendChild(bar);

    video.play().catch(() => {});
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.draggable = false;

    // Images can use larger constraints
    img.style.cssText = `
      max-width: min(90vw, 1200px);
      max-height: 80vh;
      object-fit: contain;
      transform-origin: center;
      cursor: grab;
      display: block;
    `;

    img.style.opacity = "0";
    img.style.transition = "opacity 0.2s ease";
    img.style.pointerEvents = "none";
    img.onload = () => { img.style.opacity = "1"; };

    playerWrap.classList.toggle('is-image', !isVideo);
    media.appendChild(img);
  }

  if (artist) {
    const credit = document.createElement("div");
    credit.className = "lightbox-credit";
    credit.textContent = `Art by ${artist}`;
    lightbox.appendChild(credit);
  }

  preloadAdjacent();
}

function renderThumbnails() {
  if (!thumbnailStrip) return;

  thumbnailStrip.innerHTML = "";

  playlist.forEach((item, index) => {
    const src = typeof item === "string" ? item : item.src;

    const thumb = document.createElement("img");

    thumb.src = item.thumb ?? src;
    thumb.className = "lightbox-thumb";
    thumb.loading = "lazy"
    thumb.decoding = "async"
    thumb.setAttribute("aria-current", index === currentIndex);

    if (index === currentIndex) {
      thumb.classList.add("active");
    }

   thumb.addEventListener("click", () => {
    if (index === currentIndex) return;
    switchTo(index);
   });

    thumbnailStrip.appendChild(thumb);
  });
}

function updateThumbnailSelection() {
  const thumbs =
    thumbnailStrip?.querySelectorAll(".lightbox-thumb");

  if (!thumbs) return;

  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle("active", i === currentIndex);
  });

  const isMobile = matchMedia("(pointer: coarse)").matches;

  thumbs[currentIndex]?.scrollIntoView({
    behavior: isMobile ? "auto" : "smooth",
    inline: "center",
    block: "nearest"
  });
}

function updateUIVisibility() {
  const shouldHide =
    !isVideoMedia &&
    (
      tScale > 1.05 ||
      Math.abs(tx) > 20 ||
      Math.abs(ty) > 20
    );

  lightbox.classList.toggle("ui-hidden", shouldHide);
}

/* ========================= RESET ========================= */

function reset() {
  tx = ty = sx = sy = 0;
  tScale = sScale = 1;
}

/* ========================= RENDER LOOP ========================= */

let lastTransform = "";

function apply() {
  const el = media.firstElementChild;
  if (!el) return;

  const alpha = 0.18;
  sx     += (tx     - sx)     * alpha;
  sy     += (ty     - sy)     * alpha;
  sScale += (tScale - sScale) * alpha;

  const transform = `translate(${sx}px, ${sy}px) scale(${sScale})`;

  if (transform !== lastTransform) {
    el.style.transform = transform;
    lastTransform = transform;
  }

  updateUIVisibility();
}

function loop() {
  if (isOpen) {
    updateBg();

    if (!gestureActive && tScale <= 1.02) {
      tx += (0 - tx) * 0.15;
      ty += (0 - ty) * 0.15;

      if (Math.abs(tx) < 0.5) tx = 0;
      if (Math.abs(ty) < 0.5) ty = 0;
    }
  apply();
  }
  requestAnimationFrame(loop);
}

let bgLock;

function updateBg() {
  bgCurrent += (bgTarget - bgCurrent) * 0.18;
  lightbox.style.backgroundColor =
    `rgba(0,0,0,${bgCurrent})`;
}

/* ========================= ZOOM (images only) ========================= */

function zoomAtPoint(clientX, clientY) {
  if (isVideoMedia) return;

  const el = media.firstElementChild;
  if (!el) return;

  const rect  = el.getBoundingClientRect();
  const cx    = clientX - (rect.left + rect.width  / 2);
  const cy    = clientY - (rect.top  + rect.height / 2);
  const next  = tScale > 1 ? 1 : 2.5;
  const ratio = next / tScale;

  tx     = cx - (cx - tx) * ratio;
  ty     = cy - (cy - ty) * ratio;
  tScale = next;
}

/* ========================= UTILS ========================= */

const preloadCache = new Set();

function preload(item) {
  if (!item) return;

  const src = typeof item === "string" ? item : item.src;
  if (!src || preloadCache.has(src)) return;
  if (src.endsWith(".mp4") || src.endsWith(".webm")) return;

  const img = new Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = src;

  preloadCache.add(src);
}

function preloadAdjacent() {
  preload(playlist[currentIndex - 2]);
  preload(playlist[currentIndex - 1]);
  preload(playlist[currentIndex + 1]);
  preload(playlist[currentIndex + 2]);
}

function switchTo(index) {
  currentIndex = index;

  reset();

  lightbox.classList.add("switching");

  setTimeout(() => {
    setMedia(playlist[currentIndex]);
    updateNavButtons();
    updateThumbnailSelection();

    requestAnimationFrame(() => {
      lightbox.classList.remove("switching");
    });
  }, 100);
}

function snapBack() {
  console.log("This is working!")
  tx = 0;
  ty = 0;
  tScale = Math.max(1, tScale);

  bgTarget = 0.85;
  lightbox.classList.remove("ui-hidden");
}

function clamp(v) {
  return Math.min(Math.max(v, MIN_SCALE), MAX_SCALE);
}