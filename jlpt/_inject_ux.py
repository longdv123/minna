# Copy jlpt-ux.js into each quiz folder and append a script tag before </body>.
from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parent
src = root / "jlpt-ux.js"
if not src.exists():
    raise SystemExit("missing jlpt-ux.js")

copied = 0
injected = 0
skipped = 0

for folder in sorted(p for p in root.iterdir() if p.is_dir()):
    html_files = list(folder.glob("*.html"))
    if not html_files:
        continue
    shutil.copy2(src, folder / "jlpt-ux.js")
    copied += 1
    for html in html_files:
        text = html.read_text(encoding="utf-8", errors="surrogatepass")
        if "jlpt-ux.js" in text:
            skipped += 1
            continue
        new_text, n = re.subn(
            r"</body>",
            '<script src="jlpt-ux.js"></script>\n</body>',
            text,
            count=1,
            flags=re.IGNORECASE,
        )
        if n:
            html.write_text(new_text, encoding="utf-8")
            injected += 1
        else:
            print("no </body>:", html)

print(f"copied to {copied} folders, injected {injected} files, already had script {skipped}")
