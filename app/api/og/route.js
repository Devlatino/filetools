import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "FileFlip").slice(0, 120);
  const description = (
    searchParams.get("description") ||
    "Convert and compress files online for free. No account, everything in the browser."
  ).slice(0, 200);
  const siteName = (searchParams.get("siteName") || "FileFlip").slice(0, 50);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c4a6e",
          background: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
          padding: 48,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
            padding: "12px 24px",
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#0c4a6e",
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            {siteName}
          </span>
        </div>

        {/* Tool title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
