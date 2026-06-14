# Company Repository

The Company Repository manages the interactions with the `companies` collection in MongoDB.

**File**: [api/src/repositories/company/company.repository.ts](../../../api/src/repositories/company/company.repository.ts)

## Repository Methods

Like other domain repositories, it extends the `MongoBaseRepository` to inherit generic utility functions and caching adapters, while explicitly implementing its own interface `ICompanyRepository`.

### 1. `getCompanies` (Grid Optimization)
This method powers the `/api/v1/companies` endpoint. 
**Optimization Note**: Some companies (like Meta or Google) have hundreds of problem IDs attached to them. Sending this massive array for every single company on the grid view would be incredibly slow.
Therefore, this method explicitly drops the array at the database level using a MongoDB Projection:
`.select("-problem_ids")`
This ensures the query remains blazing fast, returning only the slugs, names, and logo URLs.

### 2. `getCompanyBySlug`
This method instantly fetches a single company document. Unlike the grid view, this method *does* pull the full `problem_ids` array, because the `CompanyService` immediately needs it to hydrate the problem data.

### 3. `createOrUpdate`
A safe upsert method primarily used by the backend seed scripts. It uses MongoDB's `findOneAndUpdate` with `{ upsert: true }` so that if a company `slug` already exists, it updates the document with new problem IDs rather than throwing a duplicate key exception.
