import { academyTracksMeta } from "@/meta/academy/static";

export const metadata = academyTracksMeta;

export default function AcademyTracksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
