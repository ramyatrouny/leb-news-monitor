import { ImageResponse } from "next/og";

export const alt = "LEB Monitor — Live Lebanon-Israel Conflict News Feed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Red accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #ef4444, #dc2626, #ef4444)",
          }}
        />

        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 12px #ef4444",
            }}
          />
          <span
            style={{
              color: "#ef4444",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            LIVE
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ededed",
            letterSpacing: -2,
            marginBottom: 16,
            display: "flex",
          }}
        >
          LEB Monitor
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#888",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          Real-time conflict news from 47+ sources
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["Lebanon", "Israel", "UNIFIL", "Humanitarian", "Breaking News"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#aaa",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            color: "#555",
            fontSize: 16,
            display: "flex",
          }}
        >
          lebmonitor.com
        </div>
      </div>
    ),
    { ...size }
  );
}
