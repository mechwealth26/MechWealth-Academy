"""Store an owner-created GoDaddy PAT without putting it in shell history."""

import getpass
from pathlib import Path
import subprocess

CLI = Path(__file__).resolve().parents[1] / ".godaddy/bin/gddy"


def main():
    token = getpass.getpass("GoDaddy read-only hosting token (hidden): ")
    if not token:
        raise SystemExit("No token supplied; nothing stored.")
    subprocess.run(
        [str(CLI), "pat", "add", "--env", "prod", "MECHWEALTH hosting read"],
        input=token + "\n", text=True, check=True,
    )


if __name__ == "__main__":
    main()
