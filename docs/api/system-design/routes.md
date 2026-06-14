# System Design Routes

The routing layer for system design challenges.

**File Location**: [api/src/routes/system-design/system-design.routes.ts](../../../api/src/routes/system-design/system-design.routes.ts)

## API Endpoints

### 1. Get All System Design Problems
- **Method**: `GET`
- **Path**: `/api/v1/system-design`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `systemDesignController.getAll`
- **Description**: Fetches the paginated grid of system design problems. Supports `limit`, `skip`, and filters like `difficulty` and `tags`.

### 2. Get Single System Design Problem
- **Method**: `GET`
- **Path**: `/api/v1/system-design/:slug`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `systemDesignController.getBySlug`
- **Description**: Fetches the full details of a system design challenge using its SEO-friendly `slug`.

### 3. Create System Design Problem
- **Method**: `POST`
- **Path**: `/api/v1/system-design`
- **Auth Required**: Yes (`requireAuth: true`, plus Admin checks)
- **Controller Action**: `systemDesignController.create`
- **Description**: Internal route used by admins to publish new system design challenges.

### 4. Delete System Design Problem
- **Method**: `DELETE`
- **Path**: `/api/v1/system-design/:id`
- **Auth Required**: Yes (`requireAuth: true`, plus Admin checks)
- **Controller Action**: `systemDesignController.delete`
- **Description**: Hard-deletes a system design problem by its `_id`.
