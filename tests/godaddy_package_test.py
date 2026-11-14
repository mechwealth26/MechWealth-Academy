import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location("packager", Path(__file__).resolve().parents[1] / "scripts/package-godaddy.py")
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)

login_spec = importlib.util.spec_from_file_location("login", Path(__file__).resolve().parents[1] / "scripts/godaddy-login.py")
login = importlib.util.module_from_spec(login_spec)
login_spec.loader.exec_module(login)


class GoDaddySourcePackageTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)
        for name in packager.FILES:
            (self.root / name).write_text("{}")
        for name in packager.DIRECTORIES:
            (self.root / name).mkdir()
        self.output = self.root / ".godaddy/source.zip"

    def test_includes_application_and_generates_only_the_confirmed_public_origin(self):
        (self.root / "app/page.tsx").write_text("export default function Page() {}")
        names = packager.package_source(self.root, self.output)
        self.assertIn("app/page.tsx", names)
        with zipfile.ZipFile(self.output) as archive:
            self.assertEqual(archive.read(".env.production").decode(), "NEXT_PUBLIC_SITE_URL=https://mechwealth.com\n")

    def test_excludes_local_secrets_ignored_folders_tests_and_reports(self):
        for name in (".env.local", ".env.production", "public/.env", ".vercel/project.json", ".godaddy/credentials", "node_modules/fake.txt", "tests/fake.ts", "docs/report.md"):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("SENTINEL_SECRET_MUST_NOT_SHIP")
        names = packager.package_source(self.root, self.output)
        with zipfile.ZipFile(self.output) as archive:
            self.assertFalse(any(b"SENTINEL_SECRET_MUST_NOT_SHIP" in archive.read(name) for name in names))
        self.assertEqual((self.root / ".env.production").read_text(), "SENTINEL_SECRET_MUST_NOT_SHIP")

    def test_rejects_a_symlink_to_a_private_file(self):
        secret = self.root / ".env.local"
        secret.write_text("PRIVATE")
        (self.root / "public/leak.txt").symlink_to(secret)
        with self.assertRaisesRegex(ValueError, "symlink"):
            packager.package_source(self.root, self.output)
        self.assertFalse(self.output.exists())


class GoDaddyLoginTests(unittest.TestCase):
    def test_supplies_the_token_on_stdin_instead_of_command_arguments(self):
        with patch.object(login.getpass, "getpass", return_value="fake-test-token"), patch.object(login.subprocess, "run") as run:
            login.main()
        args, kwargs = run.call_args
        self.assertNotIn("fake-test-token", args[0])
        self.assertEqual(kwargs["input"], "fake-test-token\n")
        self.assertTrue(kwargs["check"])

    def test_empty_input_does_not_store_anything(self):
        with patch.object(login.getpass, "getpass", return_value=""), patch.object(login.subprocess, "run") as run:
            with self.assertRaises(SystemExit):
                login.main()
        run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
