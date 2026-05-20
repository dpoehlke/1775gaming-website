import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D0D0D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top scarlet bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#CC0000",
          }}
        />
        {/* Main title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: "900",
            color: "#FFFFFF",
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          1775 GAMING
        </div>
        {/* Gold subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#B8860B",
            marginTop: 24,
            letterSpacing: "0.25em",
            textAlign: "center",
          }}
        >
          AI-POWERED MOBILE GAMING
        </div>
        {/* Silver tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#C0C0C0",
            marginTop: 16,
            letterSpacing: "0.15em",
            textAlign: "center",
          }}
        >
          OMNIVERSE: ASCENSION • COMING SOON
        </div>
        {/* Bottom scarlet bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#CC0000",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
