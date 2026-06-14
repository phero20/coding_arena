# SEO Module Overview

The **SEO Module** is a critical utility module that generates dynamic `sitemap.xml` files for the frontend application. It aggregates all public entities (problems, contests, and companies) so search engine crawlers can index the platform effectively.

## Architecture

This module acts as a read-only data aggregator. It does not have its own database collection, which is why it lacks a `repositories` folder.

1. **Routes**: Defines the REST API endpoints (`/api/v1/seo/*`) using Hono.
2. **Controllers**: Formats the API response.
3. **Services**: Contains the cross-module orchestration logic, directly calling `ProblemRepository`, `ContestRepository`, and `CompanyRepository` to gather the slugs required for the sitemap.

## Directory Structure

```text
api/src/
├── controllers/seo/
│   └── seo.controller.ts                  # HTTP Request handlers
├── routes/seo/
│   └── seo.routes.ts                      # Hono REST API definitions
└── services/seo/
    └── seo.service.ts                     # Sitemap Aggregation Engine
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Sitemap Aggregation Logic
