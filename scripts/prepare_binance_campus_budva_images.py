from pathlib import Path

from PIL import Image, ImageOps
import pillow_heif


pillow_heif.register_heif_opener()

ROOT = Path(r"C:\Users\Semir\Desktop\test\ai")
SOURCE = ROOT / "event_sources" / "binance-campus-budva"
MEDIA = ROOT / "backend" / "media" / "blog"
COVER_PATH = MEDIA / "covers" / "binance-campus-budva.jpg"
GALLERY_DIR = MEDIA / "gallery" / "binance-campus-budva"

COVER_SOURCE = "EXT50170.JPG"
GALLERY_SOURCES = [
    "BC0931.jpg",
    "IMG_7845.heic",
    "IMG_7919.heic",
    "IMG_8108.heic",
    "IMG_8135.heic",
    "IMG_8240.heic",
    "IMG_8309.heic",
    "IMG_8512.heic",
    "IMG_8527.JPG",
]


def open_rgb(path: Path) -> Image.Image:
    with Image.open(path) as source:
        return ImageOps.exif_transpose(source).convert("RGB")


def save_cover() -> None:
    COVER_PATH.parent.mkdir(parents=True, exist_ok=True)
    image = open_rgb(SOURCE / COVER_SOURCE)
    image = ImageOps.fit(image, (2000, 950), Image.Resampling.LANCZOS, centering=(0.5, 0.48))
    image.save(COVER_PATH, "JPEG", quality=86, optimize=True, progressive=True)


def save_gallery() -> None:
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    for index, filename in enumerate(GALLERY_SOURCES, start=1):
        image = open_rgb(SOURCE / filename)
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        destination = GALLERY_DIR / f"binance-campus-budva-{index:02d}.jpg"
        image.save(destination, "JPEG", quality=84, optimize=True, progressive=True)


save_cover()
save_gallery()
print(COVER_PATH)
for path in sorted(GALLERY_DIR.glob("*.jpg")):
    print(path)
