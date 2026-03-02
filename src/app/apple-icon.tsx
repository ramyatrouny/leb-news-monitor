import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0a0a14",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#ededed",
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          L
        </span>
        {/* Live dot */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 30,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#ef4444",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
