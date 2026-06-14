# React Hooks: Queries

The `queries/` directory abstracts all data-fetching operations using `useQuery` from React Query (@tanstack/react-query). 

These hooks define strict query keys, caching behavior, and stale times.

## Files

### Core Domain Queries
- **`use-problem.queries.ts`**: Fetches problem lists, specific problem descriptions, hidden boilerplates, and test cases. Often configured with long `staleTime` since problems rarely change.
- **`use-company.queries.ts`**: Fetches company lists and their associated `problem_ids`.
- **`use-taxonomy.queries.ts`**: Fetches algorithm categories (Arrays, Trees, etc.).
- **`use-contest.queries.ts`**: Fetches upcoming external contests (LeetCode, Codeforces) synced by the Contest Worker.

### Social & Interaction Queries
- **`use-follow.queries.ts`** & **`use-follow.mutations.ts`**: Fetches followers/following lists and handles the follow/unfollow toggle.
- **`use-social-registry.ts`**: Fetches public user registries for the community page.
- **`use-user-search.queries.ts`**: Handles the debounced typeahead search bar to find other users by username.

### User & Stats Queries
- **`use-stats.queries.ts`**: Fetches a user's total points, streaks, and difficulty breakdowns.
- **`use-profile.mutations.ts`**: (Located here due to tight coupling) Handles profile detail updates.

### Submissions & Solutions
- **`use-submission.queries.ts`**: Extremely important hook. It polls the `/submissions/:id` endpoint continuously while a submission status is `PENDING` or `RUNNING`, updating the UI the exact millisecond the code evaluation finishes.
- **`use-solution.queries.ts`**: Fetches community-submitted solutions with pagination and sorting (e.g., most upvoted).

### Feature Specific Queries
- **`use-academy.queries.ts`**: Fetches tracks, exercises, and user completion statuses.
- **`use-arena.queries.ts`**: Fetches active matches for the global Arena lobby.
- **`use-workspace.queries.ts`** & **`use-system-design.queries.ts`**: Fetches saved system design diagrams and Excalidraw JSON payloads.
- **`use-seo.queries.ts`**: Dynamically fetches metadata (titles, descriptions) for dynamic routes to inject into `next/head`.
