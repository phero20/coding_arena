import { ImageResponse } from "next/og";
import { OGLayout } from "@/meta/og/OGLayout";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <OGLayout>
          <div style={{ display: "flex", fontSize: 70, fontWeight: "bold", color: "#ffffff", marginBottom: 20, textAlign: "center" }}>
            {`@${username}`}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#ffffff", fontWeight: "normal" }}>
            Profile
          </div>
        </OGLayout>
      </div>
    ),
    { ...size }
  );
}
