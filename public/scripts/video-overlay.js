/**
 * video-overlay.js
 *
 * Creates YouTube-style click-to-play/pause overlay with animated icons.
 * Handles keyboard shortcuts for video controls.
 */

export function attachVideoOverlay(videoEl, playerWrap) {
  if (!videoEl || !playerWrap) return;

  // Create overlay element
  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  
  const icon = document.createElement("div");
  icon.className = "video-overlay-icon";
  overlay.appendChild(icon);
  
  playerWrap.style.position = "relative";
  playerWrap.appendChild(overlay);
  
  let hideTimeout = null;
  
  function showOverlay(type) {
    // type: 'play' or 'pause'
    icon.textContent = type === 'play' ? '▶' : '⏸';
    overlay.classList.add('visible');
    
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      overlay.classList.remove('visible');
    }, 800);
  }
  
  // Click on video toggles play/pause
  videoEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      showOverlay('play');
    } else {
      videoEl.pause();
      showOverlay('pause');
    }
  });
  
  // Show overlay on play/pause events (for keyboard shortcuts)
  videoEl.addEventListener('play', () => showOverlay('play'));
  videoEl.addEventListener('pause', () => showOverlay('pause'));
  
  return overlay;
}

export function attachVideoKeyboardShortcuts(videoEl, playerWrap) {
  if (!videoEl) return;
  
  const SEEK_STEP = 5; // seconds
  
  function handleKeydown(e) {
    // Only handle if lightbox is open and no input focused
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    
    // Don't interfere with typing in inputs
    if (e.target.matches('input, textarea, button, select')) return;
    
    console.log('Key pressed:', e.key); // Debug log
    
    switch (e.key) {
      case 'f':
      case 'F':
        e.preventDefault();
        console.log('Toggling fullscreen'); // Debug log
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (playerWrap.requestFullscreen) {
            playerWrap.requestFullscreen();
          } else if (playerWrap.webkitRequestFullscreen) {
            playerWrap.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
        break;
        
      case 'k':
      case 'K':
        e.preventDefault();
        if (videoEl.paused) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
        break;
        
      case 'j':
      case 'J':
        e.preventDefault();
        videoEl.currentTime = Math.max(0, videoEl.currentTime - SEEK_STEP);
        break;
        
      case 'l':
      case 'L':
        e.preventDefault();
        videoEl.currentTime = Math.min(videoEl.duration, videoEl.currentTime + SEEK_STEP);
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        videoEl.currentTime = Math.max(0, videoEl.currentTime - SEEK_STEP);
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        videoEl.currentTime = Math.min(videoEl.duration, videoEl.currentTime + SEEK_STEP);
        break;
        
      case ' ':
      case 'Space':
        e.preventDefault();
        if (videoEl.paused) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
        break;
        
      default:
        break;
    }
  }
  
  window.addEventListener('keydown', handleKeydown);
  
  // Return cleanup function
  return () => window.removeEventListener('keydown', handleKeydown);
}