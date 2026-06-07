import { ImageResponse } from "next/og";
import { OGLayout } from "@/meta/og/OGLayout";

export const alt = "SlaveCode - The Ultimate Platform for Software Engineers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OGLayout>
        <div
          style={{
            fontSize: 48,
            color: "#ffffff",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
            lineHeight: 1.2,
          }}
        >
          The Ultimate Platform for Software Engineers
        </div>
      </OGLayout>
    ),
    { ...size }
  );
}
