# API Reference: User & Social

The User API handles profile customization, social graphs (Following), and user discovery.

## 👥 Social Graph

### `POST /follows/:username`
Follows a specific user by their username.
*   **Auth Required**: Yes

### `DELETE /follows/:username`
Unfollows a specific user.
*   **Auth Required**: Yes

### `GET /follows/:username/followers`
Lists all users currently following the specified account.
*   **Auth Required**: No

### `GET /follows/:username/following`
Lists all accounts that the specified user is currently following.
*   **Auth Required**: No

---

## 🔧 Profile Management

### `PATCH /users/profile`
Updates the authenticated user's profile metadata (e.g., social links, biography).
*   **Auth Required**: Yes
*   **Body**: 
    ```json
    {
      "fullName": "string",
      "avatarUrl": "url",
      "githubUsername": "string",
      "linkedinUsername": "string",
      "leetcodeUsername": "string"
    }
    ```

### `GET /users/search`
Searches for users by username or name.
*   **Auth Required**: No
*   **Query Params**: `q` (Search query).
