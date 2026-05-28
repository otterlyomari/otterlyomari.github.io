let lightbox, media;
let isOpen = false;

/* ========================= STATE ========================= */

let x = 0, y = 0;
let scale = 1;

let dragging = false;
let lastX = 0;
let lastY = 0;

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
  x = 0;
  y = 0;
  scale = 1;
  dragging = false;
}

/* ========================= APPLY ========================= */

function apply() {
  const el = media.firstElementChild;
  if (!el) return;

  el.style.transform =
    `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
}

/* ========================= LOOP ========================= */

function loop() {
  if (!isOpen) {
    requestAnimationFrame(loop);
    return;
  }

  // snap to center when idle
  if (!dragging && scale <= 1.02) {
    x *= 0.85;
    y *= 0.85;

    if (Math.abs(x) < 0.5) x = 0;
    if (Math.abs(y) < 0.5) y = 0;
  }

  apply();
  requestAnimationFrame(loop);
}

/* ========================= DRAG ========================= */

function startDrag(e) {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
}

function onDrag(e) {
  if (!dragging || !isOpen) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  x += dx;
  y += dy;

  lastX = e.clientX;
  lastY = e.clientY;
}

function endDrag() {
  dragging = false;
}

/* ========================= CURSOR ZOOM (CORRECT iOS STYLE) ========================= */

function onWheel(e) {
  if (!isOpen) return;
  e.preventDefault();

  const el = media.firstElementChild;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  // cursor relative to center
  const cx = e.clientX - (rect.left + rect.width / 2);
  const cy = e.clientY - (rect.top + rect.height / 2);

  const prev = scale;
  const next = clamp(prev - e.deltaY * 0.002);

  const ratio = next / prev;

  // 🔥 THIS is the correct zoom-at-point formula
  x = cx - (cx - x) * ratio;
  y = cy - (cy - y) * ratio;

  scale = next;
}

/* ========================= DOUBLE CLICK ========================= */

function onDoubleClick(e) {
  const el = media.firstElementChild;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  const cx = e.clientX - (rect.left + rect.width / 2);
  const cy = e.clientY - (rect.top + rect.height / 2);

  const next = scale > 1 ? 1 : 2.5;
  const ratio = next / scale;

  x = cx - (cx - x) * ratio;
  y = cy - (cy - y) * ratio;

  scale = next;
}

/* ========================= UTILS ========================= */

function clamp(v) {
  return Math.min(Math.max(v, MIN_SCALE), MAX_SCALE);
}