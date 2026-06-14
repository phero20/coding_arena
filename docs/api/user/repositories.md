# User Repositories

The repositories use PostgreSQL via Drizzle ORM to maintain strict relational integrity for the social graph.

**File Location**: [api/src/repositories/user/](../../../api/src/repositories/user/)

## 1. `user.repository.ts`
- **`upsert`**: Uses PostgreSQL `ON CONFLICT (clerk_id) DO UPDATE` to gracefully handle Clerk webhooks without throwing duplicate key errors.
- **`findByUsername`**: Standard indexed `SELECT` query.

## 2. `follow.repository.ts`
- **`createFollow`**: Inserts a new row into the `follows` junction table.
- **`deleteFollow`**: Removes the row from the `follows` junction table.
- **`getFollowers` / `getFollowing`**: Performs `JOIN` queries between the `users` table and the `follows` table to return the actual user objects (avatars, usernames) rather than just IDs.
