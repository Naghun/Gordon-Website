from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont, ImageOps
import pillow_heif


pillow_heif.register_heif_opener()

SOURCE = Path(r"C:\Users\Semir\Desktop\test\ai\event_sources\binance-campus-budva")
OUTPUT = SOURCE / "_contact_sheets"
OUTPUT.mkdir(exist_ok=True)

files = sorted(
    (p for p in SOURCE.iterdir() if p.suffix.lower() in {".heic", ".jpg", ".jpeg"}),
    key=lambda p: p.name.lower(),
)

thumb_w, thumb_h = 300, 225
label_h, gap = 34, 12
cols, rows = 4, 4
page_size = cols * rows
font = ImageFont.load_default(size=18)

for page_index in range(math.ceil(len(files) / page_size)):
    page_files = files[page_index * page_size : (page_index + 1) * page_size]
    canvas = Image.new(
        "RGB",
        (cols * (thumb_w + gap) + gap, rows * (thumb_h + label_h + gap) + gap),
        "#171a1f",
    )
    draw = ImageDraw.Draw(canvas)
    for index, path in enumerate(page_files):
        row, col = divmod(index, cols)
        x = gap + col * (thumb_w + gap)
        y = gap + row * (thumb_h + label_h + gap)
        with Image.open(path) as source:
            source = ImageOps.exif_transpose(source).convert("RGB")
            thumb = ImageOps.fit(source, (thumb_w, thumb_h), Image.Resampling.LANCZOS)
        canvas.paste(thumb, (x, y))
        label = f"{page_index * page_size + index + 1:03d}  {path.name}"
        draw.text((x + 4, y + thumb_h + 7), label, fill="white", font=font)
    canvas.save(OUTPUT / f"contact-{page_index + 1:02d}.jpg", quality=90)

print(f"Created {math.ceil(len(files) / page_size)} sheets for {len(files)} images in {OUTPUT}")
