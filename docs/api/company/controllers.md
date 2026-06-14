# Company Controller

The `CompanyController` handles standard routing of HTTP payloads to the `CompanyService`.

**File**: [api/src/controllers/company/company.controller.ts](../../../api/src/controllers/company/company.controller.ts)

## `CompanyController`

Like other controllers, it extends `BaseController` and wraps service responses in an `ApiResponse.success(data)` payload to ensure standard formatting.

### Actions:

1. **`getCompanies`**
   - **Validation**: None (Public endpoint).
   - **Action**: Delegates to `companyService.getCompanies()`.

2. **`getCompanyProblems`**
   - **Validation**: Extracts `slug` from the URL parameters.
   - **Action**: Passes the `slug` to `companyService.getCompanyProblems()`.

3. **`createCompany`**
   - **Validation**: Extracts the Zod-validated `CreateCompanyInput` from the request body.
   - **Action**: Delegates to `companyService.createCompany()`.
