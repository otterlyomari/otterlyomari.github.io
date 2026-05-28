let lightbox, media;
let isOpen = false;

/* ========================= STATE ========================= */

let x = 0, y = 0;
let scale = 1;

let dragging = false;
let lastX = 0;
let lastY = 0;

/* Touch / gesture state */
let pointers = new Map();
let lastPinchDistance = null;

/* Double tap state */
let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;

/* Smoothed targets + rendered values */
let sx = 0, sy = 0;
let tx = 0, ty = 0;

let sScale = 1;
let tScale = 1;

/* ========================= CONFIG ========================= */

const MIN_SCALE = 1;
const MAX_SCALE = 5;

/* ========================= INIT ========================= */

export function initLightbox() {
  lightbox = document.getElementById("lightbox");
  media = document.getElementById("lightbox-media");

  if (!lightbox || !media) return;

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* Pointer (mobile + modern input) */
  media.addEventListener("pointerdown", startPointer, { passive: false });
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);

  /* Mouse fallback (preserved) */
  media.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", endDrag);

  media.addEventListener("wheel", onWheel, { passive: false });
  media.addEventListener("dblclick", onDoubleClick);

  requestAnimationFrame(loop);
}

/* ========================= OPEN ========================= */

export function openLightbox(src) {
  isOpen = true;

  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  reset();
  setMedia(src);
}

/* ========================= CLOSE ========================= */

export function closeLightbox() {
  isOpen = false;

  lightbox.classList.add("hidden");
  document.body.style.overflow = "";

  reset();
}

/* ========================= MEDIA ========================= */

function setMedia(src) {
  media.innerHTML = "";

  const el = src.endsWith(".webm") || src.endsWith(".mp4")
    ? document.createElement("video")
    : document.createElement("img");

  el.src = src;

  if (el.tagName === "VIDEO") {
    el.autoplay = true;
    el.loop = true;
    el.muted = true;
    el.controls = true;
    el.playsInline = true;
  }

  el.style.position = "absolute";
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.transformOrigin = "center";
  el.style.cursor = "grab";
  el.draggable = false;

  media.appendChild(el);
}

/* ========================= RESET ========================= */

function reset() {
  x = y = 0;
  scale = 1;

  sx = sy = 0;
  tx = ty = 0;

  sScale = 1;
  tScale = 1;

  dragging = false;

  pointers.clear();
  lastPinchDistance = null;
}

/* ========================= APPLY (SMOOTHED) ========================= */

function apply() {
  const el = media.firstElementChild;
  if (!el) return;

  const alpha = 0.18;

  sx += (tx - sx) * alpha;
  sy += (ty - sy) * alpha;
  sScale += (tScale - sScale) * alpha;

  el.style.transform =
    `translate(-50%, -50%) translate(${sx}px, ${sy}px) scale(${sScale})`;
}

/* ========================= LOOP ========================= */

function loop() {
  if (!isOpen) {
    requestAnimationFrame(loop);
    return;
  }

  if (!dragging && tScale <= 1.02) {
    tx *= 0.85;
    ty *= 0.85;

    if (Math.abs(tx) < 0.5) tx = 0;
    if (Math.abs(ty) < 0.5) ty = 0;
  }

  apply();
  requestAnimationFrame(loop);
}

/* ========================= DRAG (mouse fallback) ========================= */

function startDrag(e) {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
}

function onDrag(e) {
  if (!dragging || !isOpen) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  tx += dx;
  ty += dy;

  lastX = e.clientX;
  lastY = e.clientY;
}

function endDrag() {
  dragging = false;
}

/* ========================= POINTER (touch + pinch) ========================= */

function startPointer(e) {
  if (!isOpen) return;

  const now = performance.now();

  /* double tap detection */
  if (pointers.size === 0) {
    const dt = now - lastTapTime;

    if (dt < 300) {
      zoomAtPoint(lastTapX, lastTapY);
      lastTapTime = 0;
      return;
    }

    lastTapTime = now;
    lastTapX = e.clientX;
    lastTapY = e.clientY;
  }

  media.setPointerCapture?.(e.pointerId);
  pointers.set(e.pointerId, e);

  if (pointers.size === 1) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }
}

function onPointerMove(e) {
  if (!isOpen) return;
  if (!pointers.has(e.pointerId)) return;

  pointers.set(e.pointerId, e);

  /* PINCH */
  if (pointers.size === 2) {
    const [p1, p2] = [...pointers.values()];

    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    const dist = Math.hypot(dx, dy);

    if (lastPinchDistance != null) {
      const delta = dist - lastPinchDistance;
      const next = clamp(tScale + delta * 0.01);

      tScale = next;
    }

    lastPinchDistance = dist;
    dragging = false;
    return;
  }

  lastPinchDistance = null;

  /* PAN */
  if (dragging && pointers.size === 1) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    tx += dx;
    ty += dy;

    lastX = e.clientX;
    lastY = e.clientY;
  }
}

function endPointer(e) {
  pointers.delete(e.pointerId);

  if (pointers.size < 2) {
    lastPinchDistance = null;
  }

  if (pointers.size === 0) {
    dragging = false;
  }
}

/* ========================= ZOOM HELPERS ========================= */

function zoomAtPoint(clientX, clientY) {
  const el = media.firstElementChild;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  const cx = clientX - (rect.left + rect.width / 2);
  const cy = clientY - (rect.top + rect.height / 2);

  const next = tScale > 1 ? 1 : 2.5;
  const ratio = next / tScale;

  tx = cx - (cx - tx) * ratio;
  ty = cy - (cy - ty) * ratio;

  tScale = next;
}

/* ========================= WHEEL ========================= */

function onWheel(e) {
  if (!isOpen) return;
  e.preventDefault();

  const el = media.firstElementChild;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  const cx = e.clientX - (rect.left + rect.width / 2);
  const cy = e.clientY - (rect.top + rect.height / 2);

  const prev = tScale;
  const next = clamp(prev - e.deltaY * 0.002);

  const ratio = next / prev;

  tx = cx - (cx - tx) * ratio;
  ty = cy - (cy - ty) * ratio;

  tScale = next;
}

/* ========================= DOUBLE CLICK ========================= */

function onDoubleClick(e) {
  zoomAtPoint(e.clientX, e.clientY);
}

/* ========================= UTILS ========================= */

function clamp(v) {
  return Math.min(Math.max(v, MIN_SCALE), MAX_SCALE);
}