# User Routes

The routing layer for identity, profiles, and social networking.

**File Location**: [api/src/routes/user/](../../../api/src/routes/user/)

## 1. User Identity Routes (`user.routes.ts`)
- **`POST /api/v1/user/sync`**: Webhook endpoint called by Clerk when a user signs up or updates their profile. Creates/updates the user record in the local database.

## 2. Public Profile Routes (`profile.routes.ts`)
- **`GET /api/v1/profile/:username`**: Fetches the public-facing profile information for a specific user (username, avatar, bio).
- **`PUT /api/v1/profile/`**: Updates the authenticated user's own profile (bio, social links).

## 3. Social Follow Routes (`follow.routes.ts`)
- **`POST /api/v1/follow/:targetUserId`**: Follows another user.
- **`DELETE /api/v1/follow/:targetUserId`**: Unfollows another user.
- **`GET /api/v1/follow/:username/followers`**: Lists the followers of a user.
- **`GET /api/v1/follow/:username/following`**: Lists who a user is following.
- **`GET /api/v1/follow/status/:targetUserId`**: Checks if the currently authenticated user is following the target user.
