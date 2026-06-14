# Academy Models MongoDB Collection

**Purpose:**
The `/academymodels/` directory contains four nearly identical schema configurations used for the "Academy" (structured learning paths) feature.

## Shared Architecture

All four models use the exact same flexible, NoSQL-friendly schema design:
- **`slug`** (`String`, Unique): The identifier (e.g., `'javascript-basics'`).
- **`data`** (`Mixed`): A completely schemaless JSON object containing the entire tree, configuration, or exercise content.

This design was chosen to allow the frontend to rapidly iterate on the Academy UI without requiring constant backend schema migrations.

### The 4 Collections:
1. **`AcademyTrack`**: Stores the high-level roadmap (e.g., "Frontend Developer Track").
2. **`AcademyConcept`**: Stores the theoretical lessons within a track.
3. **`AcademyExercise`**: Stores the interactive coding challenges tied to a concept.
4. **`AcademyConfig`**: Stores global settings for the Academy module.
