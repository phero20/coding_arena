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
        <div style={{ fontSize: 40, color: "#ffffff", fontWeight: "bold", marginBottom: 20 }}>
          {`Academy Track : ${title}`}
        </div>
      </OGLayout>
    ),
    { ...size }
  );
}
