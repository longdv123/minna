# Copy minna-ux.js into so_cap / trung_cap quiz folders and append a script tag.
from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parents[1]
src = Path(__file__).resolve().parent / "minna-ux.js"
if not src.exists():
    raise SystemExit("missing minna-ux.js")

# Keep a copy at trung_cap root too
trung = root / "trung_cap"
if trung.is_dir():
    shutil.copy2(src, trung / "minna-ux.js")

SKIP_NAMES = {"output.translated.html"}
copied = 0
injected = 0
skipped = 0

def inject_html(html: Path) -> None:
    global injected, skipped
    if html.name in SKIP_NAMES:
        skipped += 1
        return
    text = html.read_text(encoding="utf-8", errors="surrogatepass")
    if "minna-ux.js" in text:
        skipped += 1
        return
    new_text = text
    n = 0
    if "scriptminnamoi.js" in text:
        new_text, n = re.subn(
            r'(<script[^>]+scriptminnamoi\.js[^>]*>\s*</script>)',
            r'\1<script src="minna-ux.js"></script>',
            text,
            count=1,
            flags=re.IGNORECASE,
        )
    if not n:
        new_text, n = re.subn(
            r"</body>",
            '<script src="minna-ux.js"></script>\n</body>',
            text,
            count=1,
            flags=re.IGNORECASE,
        )
    if n:
        html.write_text(new_text, encoding="utf-8")
        injected += 1
    else:
        html.write_text(text.rstrip() + '\n<script src="minna-ux.js"></script>\n', encoding="utf-8")
        injected += 1

for section in (root / "so_cap", root / "trung_cap"):
    if not section.is_dir():
        continue
    for folder in [section] + sorted(p for p in section.iterdir() if p.is_dir()):
        html_files = [p for p in folder.glob("*.html") if p.name not in SKIP_NAMES]
        if not html_files:
            continue
        shutil.copy2(src, folder / "minna-ux.js")
        copied += 1
        for html in html_files:
            inject_html(html)

print(f"copied to {copied} folders, injected {injected} files, skipped {skipped}")
