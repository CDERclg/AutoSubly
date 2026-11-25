import { ImageResponse } from "next/og";

export const alt = "AutoSubly: Free AI Subtitle Generator & Auto Captions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: 90, background: "#0F172A", color: "white" }}>
        <svg width="260" height="260" viewBox="0 0 512 512">
          <rect width="512" height="512" rx="120" fill="#1E293B" />
          <path d="M148 384 L256 128 L364 384" fill="none" stroke="#FFFFFF" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="104" y="296" width="304" height="46" rx="23" fill="#FF5A36" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70 }}>
          <div style={{ fontSize: 96, fontWeight: 800 }}>AutoSubly</div>
          <div style={{ fontSize: 44, color: "#FF5A36", fontWeight: 700, marginTop: 10 }}>Free AI Subtitle Generator</div>
          <div style={{ fontSize: 32, color: "#CBD5E1", marginTop: 18 }}>Accurate subtitles in seconds.</div>
        </div>
      </div>
    ),
    size
  );
}
