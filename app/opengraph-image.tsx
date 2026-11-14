import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Sitewide Open Graph image (1200×630), generated at build time.
 * Individual routes can override by adding their own opengraph-image file.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MECHWEALTH Trading Academy — an engineering approach to markets";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/mechwealth-logo.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b0b09 0%, #14120a 60%, #1c1808 100%)",
          color: "#f4f2ec",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#e8c96a",
            marginBottom: 28,
          }}
        >
          {/* ImageResponse renders this embedded SVG without an external fetch. */}
          <img src={logoSrc} width={70} height={70} alt="" />
          MECHWEALTH TRADING ACADEMY
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          An engineering approach to markets.
        </div>
        <div
          style={{
            marginTop: 36,
            height: 4,
            width: 220,
            background: "#e8c96a",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 26,
            color: "#cfccc2",
          }}
        >
          Observe · Define · Test · Learn · Improve
        </div>
      </div>
    ),
    size
  );
}
