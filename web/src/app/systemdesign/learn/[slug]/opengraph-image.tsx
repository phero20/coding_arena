export const dynamic = "force-dynamic";
import { ImageResponse } from "next/og";
import { OGLayout } from "@/meta/og/OGLayout";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return new ImageResponse(
    (
      <OGLayout>
        <div style={{ fontSize: 70, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 20, textAlign: "center" }}>
          {title}
        </div>
        <div style={{ fontSize: 40, color: "#ffffff", fontWeight: 600 }}>
          System Design Principles
        </div>
      </OGLayout>
    ),
    { ...size }
  );
}
