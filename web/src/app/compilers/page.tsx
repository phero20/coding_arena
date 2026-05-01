import { CompilerWorkspace } from "@/components/compiler/CompilerWorkspace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compiler Playground | SlaveCode",
  description: "A professional-grade multi-language compiler playground powered by Wandbox.",
};

export default function CompilerPage() {
  return <CompilerWorkspace />;
}
