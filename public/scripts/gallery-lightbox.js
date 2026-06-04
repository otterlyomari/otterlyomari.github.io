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

let lightbox, playerContainer, playerWrap, media, prevBtn, nextBtn;
let isOpen = false;

/* ========================= MEDIA STATE ========================= */

let isVideoMedia = false; // true when current lightbox item is a video
let currentVideo = null;  // reference to the active <video> element

/* ========================= PLAYLIST ========================= */

let playlist     = [];
let currentIndex = 0;

/* ========================= TRANSFORM STATE ========================= */

let tx = 0, ty = 0, tScale = 1;
let sx = 0, sy = 0, sScale = 1;

let dragging = false;
let lastX = 0, lastY = 0;

const pointers          = new Map();
let lastPinchDistance = null;

let lastTapTime = 0;
let lastTapX    = 0, lastTapY = 0;

let swipeStartX = 0, swipeStartY = 0;
let swipeStartTime = 0;

/* ========================= CONFIG ========================= */

const MIN_SCALE       = 1;
const MAX_SCALE       = 5;
const SWIPE_THRESHOLD = 60;
const FRAME_DURATION  = 1 / 30; // seconds — used for J/L frame scrubbing

/* ========================= INIT ========================= */

export function initLightbox() {
  lightbox   = document.getElementById("lightbox");
  playerContainer = document.querySelector(".player-container");
  playerWrap = document.querySelector(".player-wrap");
  media      = document.getElementById("lightbox-media");
  prevBtn    = document.getElementById("lightbox-prev");
  nextBtn    = document.getElementById("lightbox-next");

  if (!lightbox || !media || !playerWrap || !playerContainer) return;

  // Close on backdrop click (player-wrap clicks don't bubble to lightbox)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", onKeyDown);

  prevBtn?.addEventListener("click", showPrev);
  nextBtn?.addEventListener("click", showNext);

  // Gesture listeners — all handlers check isVideoMedia and bail for video
  media.addEventListener("pointerdown", startPointer, { passive: false });
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);

  media.addEventListener("wheel", onWheel, { passive: false });
  media.addEventListener("dblclick", onDoubleClick);

  // Mobile swipe-to-navigate for video.
  // Images use the existing pointer handler; video bails early from that path
  // so we handle touch separately here using passive touch events.
  let touchStartX = 0, touchStartY = 0;

  lightbox.addEventListener("touchstart", (e) => {
    if (!isOpen || !isVideoMedia) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (!isOpen || !isVideoMedia) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? showNext() : showPrev();
    }
  }, { passive: true });

  requestAnimationFrame(loop);
}

/* ========================= KEYBOARD ========================= */

function onKeyDown(e) {
  if (!isOpen) return;

  // Global shortcuts (work for both image and video)
  if (e.key === "Escape")      { closeLightbox(); return; }
  if (e.key === "ArrowLeft")   { showPrev(); return; }
  if (e.key === "ArrowRight")  { showNext(); return; }

  // Video-only shortcuts
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
    case "esc":
    case "Escape":
      if (document.fullscreenElement) {
        e.preventDefault();
        closeLightbox();
      }
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

  lightbox.classList.remove("hidden");
  window.dispatchEvent(new CustomEvent("lightbox:open"));
  document.body.style.overflow = "hidden";

  reset();
  setMedia(playlist[currentIndex]);
  updateNavButtons();
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
  currentIndex--;
  reset();
  setMedia(playlist[currentIndex]);
  updateNavButtons();
}

function showNext() {
  if (currentIndex >= playlist.length - 1) return;
  currentIndex++;
  reset();
  setMedia(playlist[currentIndex]);
  updateNavButtons();
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
}

/* ========================= RESET ========================= */

function reset() {
  tx = ty = sx = sy = 0;
  tScale = sScale = 1;
  dragging = false;
  pointers.clear();
  lastPinchDistance = null;
}

/* ========================= RENDER LOOP ========================= */

function apply() {
  const el = media.firstElementChild;
  if (!el) return;

  const alpha = 0.18;
  sx     += (tx     - sx)     * alpha;
  sy     += (ty     - sy)     * alpha;
  sScale += (tScale - sScale) * alpha;

  el.style.transform = `translate(${sx}px, ${sy}px) scale(${sScale})`;
}

