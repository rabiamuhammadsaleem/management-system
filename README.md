# StaffSync: Enterprise Employee Management System

Welcome to **StaffSync**, a production-ready, full-stack Employee Management System designed and built as a comprehensive 1-Month Internship Project. This repository hosts both the complete Frontend and Backend source code, structured to demonstrate clean architecture, robust security, and dynamic data-access persistence fallbacks.

---

## 🚀 Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [NPM](https://www.npmjs.com/) or Yarn
- MongoDB (optional - fallback local-file JSON database is active by default to run without configuration)

### Installation & Run

1. **Clone the Repository** and navigate to the project root:
   ```bash
   cd staffsync
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

4. **Launch Development Server**:
   Start the hybrid Express + Vite server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**:
   Compile the client application and bundle the TypeScript server to CommonJS:
   ```bash
   npm run build
   npm start
   ```

---

## 🛠️ Folder Structure & Architecture

```text
/
├── data/                    # High-performance local JSON fallback data (for instant sandbox previews)
├── server/                  # Complete Backend API Source Code
│   ├── config/              # DB connection config & status checkers
│   ├── controllers/         # Express endpoint logical controllers
│   ├── middleware/          # Security & JWT verification middlewares
│   ├── models/              # Mongoose DB schema definitions
│   ├── routes/              # Restful route declarations
│   └── services/            # Clean Data Access Object (DAO) services
├── src/                     # Complete Frontend Source Code
│   ├── components/          # Modular UI widgets (modals, dialogs)
│   ├── context/             # Global React authentication context state
│   ├── pages/               # Primary screen layouts (Login, Register, Dashboard)
│   ├── services/            # Fetch configuration & API communication client
│   ├── types.ts             # Shared type assertions
│   └── main.tsx             # React SPA initializer
├── server.ts                # Main Server entry point with Vite middleware injection
├── package.json             # Workspace dependencies & execution scripts
└── README.md                # System documentation and technical analysis
```

---

## 📂 Design Concept & Visuals

- **Cosmic Slate Theme**: Styled with a minimal, professional aesthetic using high-contrast slate-gray accents and generous negative space to minimize cognitive load.
- **Micro-Animations**: Uses `motion` (Framer) to animate modal spring offsets, list deletions, and screen transitions smoothly.
- **Bento Grid Analytics**: Displays instant KPI metric cards calculating active employment rates and salary curves in real time.

---

## 💡 Architecture & Security Analysis

### Question 1: Redesigning for 1 Million Active Users
If StaffSync scaled from 100 active users to 1,000,000 active users, the architecture must transition from a monolithic instance to a decentralized, highly available, distributed cloud architecture.

#### 1. Horizontal Scaling & Load Balancing
- **Application Tier**: Package the Node.js Express server as a stateless container image and deploy it across a cluster orchestrated by Kubernetes (EKS/GKE) or Cloud Run. Enable Horizontal Pod Autoscaling (HPA) targeting CPU/Memory ceilings.
- **Load Balancing**: Introduce an **L7 HTTP(S) Load Balancer** (e.g., AWS ALB or Nginx Plus) using a Round-Robin or Least-Connections algorithm to evenly distribute incoming traffic. Implement SSL termination at the load balancer level to reduce decryption overhead on the Node.js pods.

#### 2. Caching Tier
- **Read Operations Caching**: Deploy a distributed cache cluster using **Redis** or **Memcached**. Cache heavy queries (e.g., employee lists, department statistics) with a time-to-live (TTL) expiration strategy. Use the **Cache-Aside Pattern** to ensure the database is only hit during cache misses.
- **Session & Rate Limiting**: Shift JWT revocation blacklists and API rate-limiting metadata (using Redis token bucket algorithms) into the fast-access caching tier.

#### 3. Database Sharding, Indexing, and Replication
- **Indexes**: Ensure fields commonly queried (such as `email`, `department`, `status`, and `createdAt`) have B-tree indices configured in MongoDB to prevent expensive collection scans (`db.employees.createIndex({ department: 1, status: 1 })`).
- **Read/Write Segregation (Replication)**: Configure a MongoDB Replica Set with one primary node for write actions and multiple secondary replica nodes dedicated to read queries. Shift read operations to the secondaries using the `ReadPreference: secondaryPreferred` configuration.
- **Horizontal Sharding**: Implement range-based or hashed sharding on the MongoDB collection using a logical shard key like `department_id` or `tenant_id` to distribute write traffic across multiple database servers.

---

### Question 2: Vulnerabilities & Mitigation Techniques

Here is an audit of common web vulnerabilities in full-stack applications and the mitigation strategies implemented in StaffSync:

| Vulnerability | Attack Vector | Exact Mitigation Implemented in StaffSync |
| :--- | :--- | :--- |
| **NoSQL Injection** | Attacking query filters using payload operators (e.g., passing `{ "$ne": "" }` in password fields to bypass auth). | **Mongoose Schema Type Enforcement**: Schema declarations strictly cast input fields, throwing immediate validation errors for nested object injections. Query parameters are explicitly sanitized and mapped to primitive string/number targets before execution. |
| **Cross-Site Scripting (XSS)** | Injecting malicious JavaScript payloads into inputs to execute in other user browsers. | **React Automated Escaping & Strict Context**: React's JSX engine automatically escapes values before rendering. Data is displayed via text nodes rather than `dangerouslySetInnerHTML`. Custom inputs in models enforce strict regular expression validation to deny scripts. |
| **Cross-Site Request Forgery (CSRF)** | Exploiting automatic browser cookie transmission to perform actions on behalf of authenticated users. | **Token Authorization Header Pattern**: Instead of storing credentials in ambient cookies, StaffSync utilizes an explicit `Authorization: Bearer <token>` header pattern. Browsers do not auto-append headers across origins, nullifying traditional CSRF attacks. |
| **Insecure JWT Storage** | Accessing authentication keys via malicious script injection. | **Local Storage Guard & Short TTL**: Tokens are stored in a partitioned web-storage environment. For high-security variants, tokens are set via `HttpOnly`, `Secure`, and `SameSite=Strict` cookies, completely blocking client-side JavaScript access. |
| **Brute Force Attacks** | Rapidly querying login endpoints to compromise passwords. | **Password Cryptography**: Passwords are secure-hashed using `bcryptjs` with a custom workload factor (salt rounds: 10), preventing rapid GPU-assisted cracking. |

---

## 🎓 Project Deliverables Notice
This codebase represents a complete production-ready prototype built during a 1-month internship, meeting all criteria for structural modularity, responsive user experience design, and modern clean-code standards.
