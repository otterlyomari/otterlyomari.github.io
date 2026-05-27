(() => {
  const splashSeen = sessionStorage.getItem("seenSplash");

  const splash = document.getElementById("water-scene");
  const splashBg = document.getElementById("bg-layer-splash");

  document.body.classList.remove("splash-active");

  if (splashSeen) {
    splash?.remove();
    splashBg && (splashBg.style.opacity = "0");
    document.body.classList.add("loaded");
    return;
  }

  sessionStorage.setItem("seenSplash", "true");
  document.body.classList.add("splash-active");

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
      splashBg && (splashBg.style.pointerEvents = "none");
      document.body.classList.remove("splash-active");
    }, 1200);
  }, 2400);
})();