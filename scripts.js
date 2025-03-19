// Funktion, um das Bild im Vollbildmodus anzuzeigen
function openFullscreen(imageSrc) {
    var container = document.getElementById('fullscreen-container');
    var fullscreenImage = document.getElementById('fullscreen-image');

    // Setze das Bild im Vollbild-Container
    fullscreenImage.src = imageSrc;

    // Zeige den Vollbild-Container an
    container.style.display = 'flex';
    container.classList.add('active'); // Füge die aktive Klasse hinzu
}

// Funktion, um das Vollbild zu schließen
function closeFullscreen() {
    var container = document.getElementById('fullscreen-container');
    container.style.display = 'none';
    container.classList.remove('active'); // Entferne die aktive Klasse
}