# Company Routes

The Company routes expose the API endpoints used to list companies and fetch their associated coding problems.

**File Location**: [api/src/routes/company/company.routes.ts](../../../api/src/routes/company/company.routes.ts)

## Dependencies Injected

The route registration function `registerCompanyRoutes` expects:
- `companyController`: Handles the HTTP logic.

---

## API Endpoints

### 1. Get All Companies
- **Method**: `GET`
- **Path**: `/api/v1/companies/`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `companyController.getCompanies`
- **Description**: Fetches a lightweight list of all available companies to display on the main grid.

### 2. Get Company Problems
- **Method**: `GET`
- **Path**: `/api/v1/companies/:slug/problems`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `companyController.getCompanyProblems`
- **Description**: Fetches the detailed profile of a specific company (via its `slug`) and simultaneously hydrates the entire array of coding problems associated with it.

### 3. Create/Update Company
- **Method**: `POST`
- **Path**: `/api/v1/companies/`
- **Auth Required**: No (`requireAuth: false`) *Note: This endpoint is primarily used by backend upload/seed scripts.*
- **Validation**: Zod `createCompanySchema`.
- **Controller Action**: `companyController.createCompany`
- **Description**: Safely upserts a company profile. If the `slug` already exists, it updates the profile instead of throwing a duplicate key error.
