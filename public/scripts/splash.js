(function () {
  const splashSeen = sessionStorage.getItem("seenSplash");

  const splash = document.getElementById("water-scene");
  const splashBg = document.getElementById("bg-layer-splash");

  // ALWAYS normalize state on navigation
  document.body.classList.remove("splash-active");

  if (splashSeen === "true") {
    splash?.remove();
    if (splashBg) splashBg.style.opacity = "0";
    document.body.classList.add("loaded");
    return;
  }

  // mark immediately (prevents re-trigger during navigation timing)
  sessionStorage.setItem("seenSplash", "true");

  document.body.classList.add("splash-active");

  // safety: ensure it always completes even on navigation
  const start = requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.classList.add("loaded");

      if (splashBg) splashBg.style.opacity = "0";

      if (splash) {
        splash.style.opacity = "0";
        splash.style.transform = "scale(1.02)";
        splash.style.filter = "blur(2px)";
      }

      setTimeout(() => {
        splash?.remove();
        if (splashBg) splashBg.style.pointerEvents = "none";
        document.body.classList.remove("splash-active");
      }, 1200);
    }, 2400);
  });

  // cleanup if navigation interrupts mid-animation
  window.addEventListener("astro:before-preparation", () => {
    cancelAnimationFrame(start);
  }, { once: true });

})();