const SWIPE_THRESHOLD = 60;
const TAP_THRESHOLD = 10;
const DOUBLE_TAP_DELAY = 300;
const MOVE_THROTTLE = 1000 / 60; // 60fps cap

let pointers = new Map();
let lastPinchDistance = null;
let lastMoveTime = 0;


export function attachGesture(target, handlers = {}) {
  const state = {
    startX: 0,
    startY: 0,

    lastMoveX: 0,
    lastMoveY: 0,

    startTime: 0,
    active: false,

    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
  };

  function getDistance() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return null;

    const dx = pts[0].clientX - pts[1].clientX;
    const dy = pts[0].clientY - pts[1].clientY;
    return Math.hypot(dx, dy);
  }

  /* ================= POINTER DOWN ================= */
  function onPointerDown(e) {
    state.active = false;
    pointers.set(e.pointerId, e);

    state.startX = e.clientX;
    state.startY = e.clientY;

    state.lastMoveX = e.clientX;
    state.lastMoveY = e.clientY;

    state.startTime = performance.now();
    state.active = true;

    target.setPointerCapture?.(e.pointerId);

    handlers.onStart?.({
      x: state.startX,
      y: state.startY,
      event: e,
    });
  }

  /* ================= POINTER MOVE ================= */
    function onPointerMove(e) {
    if (!state.active) return;

    const now = performance.now();
    if (now - lastMoveTime < 1000 / 60) return; // optional throttle
    lastMoveTime = now;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    const ddx = e.clientX - state.lastMoveX;
    const ddy = e.clientY - state.lastMoveY;

    state.lastMoveX = e.clientX;
    state.lastMoveY = e.clientY;

    pointers.set(e.pointerId, e);

    handlers.onPan?.({
        dx,
        dy,
        ddx,
        ddy,
        x: e.clientX,
        y: e.clientY,
        event: e
    });

    // pinch
    const pinch = getDistance();
    if (pinch != null && lastPinchDistance != null) {
        handlers.onPinch?.({
        scale: pinch / lastPinchDistance,
        distance: pinch,
        event: e
        });
    }

    lastPinchDistance = pinch;
}

  /* ================= POINTER UP ================= */
function onPointerUp(e) {
  pointers.delete(e.pointerId);

  if (pointers.size < 2) {
    lastPinchDistance = null;
  }

  if (!state.active) return;
  state.active = false;

  const dx = state.lastMoveX - state.startX;
  const dy = state.lastMoveY - state.startY;

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  const now = performance.now();
  const dt = now - state.startTime;

  const isTap = absX < TAP_THRESHOLD && absY < TAP_THRESHOLD;

  if (isTap) {
    handlers.onTap?.({
      x: state.lastMoveX,
      y: state.lastMoveY,
      event: e,
    });

    handlers.onEnd?.({ dx, dy, dt, event: e }); // ✅ ADD
    return;
  }

  const velocity = absX / dt;

  if (absX > 30 && velocity > 0.25 && absX > absY * 1.2) {
    handlers.onSwipe?.({
      direction: dx < 0 ? "left" : "right",
      dx,
      dy,
      velocity,
      event: e,
    });

    handlers.onEnd?.({ dx, dy, dt, event: e }); // ✅ ADD
    return;
  }

  if (absY > SWIPE_THRESHOLD && absY > absX * 1.3) {
    handlers.onVertical?.({
      direction: dy < 0 ? "down" : "up",
      dx,
      dy,
      velocity: absY / dt,
      event: e,
    });

    handlers.onEnd?.({ dx, dy, dt, event: e }); // ✅ ADD
    return;
  }

  handlers.onEnd?.({ dx, dy, dt, event: e });
}

  /* ================= WHEEL ================= */
  function onWheel(e) {
    handlers.onWheel?.({
      deltaY: e.deltaY,
      x: e.clientX,
      y: e.clientY,
      event: e,
    });
  }

  target.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  target.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    target.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    target.removeEventListener("wheel", onWheel);
  };
}