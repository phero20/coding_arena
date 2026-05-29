# API Reference: Auth & Webhooks

The Auth API manages user sessions and synchronization with external identity providers (Clerk).

## 👤 User Identity

### `GET /auth/me`
Fetches the profile of the currently authenticated user.
*   **Auth Required**: Yes
*   **Response**: Returns the `User` object from the relational database.

---

## 🔗 Webhooks

### `POST /auth/webhooks/clerk`
The primary synchronization bridge between Clerk and the SlaveCode database.
*   **Auth Required**: No (Verified via Clerk Signature)
*   **Event Types Handled**:
    *   `user.created`: Initializes the `users` and `user_stats` records.
    *   `user.updated`: Syncs profile changes (Avatar, Username, Name).
    *   `user.deleted`: Sets account status to `inactive` or deletes records.
*   **Security**: Requires the `SVIX-ID`, `SVIX-TIMESTAMP`, and `SVIX-SIGNATURE` headers for verification.
