import { ImageResponse } from "next/og";
import { OGLayout } from "@/meta/og/OGLayout";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OGLayout>
        <div style={{ fontSize: 40, color: "#ffffff", fontWeight: "bold", marginBottom: 20 }}>
          Academy Tracks : Master Programming Languages
        </div>
      </OGLayout>
    ),
    { ...size }
  );
}
