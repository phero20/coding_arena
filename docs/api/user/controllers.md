# User Controllers

Controllers for user identity and social graphs.

**File Location**: [api/src/controllers/user/](../../../api/src/controllers/user/)

## Actions

### `user.controller.ts`
- **`syncUser`**: Validates the incoming Clerk webhook using Svix cryptographic signatures. If valid, passes the parsed `id`, `email`, and `username` to the service layer.

### `profile.controller.ts`
- **`getProfile`**: Extracts the `username` path parameter to fetch public details.
- **`updateProfile`**: Extracts `bio`, `githubUrl`, etc., from the request body to update the authenticated user's profile.

### `follow.controller.ts`
- **`followUser` / `unfollowUser`**: Extracts the `targetUserId` from the path and the authenticated user's ID from the context.
- **`getFollowers` / `getFollowing`**: Handles pagination parameters (`skip`, `limit`) and passes them to the social graph service.