function loop() {
  if (isOpen) {
    if (!dragging && tScale <= 1.02) {
      tx *= 0.85;
      ty *= 0.85;
      if (Math.abs(tx) < 0.5) tx = 0;
      if (Math.abs(ty) < 0.5) ty = 0;
    }
    apply();
  }
  requestAnimationFrame(loop);
}

/* ========================= POINTER EVENTS (images only) ========================= */

function startPointer(e) {

  if (!isOpen || isVideoMedia) return; // videos use click overlay instead
  e.preventDefault();

  const now = performance.now();

  if (pointers.size === 0) {
    const dt = now - lastTapTime;
    if (dt < 300) {
      zoomAtPoint(lastTapX, lastTapY);
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
    lastTapX    = e.clientX;
    lastTapY    = e.clientY;
  }

  media.setPointerCapture?.(e.pointerId);
  pointers.set(e.pointerId, e);

  if (pointers.size === 1) {
    dragging    = true;
    lastX       = e.clientX;
    lastY       = e.clientY;
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
    swipeStartTime = performance.now();
  }
}

function onPointerMove(e) {
  if (!isOpen || isVideoMedia || !pointers.has(e.pointerId)) return;
  e.preventDefault();

  pointers.set(e.pointerId, e);

  if (pointers.size === 2) {
    const [p1, p2] = [...pointers.values()];
    const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);

    if (lastPinchDistance != null) {
      tScale = clamp(tScale + (dist - lastPinchDistance) * 0.01);
    }

    lastPinchDistance = dist;
    dragging = false;
    return;
  }

  lastPinchDistance = null;

  if (dragging && pointers.size === 1) {
    tx += e.clientX - lastX;
    ty += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    // Only fade background on touch (Not meant for mouse dragging, which is more likely to be precise and intentional. Touch dragging can be less precise and may indicate an intent to swipe away.)
    if (e.pointerType !== 'mouse') {
      const progress = Math.abs(ty) / 300;
      lightbox.style.backgroundColor = `rgba(0,0,0,${Math.max(0, 0.85 - progress)})`;
    }
  }
}

function endPointer(e) {
  if (isVideoMedia) return;
  if (e.pointerType === 'mouse') {
    // skip swipe-to-dismiss logic for mouse, still handle pointer cleanup
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinchDistance = null;
    if (pointers.size === 0) dragging = false;
    return;
  }

  const wasOneFinger = pointers.size === 1;
  pointers.delete(e.pointerId);

  if (pointers.size < 2) lastPinchDistance = null;

  if (wasOneFinger && pointers.size === 0 && tScale <= 1.05) {
    const dx = e.clientX - swipeStartX;
    const dy = e.clientY - swipeStartY;

    /* Swipe to navigate if the swipe is primarily horizontal and exceeds the threshold. */
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? showNext() : showPrev();
    }

    /* Swipe to close if the swipe is primarily vertical and exceeds the threshold. */
    if (Math.abs(dy) > 120 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      const elapsed = performance.now() - swipeStartTime;
      const velocity = Math.abs(dy) / elapsed; // px/ms

      if (velocity > 0.3) {
        closeLightbox();
      } else {
        // too slow — snap back
        ty = 0;
        lightbox.style.backgroundColor = '';
      }
    }
  }

  if (pointers.size === 0)  {
    dragging = false; 
    lightbox.style.backgroundColor = ''; // let CSS take over again
  }
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

function onWheel(e) {
  if (!isOpen || isVideoMedia) return;
  e.preventDefault();

  const el = media.firstElementChild;
  if (!el) return;

  const rect  = el.getBoundingClientRect();
  const cx    = e.clientX - (rect.left + rect.width  / 2);
  const cy    = e.clientY - (rect.top  + rect.height / 2);
  const prev  = tScale;
  const next  = clamp(prev - e.deltaY * 0.002);
  const ratio = next / prev;

  tx     = cx - (cx - tx) * ratio;
  ty     = cy - (cy - ty) * ratio;
  tScale = next;
}

function onDoubleClick(e) {
  if (isVideoMedia) return;
  zoomAtPoint(e.clientX, e.clientY);
}

/* ========================= UTILS ========================= */

function clamp(v) {
  return Math.min(Math.max(v, MIN_SCALE), MAX_SCALE);
}