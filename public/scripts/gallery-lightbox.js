let lightbox, img;
let isOpen = false;

/* =========================
   ACTUAL STATE (RENDERED)
========================= */
let x = 0, y = 0, scale = 1;
let vx = 0, vy = 0;

/* =========================
   TARGET STATE (INPUT DRIVEN)
========================= */
let tx = 0, ty = 0, tScale = 1;

/* =========================
   INPUT STATE
========================= */
let dragging = false;
let lastX = 0;
let lastY = 0;

/* pinch */
let pinchStartDist = 0;
let pinchStartScale = 1;

/* =========================
   CONFIG
========================= */
const MIN_SCALE = 1;
const MAX_SCALE = 5;

const POS_SPRING = 0.12;
const SCALE_SPRING = 0.12;

const DAMPING = 0.82;
const SNAP_EPSILON = 0.3;

/* =========================
   INIT
========================= */

export function initLightbox() {
  lightbox = document.getElementById("lightbox");
  img = document.getElementById("lightbox-img");

  if (!lightbox || !img) return;

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  img.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", endDrag);

  img.addEventListener("dragstart", (e) => e.preventDefault());

  img.addEventListener("wheel", onWheel, { passive: false });
  img.addEventListener("dblclick", onDoubleClick);

  img.addEventListener("touchstart", onTouchStart, { passive: false });
  img.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", endDrag);

  requestAnimationFrame(loop);
}

/* =========================
   OPEN / CLOSE
========================= */

export function openLightbox(src) {
  isOpen = true;

  lightbox.classList.remove("hidden");
  img.src = src;

  document.body.style.overflow = "hidden";

  reset();

  tScale = 1.08;
}

export function closeLightbox() {
  isOpen = false;

  lightbox.classList.add("hidden");

  document.body.style.overflow = "";

  reset();
}

/* =========================
   RESET
========================= */

function reset() {
  x = y = 0;
  vx = vy = 0;

  tx = ty = 0;
  tScale = 1;
  scale = 1;
}

/* =========================
   APPLY
========================= */

function apply() {
  img.style.transform =
    `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

/* =========================
   MAIN SPRING LOOP
========================= */

function loop() {
  if (isOpen) {

    /* =========================
       POSITION SPRING
    ========================= */
    const dx = tx - x;
    const dy = ty - y;

    vx += dx * POS_SPRING;
    vy += dy * POS_SPRING;

    vx *= DAMPING;
    vy *= DAMPING;

    x += vx;
    y += vy;

    /* =========================
       SCALE SPRING
    ========================= */
    scale += (tScale - scale) * SCALE_SPRING;

    /* =========================
       SNAP TO CENTER
    ========================= */
    if (
      Math.abs(vx) < SNAP_EPSILON &&
      Math.abs(vy) < SNAP_EPSILON &&
      scale <= 1.01 &&
      !dragging
    ) {
      tx = 0;
      ty = 0;
      vx *= 0.8;
      vy *= 0.8;
    }

    apply();
  }

  requestAnimationFrame(loop);
}

/* =========================
   ZOOM (CURSOR ANCHORED)
========================= */

function zoomAtPoint(nextScale, px, py) {
  const rect = img.getBoundingClientRect();

  const cx = px - rect.left - rect.width / 2;
  const cy = py - rect.top - rect.height / 2;

  const wx = (cx - x) / scale;
  const wy = (cy - y) / scale;

  tScale = clamp(nextScale);

  tx = cx - wx * tScale;
  ty = cy - wy * tScale;
}

/* =========================
   WHEEL ZOOM
========================= */

function onWheel(e) {
  if (!isOpen) return;

  e.preventDefault();

  zoomAtPoint(
    tScale - e.deltaY * 0.002,
    e.clientX,
    e.clientY
  );
}

/* =========================
   DOUBLE CLICK
========================= */

function onDoubleClick(e) {
  if (!isOpen) return;

  const target = tScale > 1 ? 1 : 2.4;

  zoomAtPoint(target, e.clientX, e.clientY);

  if (target === 1) {
    tx = 0;
    ty = 0;
  }
}

/* =========================
   DRAG + KINETIC PAN
========================= */

function startDrag(e) {
  if (!isOpen) return;

  dragging = true;

  lastX = e.clientX;
  lastY = e.clientY;

  vx = 0;
  vy = 0;
}

function onDrag(e) {
  if (!dragging || !isOpen) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  tx += dx;
  ty += dy;

  vx = dx;
  vy = dy;

  lastX = e.clientX;
  lastY = e.clientY;
}

function endDrag() {
  dragging = false;
}

/* =========================
   PINCH ZOOM
========================= */

function onTouchStart(e) {
  if (!isOpen) return;

  if (e.touches.length === 2) {
    pinchStartDist = getDist(e.touches);
    pinchStartScale = tScale;
  }
}

function onTouchMove(e) {
  if (!isOpen || e.touches.length !== 2) return;

  e.preventDefault();

  const dist = getDist(e.touches);
  const factor = dist / pinchStartDist;

  const next = pinchStartScale * factor;

  const px =
    (e.touches[0].clientX + e.touches[1].clientX) / 2;

  const py =
    (e.touches[0].clientY + e.touches[1].clientY) / 2;

  zoomAtPoint(next, px, py);
}

/* =========================
   UTILS
========================= */

function getDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function clamp(v = tScale) {
  return Math.min(Math.max(v, MIN_SCALE), MAX_SCALE);
}