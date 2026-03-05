import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "linear-gradient(135deg, #0a0a14, #1a1a2e)",
          borderRadius: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: "#ededed",
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          L
        </span>
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 36,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#ef4444",
            boxShadow: "0 0 16px #ef4444",
          }}
        />
      </div>
    ),
    { width: 192, height: 192 }
  );
}
