# Company Cache Layer

The Company Cache sits in front of the MongoDB database, intercepting calls to the `CompanyService`.

**File**: [api/src/cache/company/company.cache.ts](../../../api/src/cache/company/company.cache.ts)

## `CompanyCache`

Because company profiles and their associated problem lists rarely change day-to-day, the Company module aggressively caches its read operations using the Decorator Pattern over `rawCompanyService`.

### Cache Configuration
- **Global TTL**: 86400 seconds (24 hours).

### Key Cached Operations:

1. **`getCompanies`**
   - **Key**: `company:all`
   - Caches the entire grid-view list of companies.

2. **`getCompanyProblems`**
   - **Key**: `company:problems:{slug}`
   - Caches the heavily hydrated problem array. This prevents the database from performing the heavy `findManyByProblemIds` hydration operation for the next 24 hours.

### Cache Invalidation:
- **`createCompany`**: Whenever an admin script upserts a new company profile, the cache intercepts the write operation and immediately fires `redis.del` for both `company:all` and the specific `company:problems:{slug}`. This ensures the frontend immediately sees the new data without waiting for the 24-hour TTL to expire.
