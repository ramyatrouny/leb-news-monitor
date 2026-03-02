import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0a0a14",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* "L" lettermark */}
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#ededed",
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          L
        </span>
        {/* Live dot — red accent */}
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#ef4444",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
