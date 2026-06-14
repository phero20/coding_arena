# React Hooks: Misc & Feature Hooks

The remaining directories and top-level files in `src/hooks/` cover specific application features, utilities, and integrations.

## Practice Mode (`practice/`)
- **`use-problem-filters.ts`**: Manages the local URL state (query parameters) for filtering the global problem set by difficulty, tags, or search query.
- **`use-problem-selection.ts`**: Handles the random "Pick One" problem selection algorithm.
- **`use-roadmap-data.ts`**: Fetches and structures the hierarchical JSON data to render the interactive syllabus/roadmap graph.

## Profile & Auth (`profile/`, `auth/`)
- **`use-profile-settings-form.ts`**: Binds the user settings form (e.g., updating full name, LinkedIn URL) to `react-hook-form` and handles validation via Zod before sending to the `mutations` layer.
- **`use-current-user.ts`**: A wrapper around Clerk's `useUser()` hook that also fetches the synchronized local database ID for the user.

## Shared Utilities (`shared/`)
- **`use-debounce.ts`**: Classic hook to delay the execution of a function or state update (used heavily for the code editor autosave and user search).
- **`use-is-mounted.ts`**: Simple boolean flag to prevent Hydration mismatches between Server Side Rendering (Next.js) and the Client.

## Top-Level Hooks
- **`useChat.ts`**: A secondary variant of the AI chat hook, possibly for global chat or non-system-design contexts.
- **`use-report-bug-form.ts`**: Manages the multi-step bug reporting modal, including dragging and dropping image attachments to Cloudinary.
- **`use-arena-pagination.ts` / `use-solution-pagination.ts`**: Standard pagination logic to handle page numbers and row counts for tables.
- **`use-tracks-filter.ts`**: UI state management for filtering the Academy Tracks by "In Progress" or "Completed".
