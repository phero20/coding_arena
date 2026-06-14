# React Hooks: Stats & Charts

The `stats/` directory is responsible for fetching, formatting, and preparing data for the complex Recharts and Activity Heatmaps on user profiles.

## Files

- **`use-activity-timeline.ts`**: Formats the raw `user_activity` PostgreSQL rows into the exact nested array structure required by the "GitHub-style" green contribution heatmap component.
- **`use-activity-feed.ts`**: Fetches the recent actions (e.g., "User solved Two Sum", "User joined Arena") to build a scrolling social feed.
- **`use-activity-pagination.ts`**: Handles "Load More" logic for the feed.
- **`use-difficulty-metrics.ts`**: Calculates the percentages of Easy/Medium/Hard problems solved to power donut charts and progress rings.
- **`use-leaderboard.ts`**: Manages sorting (by points, streak, or arena wins) and pagination for the global leaderboard page.
- **`use-leetcode-metrics.ts`**: Connects to the external LeetCode proxy endpoint to display a user's synced LeetCode stats on their Coding Arena profile.
