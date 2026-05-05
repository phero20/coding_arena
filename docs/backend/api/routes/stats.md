# API Reference: Stats & Leaderboards

The Stats API provides analytics, progress tracking, and global rankings for all users.

## 📊 User Analytics

### `GET /stats/profile/:username`
Retrieves a comprehensive performance breakdown for a specific user.
*   **Auth Required**: No (Public Profiles)
*   **Response**: 
    ```json
    {
      "totalSolved": number,
      "difficultyBreakdown": { "Easy": 10, "Medium": 5, "Hard": 2 },
      "totalPoints": number,
      "streak": number,
      "activityGraph": [...]
    }
    ```

---

## 🏆 Rankings

### `GET /stats/leaderboard`
Fetches the global leaderboard.
*   **Auth Required**: No
*   **Ranking Logic**: Sorted primarily by `total_points` (Relational Layer).
