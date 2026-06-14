# Taxonomy Routes

The routing layer for the platform's tagging system.

**File Location**: [api/src/routes/taxonomy/taxonomy.routes.ts](../../../api/src/routes/taxonomy/taxonomy.routes.ts)

## API Endpoints

### 1. Get All Tags
- **Method**: `GET`
- **Path**: `/api/v1/taxonomy/tags`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `taxonomyController.getAllTags`
- **Description**: Returns a flattened, alphabetical list of all tags for dropdowns and filters.

### 2. Get Tag By Slug
- **Method**: `GET`
- **Path**: `/api/v1/taxonomy/tags/:slug`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `taxonomyController.getTagBySlug`
- **Description**: Returns detailed info about a specific tag.

### 3. Create Tag
- **Method**: `POST`
- **Path**: `/api/v1/taxonomy/tags`
- **Auth Required**: Yes (`requireAuth: true`, plus Admin checks)
- **Controller Action**: `taxonomyController.createTag`
- **Description**: Internal route used by admins to add a new category.

### 4. Update Tag
- **Method**: `PUT`
- **Path**: `/api/v1/taxonomy/tags/:id`
- **Auth Required**: Yes (`requireAuth: true`, plus Admin checks)
- **Controller Action**: `taxonomyController.updateTag`
- **Description**: Internal route used by admins to rename a tag or update its slug.

### 5. Delete Tag
- **Method**: `DELETE`
- **Path**: `/api/v1/taxonomy/tags/:id`
- **Auth Required**: Yes (`requireAuth: true`, plus Admin checks)
- **Controller Action**: `taxonomyController.deleteTag`
- **Description**: Internal route used by admins to remove a tag.
