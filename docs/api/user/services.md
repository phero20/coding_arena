# User Services

The business logic for the platform's social and identity features.

**File Location**: [api/src/services/user/](../../../api/src/services/user/)

## 1. `user.service.ts`
- **`upsertUser`**: Synchronizes Clerk authentication data with the local PostgreSQL database. Ensures that if a user changes their avatar on Clerk, the platform's UI updates accordingly.
- **`getUserByUsername`**: Fast lookup for profile pages.

## 2. `follow.service.ts`
Handles the social network edge logic.
- **`follow`**: Ensures users cannot follow themselves. Creates a follow relationship in the database and atomically increments the follower/following counters on the respective User profiles.
- **`unfollow`**: Reverses the follow relationship and decrements counters safely.
- **`getFollowStatus`**: Checks if the edge exists between two nodes.
