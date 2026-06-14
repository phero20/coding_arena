# Company Services

The `CompanyService` contains a critical design pattern for avoiding data duplication: Cross-Repository Hydration.

**File**: [api/src/services/company/company.service.ts](../../../api/src/services/company/company.service.ts)

## Key Responsibilities

### Cross-Repository Hydration
Instead of storing the full `Problem` document inside the `Company` collection (which would lead to massive data duplication and stale data if a problem's difficulty or title changes), the Company schema only stores an array of raw string `problem_ids`.

The `CompanyService` uses Awilix Dependency Injection to pull in both the `ICompanyRepository` and the `IProblemRepository`.

In `getCompanyProblems(slug)`:
1. It fetches the lightweight company document via `companyRepository.getCompanyBySlug(slug)`.
2. It takes the `company.problem_ids` array and passes it to `problemRepository.findManyByProblemIds(company.problem_ids)`.
3. This guarantees the frontend receives a fully hydrated list of problems that accurately reflects the exact state of the core `problems` collection at that millisecond.
4. It returns a merged object containing both the `company` metadata (name, logo) and the hydrated `problems` array.
