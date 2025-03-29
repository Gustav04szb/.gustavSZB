import os
from PIL import Image

# Pfad zum Hauptordner mit Bildern
SOURCE_DIR = "images"
THUMBNAIL_DIR = "thumbnails"
THUMB_SIZE = (300, 300)  # Max. Größe der Thumbnails (Breite, Höhe)

# Unterstützte Bildformate
SUPPORTED_FORMATS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp')

def create_thumbnails():
    for root, _, files in os.walk(SOURCE_DIR):
        for file in files:
            if file.lower().endswith(SUPPORTED_FORMATS):
                source_path = os.path.join(root, file)

                # Zielpfad im Thumbnail-Ordner erzeugen
                relative_path = os.path.relpath(source_path, SOURCE_DIR)
                thumb_path = os.path.join(THUMBNAIL_DIR, relative_path)

                # Wenn das Thumbnail bereits existiert, überspringen
                if os.path.exists(thumb_path):
                    print(f"⏩ Übersprungen (bereits vorhanden): {thumb_path}")
                    continue

                # Zielordner erstellen, falls nicht vorhanden
                os.makedirs(os.path.dirname(thumb_path), exist_ok=True)

                try:
                    with Image.open(source_path) as img:
                        img.thumbnail(THUMB_SIZE)
                        img.save(thumb_path)
                        print(f"✅ Thumbnail erstellt: {thumb_path}")
                except Exception as e:
                    print(f"❌ Fehler bei {source_path}: {e}")

if __name__ == "__main__":
    create_thumbnails()
