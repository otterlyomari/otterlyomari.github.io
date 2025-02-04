function showFullscreen(img) {
    document.getElementById('fullscreen-img').src = img.src;
    document.getElementById('fullscreen').style.display = 'flex';
}
function hideFullscreen() {
    document.getElementById('fullscreen').style.display = 'none';
}