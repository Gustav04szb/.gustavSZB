var images = []; // Array to store image sources
var currentIndex = 0; // Track the currently displayed image

// Funktion, um das Bild im Vollbildmodus anzuzeigen
function openFullscreen(imageSrc) {
    var container = document.getElementById('fullscreen-container');
    var fullscreenImage = document.getElementById('fullscreen-image');
    var backButton = document.getElementById('back-button');

    if (images.length === 0) {
        images = Array.from(document.querySelectorAll('.grid img')).map(img => img.src);
    }

    currentIndex = images.indexOf(imageSrc);
    fullscreenImage.src = imageSrc;

    fullscreenImage.style.transform = 'scale(1) translate(0px, 0px)';
    fullscreenImage.dataset.scale = 1;
    fullscreenImage.dataset.translateX = 0;
    fullscreenImage.dataset.translateY = 0;

    container.style.display = 'flex';
    container.classList.add('active');
    backButton.style.display = 'block';
    document.getElementById('prev-button').style.display = 'block';
    document.getElementById('next-button').style.display = 'block';

    // Verhindere das Scrollen der Hintergrundseite
    document.body.style.overflow = 'hidden';

    history.pushState(null, null, location.pathname + location.search);
}

// Funktion, um das Vollbild zu schließen
function closeFullscreen() {
    var container = document.getElementById('fullscreen-container');
    var backButton = document.getElementById('back-button');
    container.style.display = 'none';
    container.classList.remove('active');
    backButton.style.display = 'none';
    document.getElementById('prev-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'none';

    // Erlaube das Scrollen der Hintergrundseite wieder
    document.body.style.overflow = ''; // oder 'auto', je nach Bedarf

    history.back();
}

// Funktion, um zum nächsten Bild zu wechseln
function nextImage() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        updateFullscreenImage();
    }
}

// Funktion, um zum vorherigen Bild zu wechseln
function prevImage() {
    if (currentIndex > 0) {
        currentIndex--;
        updateFullscreenImage();
    }
}

// Funktion, um das Bild im Vollbildmodus zu aktualisieren
function updateFullscreenImage() {
    var fullscreenImage = document.getElementById('fullscreen-image');
    fullscreenImage.src = images[currentIndex];

    // Reset zoom and position
    fullscreenImage.style.transform = 'scale(1) translate(0px, 0px)';
    fullscreenImage.dataset.scale = 1;
    fullscreenImage.dataset.translateX = 0;
    fullscreenImage.dataset.translateY = 0;
}

// Event-Listener für die Navigation
document.getElementById('next-button').addEventListener('click', nextImage);
document.getElementById('prev-button').addEventListener('click', prevImage);

// Funktion zum Zoomen des Bildes
function zoomImage(event) {
    var fullscreenImage = document.getElementById('fullscreen-image');
    var scale = parseFloat(fullscreenImage.dataset.scale) || 1;

    if (event.deltaY < 0) {
        scale *= 1.1; // Vergrößern
    } else {
        scale /= 1.1; // Verkleinern
    }

    scale = Math.max(1, Math.min(scale, 5)); // Begrenzung des Zooms
    fullscreenImage.style.transform = `scale(${scale}) translate(${fullscreenImage.dataset.translateX}px, ${fullscreenImage.dataset.translateY}px)`;
    fullscreenImage.dataset.scale = scale;
}

// Funktion zum Verschieben des Bildes
let lastX, lastY, isDragging = false;
function startDragging(event) {
    isDragging = true;
    lastX = event.clientX || event.touches[0].clientX;
    lastY = event.clientY || event.touches[0].clientY;
    event.preventDefault();
}

function stopDragging() {
    isDragging = false;
}

