export interface PrebuiltTemplate {
  id: string;
  name: string;
  description: string;
  category: "Data Model" | "Flow Diagram" | "Architecture Diagram" | "Sequence Diagram";
  difficulty: "Basic" | "Intermediate" | "Advanced";
  icons: string[]; // List of icons used (for the card preview tags)
  nodes: Array<{
    id: string;
    label: string;
    icon?: string;
    parentId?: string;
    align?: "start" | "middle" | "end";
  }>;
  groups: Array<{
    id: string;
    label: string;
    icon?: string;
    parentId?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    id: "serverless-rest-api",
    name: "Serverless Video Transcoding Pipeline",
    description: "An automated, event-driven video transcoding pipeline using AWS Elemental MediaConvert, event orchestrations, and CDN distribution.",
    category: "Architecture Diagram",
    difficulty: "Advanced",
    icons: ["aws-s3", "aws-lambda", "elemental-mediaconvert", "aws-cloudfront", "aws-cloudwatch", "aws-eventbridge", "aws-sns"],
    groups: [],
    nodes: [
      { id: "s3-source", label: "Amazon S3 (source)", icon: "aws-s3" },
      { id: "lambda-submit", label: "AWS Lambda (job submit)", icon: "aws-lambda" },
      { id: "mediaconvert", label: "AWS Elemental MediaConvert", icon: "elemental-mediaconvert" },
      { id: "s3-dest", label: "Amazon S3 (destination)", icon: "aws-s3" },
      { id: "cloudfront", label: "Amazon CloudFront", icon: "aws-cloudfront" },
      { id: "cloudwatch", label: "Amazon CloudWatch", icon: "aws-cloudwatch" },
      { id: "eventbridge", label: "Amazon EventBridge", icon: "aws-eventbridge" },
      { id: "lambda-complete", label: "AWS Lambda (job complete)", icon: "aws-lambda" },
      { id: "sns", label: "Amazon Simple Notification Service", icon: "aws-sns" }
    ],
    edges: [
      { from: "s3-source", to: "lambda-submit" },
      { from: "lambda-submit", to: "mediaconvert" },
      { from: "mediaconvert", to: "s3-dest" },
      { from: "mediaconvert", to: "cloudwatch" },
      { from: "mediaconvert", to: "eventbridge" },
      { from: "s3-dest", to: "cloudfront" },
      { from: "s3-dest", to: "lambda-complete" },
      { from: "eventbridge", to: "lambda-complete" },
      { from: "lambda-complete", to: "sns" }
    ]
  },
  {
    id: "multi-az-webapp",
    name: "Highly Available Multi-AZ Web Application",
    description: "A standard enterprise web architecture featuring Route 53 DNS routing, an Application Load Balancer in public subnets, and auto-scaled EC2 web servers backed by Amazon Aurora in isolated private subnets.",
    category: "Architecture Diagram",
    difficulty: "Intermediate",
    icons: ["aws-route53", "aws-elastic-load-balancing", "aws-ec2", "aws-rds", "aws-vpc"],
    groups: [
      { id: "vpc", label: "Production VPC (10.0.0.0/16)" },
      { id: "public-subnets", label: "Public Subnets (Multi-AZ)", parentId: "vpc" },
      { id: "private-subnets", label: "Private Subnets (Multi-AZ)", parentId: "vpc" }
    ],
    nodes: [
      { id: "dns", label: "Amazon Route 53", icon: "aws-route53" },
      { id: "igw", label: "Internet Gateway", icon: "aws-vpc", parentId: "vpc" },
      { id: "alb", label: "Application Load Balancer", icon: "aws-elastic-load-balancing", parentId: "public-subnets" },
      { id: "nat", label: "NAT Gateway", icon: "aws-vpc", parentId: "public-subnets" },
      { id: "ec2-a", label: "Web Server (AZ-A)", icon: "aws-ec2", parentId: "private-subnets" },
      { id: "ec2-b", label: "Web Server (AZ-B)", icon: "aws-ec2", parentId: "private-subnets" },
      { id: "aurora", label: "Amazon Aurora Cluster", icon: "aws-rds", parentId: "private-subnets" }
    ],
    edges: [
      { from: "dns", to: "igw" },
      { from: "igw", to: "alb" },
      { from: "alb", to: "ec2-a", label: "Port 80/443" },
      { from: "alb", to: "ec2-b", label: "Port 80/443" },
      { from: "ec2-a", to: "aurora", label: "Read/Write" },
      { from: "ec2-b", to: "aurora", label: "Read/Write" },
      { from: "ec2-a", to: "nat", label: "Outbound Traffic" },
      { from: "ec2-b", to: "nat", label: "Outbound Traffic" }
    ]
  },
  {
    id: "serverless-data-lake",
    name: "Enterprise Serverless Data Lake",
    description: "A clean, linearly scaling data lake architecture ingesting massive clickstream data through Kinesis, storing in tiered S3 zones, processing via Glue ETL, and visualizing with Athena.",
    category: "Architecture Diagram",
    difficulty: "Advanced",
    icons: ["aws-api-gateway", "aws-s3", "aws-lambda", "aws-route53"],
    groups: [
      { id: "ingestion", label: "Ingestion & Streaming Layer" },
      { id: "storage", label: "S3 Data Lake Storage Tier" },
      { id: "analytics", label: "Analytics & Visualization" }
    ],
    nodes: [
      { id: "api", label: "API Gateway (Clickstream)", icon: "aws-api-gateway", parentId: "ingestion" },
      { id: "firehose", label: "Kinesis Data Firehose", icon: "aws-route53", parentId: "ingestion" },
      { id: "raw-s3", label: "Raw Data Zone (S3)", icon: "aws-s3", parentId: "storage" },
      { id: "glue", label: "AWS Glue ETL Jobs", icon: "aws-lambda", parentId: "storage" },
      { id: "curated-s3", label: "Curated Data Zone (S3)", icon: "aws-s3", parentId: "storage" },
      { id: "athena", label: "Amazon Athena (Query)", icon: "aws-route53", parentId: "analytics" },
      { id: "quicksight", label: "Amazon QuickSight", icon: "aws-route53", parentId: "analytics" }
    ],
    edges: [
      { from: "api", to: "firehose", label: "Stream Events" },
      { from: "firehose", to: "raw-s3", label: "Batch & Compress" },
      { from: "raw-s3", to: "glue", label: "Transform/Clean" },
      { from: "glue", to: "curated-s3", label: "Parquet Format" },
      { from: "curated-s3", to: "athena", label: "Serverless SQL" },
      { from: "athena", to: "quicksight", label: "BI Dashboards" }
    ]
  },
  {
    id: "eks-microservices",
    name: "EKS Kubernetes Microservices",
    description: "Modern containerized microservices deployment utilizing Amazon EKS, Ingress controllers, and decoupled managed databases for separate bounded contexts.",
    category: "Architecture Diagram",
    difficulty: "Intermediate",
    icons: ["aws-ecs", "aws-elastic-load-balancing", "aws-dynamodb", "aws-rds"],
    groups: [
      { id: "eks", label: "Amazon EKS Cluster" },
      { id: "namespaces", label: "Service Namespaces", parentId: "eks" },
      { id: "data", label: "Managed Data Stores" }
    ],
    nodes: [
      { id: "client", label: "Mobile Client", icon: "aws-route53" },
      { id: "ingress", label: "ALB Ingress Controller", icon: "aws-elastic-load-balancing", parentId: "eks" },
      { id: "auth-svc", label: "Auth Microservice (Pod)", icon: "aws-ecs", parentId: "namespaces" },
      { id: "cart-svc", label: "Cart Microservice (Pod)", icon: "aws-ecs", parentId: "namespaces" },
      { id: "auth-db", label: "Amazon DynamoDB (Users)", icon: "aws-dynamodb", parentId: "data" },
      { id: "cart-cache", label: "Amazon ElastiCache", icon: "aws-rds", parentId: "data" }
    ],
    edges: [
      { from: "client", to: "ingress", label: "HTTPS" },
      { from: "ingress", to: "auth-svc", label: "Path: /auth" },
      { from: "ingress", to: "cart-svc", label: "Path: /cart" },
      { from: "auth-svc", to: "auth-db", label: "Query User" },
      { from: "cart-svc", to: "cart-cache", label: "Read/Write State" }
    ]
  },
  {
    id: "data-model-ecommerce",
    name: "Enterprise E-Commerce ERD Schema",
    description: "Production database model mapping Customer accounts, Orders, Products catalog, and isolated credit card Payment transactions.",
    category: "Data Model",
    difficulty: "Intermediate",
    icons: ["aws-rds", "aws-dynamodb"],
    groups: [],
    nodes: [
      { id: "cart_item", label: "cart_item\n--------------------\ncartId         int\nitemQty        int\nlastUpdated    date\nproductId      int", icon: "aws-rds", align: "start" },
      { id: "cart", label: "cart\n--------------------\nid             pk\ncustomerId     int\nname           str", icon: "aws-rds", align: "start" },
      { id: "customer", label: "customer\n--------------------\nid             pk\nname           str\npassword       str\nlastUpdated    date\nregDate        date", icon: "aws-rds", align: "start" },
      { id: "product", label: "product\n--------------------\nid             pk\nname           str\ndescription    clob\nprice          dec\nstockQty       int\nlastUpdated    date\ncategoryId     int", icon: "aws-rds", align: "start" },
      { id: "category", label: "category\n--------------------\nid             pk\nname           str\ndescription    clob", icon: "aws-rds", align: "start" }
    ],
    edges: [
      { from: "cart", to: "cart_item", label: "1:N" },
      { from: "customer", to: "cart", label: "1:1" },
      { from: "product", to: "cart_item", label: "1:N" },
      { from: "category", to: "product", label: "1:N" }
    ]
  },
  {
    id: "data-model-social",
    name: "Social Media Platform ERD",
    description: "Database model for a social network including Users, Posts, Comments, and user-to-user Follower relationships.",
    category: "Data Model",
    difficulty: "Basic",
    icons: ["aws-rds", "aws-dynamodb"],
    groups: [],
    nodes: [
      { id: "user", label: "User\n--------------------\nid             pk\nusername       str\nemail          str\njoined_at      date", icon: "aws-dynamodb", align: "start" },
      { id: "post", label: "Post\n--------------------\nid             pk\nuser_id        int\ncontent        clob\ncreated_at     date\nlikes_count    int", icon: "aws-dynamodb", align: "start" },
      { id: "comment", label: "Comment\n--------------------\nid             pk\npost_id        int\nuser_id        int\ntext           str\ncreated_at     date", icon: "aws-dynamodb", align: "start" },
      { id: "follower", label: "Follower\n--------------------\nfollower_id    pk\nfollowee_id    pk\ncreated_at     date", icon: "aws-dynamodb", align: "start" }
    ],
    edges: [
      { from: "user", to: "post", label: "1:N" },
      { from: "post", to: "comment", label: "1:N" },
      { from: "user", to: "comment", label: "1:N" },
      { from: "user", to: "follower", label: "1:N" }
    ]
  },
  {
    id: "data-model-hr",
    name: "Corporate HR System ERD",
    description: "Enterprise human resources schema detailing Employees, Departments, Roles, and Payroll salary records.",
    category: "Data Model",
    difficulty: "Advanced",
    icons: ["aws-rds"],
    groups: [],
    nodes: [
      { id: "employee", label: "Employee\n--------------------\nemp_id         pk\nfirst_name     str\nlast_name      str\nemail          str\nhire_date      date\ndept_id        int", icon: "aws-rds", align: "start" },
      { id: "department", label: "Department\n--------------------\ndept_id        pk\ndept_name      str\nmanager_id     int\nlocation       str", icon: "aws-rds", align: "start" },
      { id: "role", label: "Role\n--------------------\nrole_id        pk\ntitle          str\nmin_salary     dec\nmax_salary     dec", icon: "aws-rds", align: "start" },
      { id: "payroll", label: "Payroll\n--------------------\npayroll_id     pk\nemp_id         int\npay_date       date\namount         dec\ntax_deduction  dec", icon: "aws-rds", align: "start" }
    ],
    edges: [
      { from: "department", to: "employee", label: "1:N" },
      { from: "role", to: "employee", label: "1:N" },
      { from: "employee", to: "payroll", label: "1:N" },
      { from: "employee", to: "department", label: "Manages (1:1)" }
    ]
  },
  {
    id: "data-model-library",
    name: "Library Management System ERD",
    description: "Schema for tracking Books, Authors, Library Members, and active Book Loan transactions.",
    category: "Data Model",
    difficulty: "Intermediate",
    icons: ["aws-rds", "aws-dynamodb"],
    groups: [],
    nodes: [
      { id: "book", label: "Book\n--------------------\nbook_id        pk\ntitle          str\nisbn           str\npublish_year   int\nauthor_id      int", icon: "aws-rds", align: "start" },
      { id: "author", label: "Author\n--------------------\nauthor_id      pk\nfirst_name     str\nlast_name      str\nbirth_date     date", icon: "aws-rds", align: "start" },
      { id: "member", label: "Member\n--------------------\nmember_id      pk\nname           str\nemail          str\njoin_date      date\nstatus         str", icon: "aws-rds", align: "start" },
      { id: "loan", label: "Loan\n--------------------\nloan_id        pk\nbook_id        int\nmember_id      int\nloan_date      date\ndue_date       date\nreturn_date    date", icon: "aws-rds", align: "start" }
    ],
    edges: [
      { from: "author", to: "book", label: "1:N" },
      { from: "book", to: "loan", label: "1:N" },
      { from: "member", to: "loan", label: "1:N" }
    ]
  },
  {
    id: "gitops-workflow",
    name: "Automated GitOps CD Deployment Flow",
    description: "Continuous delivery automated workflow orchestrating commit webhooks, secure build tasks, and cluster-state synchronizations.",
    category: "Flow Diagram",
    difficulty: "Basic",
    icons: ["aws-ecr", "aws-ecs", "aws-lambda"],
    groups: [],
    nodes: [
      { id: "commit", label: "Developer Git Push", icon: "aws-route53" },
      { id: "build", label: "CI Container Builder", icon: "aws-lambda" },
      { id: "scan", label: "Security Image Scanner", icon: "aws-lambda" },
      { id: "push", label: "Public ECR Registry", icon: "aws-ecr" },
      { id: "deploy", label: "ArgoCD Cluster Sync", icon: "aws-ecs" }
    ],
    edges: [
      { from: "commit", to: "build" },
      { from: "build", to: "scan" },
      { from: "scan", to: "push" },
      { from: "push", to: "deploy" }
    ]
  },
  {
    id: "flow-order-fulfillment",
    name: "Event-Driven Order Fulfillment Flow",
    description: "Complex asynchronous workflow for e-commerce order processing utilizing event buses, parallel worker processing, and external payment integration.",
    category: "Flow Diagram",
    difficulty: "Advanced",
    icons: ["aws-api-gateway", "aws-lambda", "aws-sqs", "aws-sns"],
    groups: [
      { id: "entry", label: "Client Entry" },
      { id: "processing", label: "Event Processing Core" },
      { id: "external", label: "Fulfillment & External" }
    ],
    nodes: [
      { id: "api", label: "Checkout API", icon: "aws-api-gateway", parentId: "entry" },
      { id: "bus", label: "Event Bridge (Order Bus)", icon: "aws-lambda", parentId: "processing" },
      { id: "inv_queue", label: "Inventory SQS Queue", icon: "aws-sqs", parentId: "processing" },
      { id: "pay_queue", label: "Payment SQS Queue", icon: "aws-sqs", parentId: "processing" },
      { id: "inv_worker", label: "Inventory Lambda", icon: "aws-lambda", parentId: "processing" },
      { id: "pay_worker", label: "Payment Lambda", icon: "aws-lambda", parentId: "processing" },
      { id: "gateway", label: "Stripe API Gateway", icon: "aws-route53", parentId: "external" },
      { id: "ship", label: "Shipping Service", icon: "aws-ecs", parentId: "external" },
      { id: "notify", label: "Customer SNS Notification", icon: "aws-sns", parentId: "external" }
    ],
    edges: [
      { from: "api", to: "bus", label: "Publish OrderCreated" },
      { from: "bus", to: "inv_queue", label: "Route: Inventory" },
      { from: "bus", to: "pay_queue", label: "Route: Payment" },
      { from: "inv_queue", to: "inv_worker", label: "Poll" },
      { from: "pay_queue", to: "pay_worker", label: "Poll" },
      { from: "pay_worker", to: "gateway", label: "Process Card" },
      { from: "gateway", to: "ship", label: "Success Webhook" },
      { from: "gateway", to: "notify", label: "Success/Fail Email" },
      { from: "inv_worker", to: "notify", label: "Stock Update" }
    ]
  },
  {
    id: "flow-mlops-pipeline",
    name: "Automated MLOps Training Pipeline",
    description: "End-to-end Machine Learning data flow detailing raw data ingestion, ETL transformations, distributed model training, and artifact deployment.",
    category: "Flow Diagram",
    difficulty: "Advanced",
    icons: ["aws-s3", "aws-lambda", "aws-ec2"],
    groups: [
      { id: "ingestion", label: "Data Ingestion" },
      { id: "training", label: "Model Training & Registry" }
    ],
    nodes: [
      { id: "stream", label: "Kinesis Data Stream", icon: "aws-route53", parentId: "ingestion" },
      { id: "etl", label: "Glue ETL Spark Job", icon: "aws-lambda", parentId: "ingestion" },
      { id: "s3_raw", label: "S3 Raw Data Lake", icon: "aws-s3", parentId: "ingestion" },
      { id: "s3_feat", label: "S3 Feature Store", icon: "aws-s3", parentId: "training" },
      { id: "sagemaker", label: "SageMaker Training Cluster", icon: "aws-ec2", parentId: "training" },
      { id: "registry", label: "Model Artifact Registry", icon: "aws-s3", parentId: "training" },
      { id: "endpoint", label: "Inference Endpoint", icon: "aws-api-gateway" }
    ],
    edges: [
      { from: "stream", to: "s3_raw", label: "Firehose delivery" },
      { from: "s3_raw", to: "etl", label: "Trigger daily" },
      { from: "etl", to: "s3_feat", label: "Write features" },
      { from: "s3_feat", to: "sagemaker", label: "Fetch dataset" },
      { from: "sagemaker", to: "registry", label: "Push weights" },
      { from: "registry", to: "endpoint", label: "Deploy update" }
    ]
  },
  {
    id: "flow-realtime-chat",
    name: "Real-Time WebSocket Chat Flow",
    description: "Workflow illustrating a scalable real-time chat application utilizing WebSocket API gateways, Redis Pub/Sub for message routing, and persistent storage.",
    category: "Flow Diagram",
    difficulty: "Intermediate",
    icons: ["aws-api-gateway", "aws-dynamodb", "aws-lambda"],
    groups: [
      { id: "client_layer", label: "Client & Edge" },
      { id: "service_layer", label: "Real-Time Services" },
      { id: "data_layer", label: "Persistence & Cache" }
    ],
    nodes: [
      { id: "app", label: "Mobile / Web Client", icon: "aws-route53", parentId: "client_layer" },
      { id: "wss", label: "WebSocket API Gateway", icon: "aws-api-gateway", parentId: "client_layer" },
      { id: "conn_handler", label: "Connection Handler", icon: "aws-lambda", parentId: "service_layer" },
      { id: "msg_handler", label: "Message Router", icon: "aws-lambda", parentId: "service_layer" },
      { id: "redis", label: "Redis Pub/Sub Cluster", icon: "aws-dynamodb", parentId: "data_layer" },
      { id: "db", label: "Postgres Chat DB", icon: "aws-rds", parentId: "data_layer" }
    ],
    edges: [
      { from: "app", to: "wss", label: "Connect (WSS)" },
      { from: "wss", to: "conn_handler", label: "$connect" },
      { from: "conn_handler", to: "redis", label: "Save socket ID" },
      { from: "wss", to: "msg_handler", label: "Send Message" },
      { from: "msg_handler", to: "db", label: "Persist (Async)" },
      { from: "msg_handler", to: "redis", label: "Publish to Channel" },
      { from: "redis", to: "wss", label: "Broadcast to sockets" }
    ]
  },
  {
    id: "seq-pubsub-auth",
    name: "Mobile App Pub/Sub Auth & Publish",
    description: "Detailed sequence flow replicating a secure mobile client obtaining an access token to publish messages through a Pub/Sub proxy with ACL validations.",
    category: "Sequence Diagram",
    difficulty: "Advanced",
    icons: ["aws-cognito", "aws-api-gateway", "aws-lambda"],
    groups: [],
    nodes: [
      { id: "user", label: "User" },
      { id: "mobile", label: "Mobile app client" },
      { id: "backend", label: "Backend service" },
      { id: "proxy", label: "Pub/Sub proxy" },
      { id: "pubsub", label: "PubSub" }
    ],
    edges: [
      { from: "user", to: "mobile", label: "" },
      { from: "mobile", to: "backend", label: "Valid user/session?" },
      { from: "backend", to: "mobile", label: "return" },
      { from: "mobile", to: "mobile", label: "Have access token?" },
      { from: "mobile", to: "backend", label: "Generate access token" },
      { from: "backend", to: "mobile", label: "Cache access token (return)" },
      { from: "mobile", to: "proxy", label: "Publish access token" },
      { from: "proxy", to: "proxy", label: "Validate access token" },
      { from: "proxy", to: "pubsub", label: "Publish service account" },
      { from: "pubsub", to: "pubsub", label: "Validate ACLs" },
      { from: "mobile", to: "proxy", label: "Publish access token" }
    ]
  },
  {
    id: "seq-ecommerce-saga",
    name: "Microservices Checkout Saga",
    description: "Distributed transaction sequence orchestrating a checkout flow across Order, Payment, and Inventory microservices.",
    category: "Sequence Diagram",
    difficulty: "Advanced",
    icons: ["aws-api-gateway", "aws-lambda"],
    groups: [],
    nodes: [
      { id: "client", label: "Web Client" },
      { id: "api", label: "API Gateway" },
      { id: "order", label: "Order Service" },
      { id: "payment", label: "Payment Service" },
      { id: "inventory", label: "Inventory Service" }
    ],
    edges: [
      { from: "client", to: "api", label: "POST /checkout" },
      { from: "api", to: "order", label: "Create Order PENDING" },
      { from: "order", to: "payment", label: "Charge Card" },
      { from: "payment", to: "payment", label: "Validate Stripe Token" },
      { from: "payment", to: "order", label: "Payment OK (return)" },
      { from: "order", to: "inventory", label: "Reserve Stock" },
      { from: "inventory", to: "order", label: "Stock Reserved (return)" },
      { from: "order", to: "order", label: "Update Order CONFIRMED" },
      { from: "order", to: "api", label: "200 OK (return)" },
      { from: "api", to: "client", label: "Order Success (return)" }
    ]
  },
  {
    id: "seq-oauth-code-grant",
    name: "OAuth 2.0 Auth Code Grant",
    description: "Strict OAuth 2.0 sequence detailing redirect loops, user authentication, and secure token exchange for API access.",
    category: "Sequence Diagram",
    difficulty: "Intermediate",
    icons: ["aws-cognito", "aws-api-gateway"],
    groups: [],
    nodes: [
      { id: "user", label: "Resource Owner" },
      { id: "spa", label: "React Client App" },
      { id: "auth", label: "Auth Server / Cognito" },
      { id: "api", label: "Resource Server" }
    ],
    edges: [
      { from: "user", to: "spa", label: "Click Login" },
      { from: "spa", to: "auth", label: "Redirect /authorize?response_type=code" },
      { from: "auth", to: "user", label: "Prompt for Credentials (return)" },
      { from: "user", to: "auth", label: "Submit Username/Password" },
      { from: "auth", to: "spa", label: "Redirect with ?code=xyz (return)" },
      { from: "spa", to: "auth", label: "POST /token with code" },
      { from: "auth", to: "auth", label: "Validate Code & Secret" },
      { from: "auth", to: "spa", label: "Return Tokens (return)" },
      { from: "spa", to: "api", label: "API Call with Bearer Token" },
      { from: "api", to: "api", label: "Verify JWT Signature" },
      { from: "api", to: "spa", label: "Protected Data JSON (return)" }
    ]
  },
  {
    id: "seq-async-polling",
    name: "Async Report Generation Polling",
    description: "Client-server interaction pattern for offloading heavy compute tasks to a background worker using Job IDs and status polling.",
    category: "Sequence Diagram",
    difficulty: "Intermediate",
    icons: ["aws-ec2", "aws-rds", "aws-s3"],
    groups: [],
    nodes: [
      { id: "client", label: "User Dashboard" },
      { id: "api", label: "API Server" },
      { id: "worker", label: "Background Worker" },
      { id: "db", label: "Postgres DB" },
      { id: "s3", label: "S3 Storage" }
    ],
    edges: [
      { from: "client", to: "api", label: "Request CSV Report" },
      { from: "api", to: "worker", label: "Enqueue Report Job" },
      { from: "api", to: "client", label: "202 Accepted + Job ID (return)" },
      { from: "client", to: "api", label: "Poll Status Job ID" },
      { from: "api", to: "client", label: "Status: Processing (return)" },
      { from: "worker", to: "db", label: "Fetch 1M rows" },
      { from: "db", to: "worker", label: "Data payload (return)" },
      { from: "worker", to: "s3", label: "Upload report.csv" },
      { from: "client", to: "api", label: "Poll Status Job ID" },
      { from: "api", to: "client", label: "Status: Complete + S3 URL (return)" },
      { from: "client", to: "s3", label: "Download file" }
    ]
  }
];
