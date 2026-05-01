import { HomeContent } from "@/components/home/HomeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SlaveCode | Real-time Competitive Programming Platform",
  description: "The ultimate platform for competitive programmers. Solve complex problems in real-time, climb the global leaderboard, and prove your engineering excellence.",
  keywords: ["slavecode", "competitive programming", "algorithm challenges", "real-time coding battle"],
};

export default function HomePage() {
  return <HomeContent />;
}
