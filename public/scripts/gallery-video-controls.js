/**
 * gallery-video-controls.js
 *
 * Builds and manages the custom video player controls bar.
 *
 * Desktop: controls overlay the bottom of the video (position: absolute)
 * Mobile:  controls sit below the video in normal flow (position: static)
 *
 * The layout switch is handled entirely by CSS media queries — no JS DOM
 * reshuffling needed.
 *
 * Exports:
 *   buildVideoControls(videoEl, playerWrap) → { bar, overlay }
 */

const SPEED_PRESETS     = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const SPEED_PILL_VALUES = [0.5, 1, 1.5, 2];

export function buildVideoControls(videoEl, playerWrap) {

  /* ═══════════════════════════════════════════
     CLICK OVERLAY  (YouTube-style flash icon)
     Appended to playerWrap by gallery-lightbox
  ═══════════════════════════════════════════ */
  const overlay = document.createElement("div");
  overlay.className = "vc-click-overlay";

  const overlayIcon = document.createElement("span");
  overlayIcon.className = "vc-overlay-icon";
  overlayIcon.textContent = "⏸";
  overlay.appendChild(overlayIcon);

  // Click-to-play/pause with flash animation
  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      overlayIcon.textContent = "▶";
    } else {
      videoEl.pause();
      overlayIcon.textContent = "⏸";
    }
    overlay.classList.add("flash");
    overlay.addEventListener("animationend", () => overlay.classList.remove("flash"), { once: true });
  });

  /* ═══════════════════════════════════════════
     CONTROLS BAR
  ═══════════════════════════════════════════ */
  const bar = document.createElement("div");
  bar.className = "video-controls";

  /* ── Progress row: [scrubber ────────── timestamp] ── */
  const progressWrap = document.createElement("div");
  progressWrap.className = "vc-progress-wrap";

  const progressRow = document.createElement("div");
  progressRow.className = "vc-progress-row";

  const progress = document.createElement("input");
  progress.type      = "range";
  progress.className = "vc-progress";
  progress.min       = "0";
  progress.max       = "1000";
  progress.value     = "0";
  progress.setAttribute("aria-label", "Playback position");

  const timeDisplay = document.createElement("span");
  timeDisplay.className   = "vc-time t-outline-w";
  timeDisplay.textContent = "0:00 / 0:00";

  progressRow.append(progress, timeDisplay);
  progressWrap.appendChild(progressRow);

  function fmt(s) {
    if (isNaN(s) || !isFinite(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${ss}` : `${m}:${ss}`;
  }

  function syncProgress() {
    if (!videoEl.duration) return;
    const pct = (videoEl.currentTime / videoEl.duration) * 1000;
    progress.value = String(pct);
    // --progress drives the red filled-track gradient in CSS
    progress.style.setProperty("--progress", `${(pct / 10).toFixed(2)}%`);
    timeDisplay.textContent = `${fmt(videoEl.currentTime)} / ${fmt(videoEl.duration)}`;
  }

  videoEl.addEventListener("timeupdate", syncProgress);
  videoEl.addEventListener("loadedmetadata", syncProgress);

  progress.addEventListener("input", (e) => {
    e.stopPropagation();
    if (!videoEl.duration) return;
    videoEl.currentTime = (parseFloat(e.target.value) / 1000) * videoEl.duration;
    syncProgress();
  });
  progress.addEventListener("pointerdown", (e) => e.stopPropagation());

  /* ── Main controls row: [▶  🔊────  spacer  speed  ⛶] ── */
  const row = document.createElement("div");
  row.className = "vc-row";

  /* Play / Pause */
  const playBtn = makeBtn("▶", "Play", () => {
    videoEl.paused ? videoEl.play().catch(() => {}) : videoEl.pause();
  });
  videoEl.addEventListener("play",  () => { playBtn.textContent = "⏸"; playBtn.setAttribute("aria-label", "Pause"); });
  videoEl.addEventListener("pause", () => { playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "Play"); });
  if (!videoEl.paused) { playBtn.textContent = "⏸"; playBtn.setAttribute("aria-label", "Pause"); }

  /* Volume (hidden until loadedmetadata confirms audio) */
  const muteBtn = makeBtn("🔇", "Unmute", () => {
    videoEl.muted = !videoEl.muted;
    syncVol();
  });

  const volSlider = document.createElement("input");
  volSlider.type      = "range";
  volSlider.className = "vc-slider vc-volume";
  volSlider.min = "0"; volSlider.max = "1"; volSlider.step = "0.05"; volSlider.value = "0";
  volSlider.setAttribute("aria-label", "Volume");
  volSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    const v = parseFloat(e.target.value);
    videoEl.volume = v;
    videoEl.muted  = v === 0;
    // Drive volume fill gradient
    volSlider.style.setProperty("--vol", `${(v * 100).toFixed(1)}%`);
    syncVol();
  });
  volSlider.addEventListener("pointerdown", (e) => e.stopPropagation());

  function syncVol() {
    const muted = videoEl.muted || videoEl.volume === 0;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    const v = muted ? 0 : videoEl.volume;
    volSlider.value = String(v);
    volSlider.style.setProperty("--vol", `${(v * 100).toFixed(1)}%`);
  }

  const volGroup = document.createElement("div");
  volGroup.className    = "vc-group vc-vol-group";
  volGroup.style.display = "none"; // revealed after audio confirmed
  volGroup.append(muteBtn, volSlider);

  videoEl.addEventListener("loadedmetadata", () => {
    const hasAudio = (videoEl.audioTracks?.length > 0) || (videoEl.mozHasAudio === true);
    if (hasAudio) { volGroup.style.display = ""; syncVol(); }
  });

  /* Spacer */
  const spacer = document.createElement("div");
  spacer.className = "vc-spacer";

  /* Speed group
   *
   * preservesPitch is set on the video in gallery-lightbox.js so pitch
   * stays constant when playbackRate changes.
   *
   * Desktop: pills + fine nudge shown inline in the controls row.
   * Mobile:  speed section is its own block above fullscreen (see CSS).
   */
  const speedSection = document.createElement("div");
  speedSection.className = "vc-speed-section";

  const speedLabel = document.createElement("span");
  speedLabel.className   = "vc-label t-outline-w";
  speedLabel.textContent = "Speed";

  function setSpeed(s) {
    videoEl.playbackRate = s;
    speedSection.querySelectorAll(".vc-speed-pill").forEach(b =>
      b.classList.toggle("active", parseFloat(b.dataset.speed) === s)
    );
  }

  const pills = SPEED_PILL_VALUES.map(s => {
    const btn = document.createElement("button");
    btn.className     = "vc-speed-pill t-outline-w" + (s === 1 ? " active" : "");
    btn.textContent   = `${s}×`;
    btn.dataset.speed = String(s);
    btn.setAttribute("aria-label", `${s}× speed`);
    btn.addEventListener("click", (e) => { e.stopPropagation(); setSpeed(s); });
    return btn;
  });

  const speedDown = makeBtn("−", "Slower", () => {
    const i = SPEED_PRESETS.indexOf(videoEl.playbackRate);
    setSpeed(SPEED_PRESETS[Math.max(0, i - 1)]);
  });
  const speedUp = makeBtn("+", "Faster", () => {
    const i = SPEED_PRESETS.indexOf(videoEl.playbackRate);
    setSpeed(SPEED_PRESETS[Math.min(SPEED_PRESETS.length - 1, i + 1)]);
  });

  const pillRow = document.createElement("div");
  pillRow.className = "vc-pill-row";
  pillRow.append(speedDown, ...pills, speedUp);

  speedSection.append(speedLabel, pillRow);

  /* Fullscreen */
  const fsBtn = makeBtn("⛶", "Fullscreen", () => toggleFullscreen(playerWrap));

  function onFsChange() {
    const full = document.fullscreenElement === playerWrap ||
                 document.webkitFullscreenElement === playerWrap;
    fsBtn.textContent = full ? "✕" : "⛶";
    fsBtn.setAttribute("aria-label", full ? "Exit fullscreen" : "Fullscreen");
  }
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);

  // Cleanup on video src change (navigation to next item)
  videoEl.addEventListener("emptied", () => {
    document.removeEventListener("fullscreenchange", onFsChange);
    document.removeEventListener("webkitfullscreenchange", onFsChange);
  }, { once: true });

  /* Assemble row */
  row.append(playBtn, volGroup, spacer, speedSection, fsBtn);

  /* Assemble bar
   *
   * Desktop (CSS position: absolute, overlaid):
   *   [progress row]
   *   [▶  🔊──── ·····  speed pills  ⛶]
   *
   * Mobile (CSS position: static, below video):
   *   [progress row ──── timestamp]
   *   [Speed label]
   *   [pill row]
   *   [⛶]
   *
   * The speed section and fullscreen button rearrange via CSS grid/flex.
   */
  bar.append(progressWrap, row);

  /* ── Auto-hide ──
   * Shows on any pointer activity inside playerWrap.
   * Stays visible while paused.
   * Hides after 2.5s of idle during playback.
   */
  let hideTimer = null;

  function showControls() {
    bar.classList.add("visible");
    clearTimeout(hideTimer);
    if (!videoEl.paused) {
      hideTimer = setTimeout(() => bar.classList.remove("visible"), 2500);
    }
  }

  videoEl.addEventListener("pause", showControls);  // keep visible when paused
  videoEl.addEventListener("play",  showControls);  // reset timer on play

  playerWrap.addEventListener("pointermove", showControls);
  playerWrap.addEventListener("pointerdown", showControls);

  showControls();

  return { bar, overlay };
}

/* ========================= HELPERS ========================= */

function makeBtn(text, label, onClick) {
  const btn = document.createElement("button");
  btn.className   = "vc-btn t-outline-w";
  btn.textContent = text;
  btn.setAttribute("aria-label", label);
  btn.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  return btn;
}

function toggleFullscreen(el) {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el).catch(() => {});
  } else {
    (document.exitFullscreen ?? document.webkitExitFullscreen)?.call(document);
  }
}