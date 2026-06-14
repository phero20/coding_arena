# Academy Database Schema & Repository

The Academy module leverages a **Dual-Database Architecture**, utilizing both MongoDB (Atlas) and PostgreSQL (Neon) to optimize for different types of data loads. The `AcademyRepository` acts as the orchestrator to fetch and write to the correct data layer.

## 1. MongoDB (Curriculum Data)

Because educational content consists of deeply nested, unstructured markdown instructions, boilerplate code snippets, and dynamic test files, the curriculum is stored as JSON documents in MongoDB. 

### Schemas (`api/src/mongo/models/academymodels/`)
- **`AcademyTrackModel`**: Stores metadata for a language track (e.g., name, slug, icon, tags).
- **`AcademyConfigModel`**: Stores the high-level outline of a track, including the array of concepts and exercise slugs required to complete it.
- **`AcademyConceptModel`**: Stores the specific markdown tutorial for a single programming concept. Uses a compound index of `{ trackSlug: 1, conceptSlug: 1 }` for ultra-fast lookups.
- **`AcademyExerciseModel`**: Stores the specific coding challenge. Contains the instruction markdown, the starting code stub (`files`), the hidden test cases, and the solution. Also utilizes the `{ trackSlug: 1, exerciseSlug: 1 }` compound index.

---

## 2. PostgreSQL (User Tracking Data)

While curriculum data is static and nested, tracking a user's progress must be highly transactional, relational, and capable of fast JOINs with the rest of the user's profile and stats. This is handled by PostgreSQL via Drizzle ORM.

### Table: `user_academy_exercises` (`api/src/db/schema.ts`)
This table acts as an intersection tracking log.
- `userId` (text): References the User ID (Clerk ID).
- `trackSlug` (text): e.g., "python"
- `exerciseSlug` (text): e.g., "hello-world"
- `solvedAt` (timestamp): When the exercise was successfully completed.

**Constraints**: It features a composite unique constraint on `(userId, trackSlug, exerciseSlug)` to ensure an exercise is only logged as newly solved once per user.

---

## 3. The `AcademyRepository`

**File**: [api/src/repositories/academy/academy.repository.ts](../../../api/src/repositories/academy/academy.repository.ts)

The repository provides a clean interface to the `AcademyService` so the service doesn't need to know whether data is coming from Postgres or Mongo.

### Responsibilities:
- Fetching JSON documents via `Mongoose` (`.lean()` is used for performance to strip Mongoose wrappers).
- Utilizing Drizzle ORM (`db.insert().onConflictDoNothing()`) to idempotently mark an exercise as solved in Postgres.
- Executing fast `select()` queries with dynamic `where(and(...))` filters to pull a user's solved exercises.
