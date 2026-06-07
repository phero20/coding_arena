import { ImageResponse } from "next/og";
import { OGLayout } from "@/meta/og/OGLayout";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OGLayout>
        <div style={{ fontSize: 70, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 20, textAlign: "center" }}>
          Global Competitions
        </div>
        <div style={{ fontSize: 40, color: "#ffffff", fontWeight: 600 }}>
          Contest Tracking Hub
        </div>
      </OGLayout>
    ),
    { ...size }
  );
}
