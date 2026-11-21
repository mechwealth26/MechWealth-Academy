"""Read-only check of the local working copy against the GoDaddy Git checkout."""
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
outer = root.parent.parent if root.parent.name == ".godaddy" else root
checkout = outer / ".godaddy" / "repository"
left, right = (Path(sys.argv[1]), Path(sys.argv[2])) if len(sys.argv) == 3 else (outer, checkout)
if not left.is_dir() or not right.is_dir():
    sys.exit("Both local source directories are required. Run QA in the Git checkout on CI.")
paths = ["app", "components", "data", "hooks", "lib", "scripts", "styles", "tests", ".github"]
files = {"package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "tsconfig.build.json", "vitest.config.mts", "eslint.config.mjs"}
for base in (left, right):
    for name in paths:
        for path in (base / name).rglob("*"):
            if path.is_file() and "__pycache__" not in path.parts and not path.name.startswith("."):
                files.add(str(path.relative_to(base)))
different = [name for name in sorted(files) if (left / name).exists() != (right / name).exists()
             or ((left / name).is_file() and (left / name).read_bytes() != (right / name).read_bytes())]
if different:
    print("Source copies differ (paths only):\n" + "\n".join(different))
    sys.exit(1)
print("Source copies match. Build and release from .godaddy/repository.")
