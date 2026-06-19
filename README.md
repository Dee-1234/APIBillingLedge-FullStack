# APIBillingLedger 
APIBillingLedger is an enterprise-grade SaaS platform built for developers to manage production API keys, monitor consumption metrics in real time, and handle metered billing pipelines automatically.The application implements strict data isolation at both the API and database levels, ensuring separate developer accounts retain private environments. When a developer reaches a hard usage threshold, the ledger dynamically restricts API key access until the outstanding balance is settled via an automated invoicing checkout.
# System Architecture & Workflow
The architecture decouples the customer-facing client from the financial logging engine:
# Authentication:
The client logs in through the Next.js portal, receiving a signed JWT.
# Resource Provisioning: 
The developer requests a production credential. The Spring Boot kernel provisions a cryptographically random, hashed token (sk_live_...) and writes it to PostgreSQL.
# Metered Consumption & Tracking:
Every event interaction securely increments the database log. If the metrics layer calculates an index value $\ge 10$, a Boolean isLocked state flips to true inside the database schema, blurring the sensitive token view on the UI layer.
# Settlement Engine: 
Upon clearing the due balance, the execution pipe drops the counter back to zero, appends a immutable transaction log to the system database, and shifts the access restriction back to open.
# Tech Stack Matrix
Layer                    Technology                          Key Responsibility
Frontend             UINext.js / React.js                  Dynamic Client Dashboard, Route Guards, State Management
Styling              EngineTailwind CSS / Lucide           Glassmorphic Dark Layout, High-Contrast UI Indicators
Backend Kernel       Java / Spring Boot                    High-Throughput REST Processing, Metering Controllers
Security Layer       Spring Security / JWT                 Stateless Authorization Checks, Scoped Token Filtering
Data Persistence     PostgreSQL                            Relational Logs, Relational User Mappings
ORM / Drivers        Spring Data JPA / Hibernate           Schema Generation, Native SQL Mapping
Build Automation     Maven / npm                           Dependency Isolation and Artifact Assembly
# Repository StructurePlaintextapibillingledger/
├── backend/                  # Java Spring Boot Services
│   ├── src/main/java/com/ledger/
│   │   ├── controllers/      # REST API Route Definitions
│   │   ├── models/           # Entity Schemas (User, ApiKey, Transaction)
│   │   ├── repositories/     # Spring Data JPA PostgreSQL Adapters
│   │   └── security/         # JWT Verification Filters & CORS
│   └── pom.xml               # Maven Dependency Configuration
└── frontend/                 # Next.js / React Client App
    ├── src/
    │   ├── app/              # Folder-Based Routing Architectures
    │   ├── components/       # Reusable Context Panels (Toast, PayModal)
    │   └── styles/           # Global Tailwind Directives
    └── package.json          # Node Modules Manifest
# Core Database Schema & Isolation Logic
To enforce multi-tenant data privacy, database entities maintain a strict @ManyToOne structural link with the parent Account table.
SQL Relational Mapping Matrix
Every account references $0\dots1$ Active API Keys.
Every account references $0\dots N$ Chronological Ledger Usage Logs.
Every account references $0\dots N$ Financial Transaction Records.
# Java
// Logic snippet showing User-Isolation validation inside the Backend Kernel
@Query("SELECT k FROM ApiKey k WHERE k.user.username = :username")
Optional<ApiKey> findActiveKeyByUser(@Param("username") String username);
# API Contract Specifications
All API routes are version-controlled and expect/return standard JSON application payloads. Protected endpoints require an Authorization: Bearer <JWT_TOKEN> header.
# Core Endpoint Matrix
HTTP Verb        API Context Route          Data Access Constraints              Intended Operation
POST            /api/v1/auth/register            Public                    Instantiates a unique database developer identity.
POST            /api/v1/auth/login               Public                    Validates credentials and yields a signed token.
GET             /api/v1/keys/me              Authenticated (Owner Only)    Retrieves active profile key; returns masked data if locked.
POST            /api/v1/keys/generate        Authenticated (Owner Only)    Drops older keys and updates active key rows.
POST            /api/v1/usage/track          Authenticated (Owner Only)    Increments key copy metric counts and runs threshold                                                                                      assertions.
GET             /api/v1/usage/logs           Authenticated (Owner Only)    Pipes a history array to feed UI analytics components.
POST            /api/v1/billing/pay          Authenticated (Owner Only)    Triggers account credit corrections, resets count, appends                                                                                transaction.
GET            /api/v1/billing/payments      Authenticated (Owner Only)    Extracts historically cleared payment objects.
# Development Environment Configuration
# Prerequisites
Java Development Kit (JDK 17 or higher)
Node.js (v18.x or higher)
PostgreSQL Database Engine running locally or via Docker container
# 1. Backend Server Bootstrap
1. Initialize a PostgreSQL database named apibillingledger.
2. Access the backend configuration file at backend/src/main/resources/application.properties and provide your database credentials:
Propertiesspring.datasource.url=jdbc:postgresql://localhost:5432/apibillingledger
spring.datasource.username=your_postgres_user
spring.datasource.password=your_postgres_password
spring.jpa.hibernate.ddl-auto=update
3. Boot the environment using Maven via the terminal:Bashcd backend
mvn clean install
mvn spring-boot:run
The backend API will initialize on http://localhost:8080.
# 2. Frontend Client Bootstrap
1. Open a separate terminal path and drop into the frontend folder directory:
Bash
cd frontend
npm install
2. Launch the Webpack server process:
Bash
npm run dev
The interactive customer interface will load on http://localhost:3000.
# Security Assertions & Audits
# Stateless Security Pass: 
Server routes parse incoming HTTP request streams via filters to pull context claims from incoming headers before executing controllers.
# Sensitive Masking Engine: 
If a database transaction calculation detects an unpaid balance over the allowed billing limit, data returns over the REST network pre-masked (••••••••).
# Cross-Origin Configuration (CORS):
Explicitly handles and sanitizes inbound resource calls coming between port 3000 and port 8080.