function dragImage(event) {
    if (!isDragging) return;

    var fullscreenImage = document.getElementById('fullscreen-image');
    var scale = parseFloat(fullscreenImage.dataset.scale) || 1;
    var currentX = event.clientX || event.touches[0].clientX;
    var currentY = event.clientY || event.touches[0].clientY;
    var deltaX = (currentX - lastX) / scale;
    var deltaY = (currentY - lastY) / scale;

    var translateX = parseFloat(fullscreenImage.dataset.translateX) + deltaX;
    var translateY = parseFloat(fullscreenImage.dataset.translateY) + deltaY;

    fullscreenImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    fullscreenImage.dataset.translateX = translateX;
    fullscreenImage.dataset.translateY = translateY;

    lastX = currentX;
    lastY = currentY;
}

// Event-Listener für das Scrollen zum Zoomen
var fullscreenContainer = document.getElementById('fullscreen-container');
fullscreenContainer.addEventListener('wheel', zoomImage);

// Event-Listener für das Ziehen zum Verschieben
var fullscreenImage = document.getElementById('fullscreen-image');
fullscreenImage.addEventListener('mousedown', startDragging);
fullscreenImage.addEventListener('mousemove', dragImage);
fullscreenImage.addEventListener('mouseup', stopDragging);
fullscreenImage.addEventListener('mouseleave', stopDragging);
fullscreenImage.addEventListener('touchstart', startDragging, { passive: false });
fullscreenImage.addEventListener('touchmove', dragImage, { passive: false });
fullscreenImage.addEventListener('touchend', stopDragging);

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFullscreen();
    }
});
function adjustTextContainerSize() {
    const textContainers = document.querySelectorAll('.text-container');

    textContainers.forEach(textContainer => {
        const gridContainer = textContainer.closest('.grid');
        if (gridContainer) {
            const thumbnails = gridContainer.querySelectorAll('.thumbnail');

            if (thumbnails.length > 0) {
                const thumbnailWidth = thumbnails[0].clientWidth;
                const thumbnailHeight = thumbnails[0].clientHeight;
                textContainer.style.height = `${thumbnailHeight}px`;

                const textElement = textContainer.querySelector('p');
                if (textElement) {
                    let scaleFactor = 1; // Standardwert für scaleFactor
                    const textWidth = textElement.clientWidth;
                    const textHeight = textElement.clientHeight;

                    if (textWidth > thumbnailWidth || textHeight > thumbnailHeight) {
                        // Schriftgröße anpassen, nicht transform: scale
                        const scaleX = thumbnailWidth / textWidth;
                        const scaleY = thumbnailHeight / textHeight;
                        scaleFactor = Math.min(scaleX, scaleY);

                        // Clamp für eine fließende Schriftgrößenanpassung
                        const newFontSize = Math.max(10, Math.min(16, 16 * scaleFactor));
                        textElement.style.fontSize = `${newFontSize}px`;

                        // Zentrierte Skalierung
                        textElement.style.transformOrigin = 'center';
                    } else {
                        textElement.style.fontSize = '16px'; // Standard Schriftgröße
                        textElement.style.transformOrigin = 'center';
                    }

                    if (scaleFactor < 0.5) {
                        textContainer.style.gridColumn = 'span 2';
                    } else {
                        textContainer.style.gridColumn = 'span 1';
                    }
                }
            }
        }
    });
}

window.addEventListener('load', adjustTextContainerSize);
window.addEventListener('resize', adjustTextContainerSize);

// Touch-Zoom (Pinch-Geste auf Touchscreens)
let touchStartDist = 0;
fullscreenContainer.addEventListener('touchstart', function(event) {
    if (event.touches.length === 2) {
        touchStartDist = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
    }
}, false);

fullscreenContainer.addEventListener('touchmove', function(event) {
    if (event.touches.length === 2) {
        var touchMoveDist = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );

        var scale = parseFloat(fullscreenImage.dataset.scale) || 1;

        if (touchStartDist > 0) {
            scale *= touchMoveDist / touchStartDist;
        }

        scale = Math.max(1, Math.min(scale, 5));
        fullscreenImage.style.transform = `scale(${scale}) translate(${fullscreenImage.dataset.translateX}px, ${fullscreenImage.dataset.translateY}px)`;
        fullscreenImage.dataset.scale = scale;

        touchStartDist = touchMoveDist;
    }
}, false);
