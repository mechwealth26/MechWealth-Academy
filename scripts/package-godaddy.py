"""Build a source-only GoDaddy archive. This script never uploads or deploys."""

import argparse
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIRECTORIES = ("app", "components", "data", "hooks", "lib", "public", "styles")
FILES = ("package.json", "package-lock.json", "next.config.ts", "postcss.config.mjs", "tsconfig.json", "tsconfig.build.json")
SITE_ENV = "NEXT_PUBLIC_SITE_URL=https://mechwealth.com\n"


def package_source(root, output):
    sources = [root / name for name in FILES]
    for directory in DIRECTORIES:
        for path in (root / directory).rglob("*"):
            if any(part.startswith(".") or part in ("node_modules", "__pycache__") for part in path.relative_to(root).parts):
                continue
            if path.is_symlink():
                raise ValueError(f"Refusing to package a symlink: {path.relative_to(root)}")
            if path.is_file():
                sources.append(path)
    for path in sources:
        if path.is_symlink() or not path.is_file():
            raise ValueError(f"Missing or unsafe application file: {path.relative_to(root)}")
    if output.resolve() in (path.resolve() for path in sources):
        raise ValueError("Archive output cannot overwrite an application file")
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(sources):
            archive.write(path, path.relative_to(root).as_posix())
        # Generated public origin only; existing local .env files are never read.
        archive.writestr(".env.production", SITE_ENV)
    with zipfile.ZipFile(output) as archive:
        names = archive.namelist()
        assert "package.json" in names and "package-lock.json" in names
        assert [name for name in names if Path(name).name.startswith(".env")] == [".env.production"]
        assert archive.read(".env.production").decode() == SITE_ENV
        assert archive.testzip() is None
    return names


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / ".godaddy" / "mechwealth-source.zip")
    args = parser.parse_args()
    names = package_source(ROOT, args.output)
    print(f"Created {args.output}: {len(names)} files; no upload performed.")

