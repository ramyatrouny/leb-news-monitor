import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "linear-gradient(135deg, #0a0a14, #1a1a2e)",
          borderRadius: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 320,
            fontWeight: 800,
            color: "#ededed",
            lineHeight: 1,
            letterSpacing: -10,
          }}
        >
          L
        </span>
        <div
          style={{
            position: "absolute",
            top: 72,
            right: 96,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#ef4444",
            boxShadow: "0 0 32px #ef4444",
          }}
        />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
