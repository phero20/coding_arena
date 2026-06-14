# Deployment Architecture

This document provides a **UML Deployment Diagram** illustrating the physical and logical hardware infrastructure that runs the SlaveCode ecosystem. It maps out exactly where each Docker container, backend service, and database lives across various cloud providers (Vercel, GCP, Azure, and managed DBaaS platforms).

```mermaid
flowchart TB

    %% Styling
    classDef gcp fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff;
    classDef azure fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff;
    classDef vercel fill:#000000,stroke:#fff,stroke-width:2px,color:#fff;
    classDef neon fill:#00e599,stroke:#000,stroke-width:2px,color:#000;
    classDef mongo fill:#13aa52,stroke:#fff,stroke-width:2px,color:#fff;
    classDef aiven fill:#ff3366,stroke:#fff,stroke-width:2px,color:#fff;
    classDef saas fill:#333333,stroke:#fff,stroke-dasharray: 5 5,color:#fff;

    %% --------------------------------
    %% Frontend Deployment (Vercel)
    %% --------------------------------
    subgraph VercelCloud ["Vercel Edge Network"]
        direction TB
        Frontend["Web Client\n(Next.js App Router)"]:::vercel
    end

    %% --------------------------------
    %% Primary Backend Deployment (GCP)
    %% --------------------------------
    subgraph GCP ["Google Cloud Platform (Compute Engine VMs)"]
        direction TB
        HonoAPI["Hono API Server\n(Node/Bun Process)"]:::gcp
        GoArena["Arena Hub\n(Golang Binary)"]:::gcp
        Workers["BullMQ Workers\n(Node/Bun Processes)"]:::gcp
    end

    %% --------------------------------
    %% Execution Sandbox Deployment (Azure)
    %% --------------------------------
    subgraph AzureCloud ["Microsoft Azure (Virtual Machines)"]
        direction TB
        Judge0["Judge0 Engine\n(Dockerized Code Sandbox)"]:::azure
    end

    %% --------------------------------
    %% Managed Database Providers
    %% --------------------------------
    subgraph DBaaS ["Managed Data Infrastructure"]
        NeonDB[("Neon.tech\n(Serverless PostgreSQL)")]:::neon
        MongoAtlas[("MongoDB Atlas\n(Managed NoSQL Cluster)")]:::mongo
        AivenValkey[("Aiven Valkey\n(Managed Redis Replacement)")]:::aiven
    end

    %% --------------------------------
    %% Third Party SaaS
    %% --------------------------------
    subgraph SaaS ["Third-Party SaaS"]
        Clerk("Clerk\n(Identity & Auth)"):::saas
        AWSBedrock("AWS Bedrock\n(DeepSeek / Claude LLMs)"):::saas
    end

    %% ==========================================
    %% Physical Network Connections
    %% ==========================================

    %% User / Edge Traffic
    Internet((Internet User)) --> Frontend

    %% Frontend to Backend (Cross-Cloud)
    Frontend -- "HTTPS REST (Public IP)" --> HonoAPI
    Frontend -- "WSS Secure WebSockets" --> GoArena

    %% Auth Flow
    Frontend -- "OAuth Tokens" --> Clerk
    Clerk -- "User Webhooks" --> HonoAPI

    %% Backend to Database (VPC Peering / Public IP)
    HonoAPI -- "SQL / TCP" --> NeonDB
    HonoAPI -- "Mongoose / TCP" --> MongoAtlas
    HonoAPI -- "Redis Protocol" --> AivenValkey

    GoArena -- "Redis Protocol (Lua Scripts)" --> AivenValkey
    
    Workers -- "Redis Protocol (Job Queue)" --> AivenValkey
    Workers -- "SQL / TCP" --> NeonDB
    Workers -- "Mongoose / TCP" --> MongoAtlas

    %% Backend to Execution Sandbox (Cross-Cloud)
    Workers -- "HTTP Post (Untrusted Code)" --> Judge0

    %% Backend to AI SaaS
    HonoAPI -- "AWS SDK (HTTPS)" --> AWSBedrock
    Workers -- "AWS SDK (HTTPS)" --> AWSBedrock

```

---

## Infrastructure Breakdown

### 1. Vercel (Frontend Hosting)
The Next.js React application is deployed to **Vercel's Edge Network**. Vercel automatically distributes the static assets globally across CDNs and executes any Server-Side Rendered (SSR) pages via Serverless Functions.

### 2. Google Cloud Platform (Primary Backend)
The core backend logic runs on **GCP Virtual Machines (Compute Engine)**. 
- **Hono API**: Handles all standard REST traffic and routing.
- **Go Arena**: Handles thousands of simultaneous persistent WebSocket connections for multiplayer matches. GCP is chosen here to provide raw compute and network throughput without Serverless timeout restrictions.
- **BullMQ Workers**: Background processes sitting on GCP that pull heavy jobs off the Redis queue.

### 3. Microsoft Azure (Execution Sandbox)
The **Judge0 Code Execution Engine** runs in isolated Docker containers on **Azure VMs**. Keeping the execution sandbox physically separated on an entirely different cloud provider (Azure) from the primary databases and API (GCP) drastically reduces the security "blast radius" if a malicious user manages to escape the Docker sandbox using a zero-day exploit.

### 4. Managed Database Providers (DBaaS)
Rather than hosting databases manually on VMs, the data layer uses specialized managed services:
- **Neon.tech**: Provides a highly-scalable, serverless PostgreSQL instance for relational data (Users, Stats, Follows).
- **MongoDB Atlas**: A fully managed cloud NoSQL database for heavy document storage (Problems, Hidden Tests, Execution Logs).
- **Aiven Valkey**: Valkey (an open-source fork of Redis) hosted by Aiven. It powers the extremely high-throughput Pub/Sub messaging required between the GCP BullMQ Workers and the Go Arena WebSocket server, as well as the API cache.

### 5. Third-Party SaaS
- **Clerk**: Handles all user authentication and identity verification at the edge.
- **AWS Bedrock**: The managed AI service hosted by Amazon Web Services, providing API access to DeepSeek and Claude LLMs without needing to provision expensive GPU clusters.
