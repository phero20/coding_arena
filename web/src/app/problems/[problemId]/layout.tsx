export { generateProblemMetadata as generateMetadata } from "@/meta/problems/dynamic";

// The layout simply renders the children (the "use client" page.tsx)
export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
