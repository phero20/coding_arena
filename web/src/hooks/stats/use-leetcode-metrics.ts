import { useMemo } from "react";
import { type LeetCodeStats } from "@/types/stats";
import { LEETCODE_TOTALS } from "@/lib/constants";

interface UseLeetCodeMetricsProps {
  stats: LeetCodeStats;
  size: number;
  strokeWidth: number;
  gap: number;
}

export function useLeetCodeMetrics({ stats, size, strokeWidth, gap }: UseLeetCodeMetricsProps) {
  const { easy, medium, hard, total } = stats.solved;

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // 270 degree arc is 75% of circumference
  const arcLength = useMemo(() => circumference * 0.75, [circumference]);

  const segments = useMemo(() => {
    const TOTAL_EASY = LEETCODE_TOTALS.EASY;
    const TOTAL_MED = LEETCODE_TOTALS.MEDIUM;
    const TOTAL_HARD = LEETCODE_TOTALS.HARD;
    const GRAND_TOTAL = TOTAL_EASY + TOTAL_MED + TOTAL_HARD;

    // Calculate track ratios based on total pool size
    const easyTrackLen = (TOTAL_EASY / GRAND_TOTAL) * arcLength;
    const medTrackLen = (TOTAL_MED / GRAND_TOTAL) * arcLength;
    const hardTrackLen = (TOTAL_HARD / GRAND_TOTAL) * arcLength;

    // Calculate progress within each track
    const easyProgress = (easy / TOTAL_EASY) * easyTrackLen;
    const medProgress = (medium / TOTAL_MED) * medTrackLen;
    const hardProgress = (hard / TOTAL_HARD) * hardTrackLen;

    return [
      {
        id: "easy",
        label: "Easy",
        count: easy,
        total: TOTAL_EASY,
        color: "text-difficulty-easy",
        cssVar: "var(--difficulty-easy)",
        trackLen: easyTrackLen,
        progress: easyProgress,
        rotate: 0,
      },
      {
        id: "medium",
        label: "Medium",
        count: medium,
        total: TOTAL_MED,
        color: "text-difficulty-medium",
        cssVar: "var(--difficulty-medium)",
        trackLen: medTrackLen,
        progress: medProgress,
        rotate: (TOTAL_EASY / GRAND_TOTAL) * 270,
      },
      {
        id: "hard",
        label: "Hard",
        count: hard,
        total: TOTAL_HARD,
        color: "text-difficulty-hard",
        cssVar: "var(--difficulty-hard)",
        trackLen: hardTrackLen,
        progress: hardProgress,
        rotate: ((TOTAL_EASY + TOTAL_MED) / GRAND_TOTAL) * 270,
      },
    ];
  }, [easy, medium, hard, arcLength]);

  return {
    radius,
    circumference,
    arcLength,
    segments,
    totalSolved: total,
    globalTotal: LEETCODE_TOTALS.TOTAL 
  };
}
