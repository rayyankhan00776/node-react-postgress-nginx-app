# TaskFlow Pro

TaskFlow Pro is a production-style, high-performance task management application designed for local operation. Inspired by modern project workspaces like Trello, it simplifies task scheduling and collaborative workflows.

Built with a **Node.js/Express/PostgreSQL** backend and a **React/Vite** single-page application frontend, it features JWT token rotation, input checking, rate limiting, and a custom ultraviolet dark design system.

---

## Folder Structure

```text
node-react-postgress-nginx-app/
├── backend/
│   ├── src/
│   │   ├── config/          # DB Pool and config imports
│   │   ├── controllers/     # HTTP endpoint request mapping
│   │   ├── database/        # schema.sql, init-db.js
│   │   ├── middlewares/     # Auth, Errors, Multer, Rate Limiting
│   │   ├── models/          # Layered database interaction scripts
│   │   ├── routes/          # API sub-routers mapping
│   │   ├── services/        # Central business logic (Auth, Users, Projects)
│   │   ├── utils/           # Custom AppErrors, JWT helpers
│   │   ├── validators/      # express-validator rulesets
│   │   └── app.js, server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, Modals, TaskCards
│   │   ├── context/         # AuthContext state wrappers
│   │   ├── pages/           # Dashboard, Projects, Workspace, Settings
│   │   ├── routes/          # ProtectedRoute, AppRoutes lists
│   │   ├── services/        # Axios API client with token refresh
│   │   ├── App.jsx, main.jsx
│   │   └── index.css        # Global dark ultraviolet stylesheet
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL local server running

### 1. Database Setup
1. Create a database in PostgreSQL named `taskflow_pro`.
   ```sql
   CREATE DATABASE taskflow_pro;
   ```
2. Navigate to the backend directory and configure the environment settings:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Update the `DATABASE_URL` inside `.env` to match your Postgres configuration, for example:
   ```text
   DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow_pro
   ```
4. Install backend dependencies and initialize/seed the tables:
   ```bash
   npm install
   npm run db:init
   ```
   *This executes the database initialization script, creating tables for `users`, `projects`, `tasks`, and `refresh_tokens`, and inserts preconfigured seed users (`jane@taskflow.pro` and `john@taskflow.pro` both with password `Password123!`).*

---

### 2. Running the Backend
To start the backend in development hot-reload mode:
```bash
npm run dev
```
The backend server will run on `http://localhost:5050`.

---

### 3. Running the Frontend
1. Open a new terminal session, navigate to the frontend directory, and configure the variables:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Install client dependencies and run the Vite server:
   ```bash
   npm install
   npm run dev
   ```
Vite will launch the hot-reloading server on `http://localhost:5173`. Open this URL in your web browser.

---

## Running with Docker Compose

To spin up the entire production-style stack inside isolated Docker containers:

1. **Configure Docker Compose**:
   Copy the example docker-compose file to the active configuration:
   ```bash
   cp docker-compose.yml.example docker-compose.yml
   ```
2. **Build and Start Containers**:
   Build the frontend/backend images and start all services (database, backend API, and frontend Nginx server):
   ```bash
   docker compose up -d
   ```
   *The database container (`taskflow_db`) starts and performs a health check, followed by the backend server (`taskflow_backend` on port `5050`) and the Nginx frontend reverse proxy (`taskflow_frontend` on port `8080`).*

3. **Seed the Container Database**:
   Execute the migration and database seeding script inside the running backend container to build the tables and populate the default users/workspaces:
   ```bash
   docker exec -it taskflow_backend npm run db:init
   ```

4. **Access the App**:
   Open your browser and visit:
   **`http://localhost:8080`**

   Use the preconfigured credentials to log in:
   - **Email**: `jane@taskflow.pro`
   - **Password**: `Password123!`

---

## Running with Kubernetes

You can deploy and run the entire production-style stack inside a local Kubernetes cluster (like **Kind** or **Minikube**).

### Prerequisites
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed.
- A running local cluster (e.g. [Kind](https://kind.sigs.k8s.io/) or [Minikube](https://minikube.sigs.k8s.io/)).

### 1. Setup Namespace & ConfigMap
Navigate to the `k8s/` directory and deploy the basic infrastructure config:
```bash
cd k8s
kubectl apply -f namespace.yml
kubectl apply -f config-map.yml
```

### 2. Deploy Database (Postgres)
Create the persistent volume claim and deploy the database:
```bash
kubectl apply -f postgres-storage.yml
kubectl apply -f postgress-dep.yml
kubectl apply -f postgress-svc.yml
```

### 3. Deploy Backend & Seed Tables
Deploy the backend API and run the DB migration/seeding script inside the running container:
```bash
kubectl apply -f backend-dep.yml
kubectl apply -f backend-svc.yml

# Wait for the backend pod to be in "Running" status, then seed:
kubectl exec -it deployment/backend-deployment -n taskpro-ns -- npm run db:init
```

### 4. Deploy Frontend
```bash
kubectl apply -f frontend-dep.yml
kubectl apply -f frontend-svc.yml
```

### 5. Configure Routing (Choose Option A or B)

#### Option A: Native Nginx Ingress Controller (Recommended)
If your cluster has port mapping for port `80`/`443` exposed:
1. Install the Ingress Controller on your cluster:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
   ```
2. Apply the Ingress resource:
   ```bash
   kubectl apply -f ingress-svc.yml
   ```
3. Access the application directly at: **`http://localhost`**

#### Option B: Standalone Nginx Proxy
If you prefer not to run an Ingress Controller:
1. Deploy the Nginx proxy pod and its service:
   ```bash
   kubectl apply -f nginx-dep.yml
   kubectl apply -f nginx-svc.yml
   ```
2. Port-forward the service to your host:
   ```bash
   kubectl port-forward service/nginx-service -n taskpro-ns 8080:80
   ```
3. Access the application at: **`http://localhost:8080`**

---

## REST API Documentation

All request bodies must be JSON payload format. Non-public endpoints require the header `Authorization: Bearer <jwt_access_token>`.

### Authentication Endpoints
#### `POST /api/auth/register` (Public)
- **Body**: `{ "name": "Jane", "email": "jane@taskflow.pro", "password": "Password123!" }`
- **Response (201)**: `{ "status": "success", "message": "...", "data": { "user": { "id": 1, "name": "Jane", ... } } }`

#### `POST /api/auth/login` (Public)
- **Body**: `{ "email": "jane@taskflow.pro", "password": "Password123!" }`
- **Response (200)**: `{ "status": "success", "data": { "user": { ... }, "accessToken": "...", "refreshToken": "..." } }`

#### `POST /api/auth/refresh` (Public)
- **Body**: `{ "refreshToken": "..." }`
- **Response (200)**: `{ "status": "success", "data": { "accessToken": "...", "refreshToken": "...", "user": { ... } } }`

#### `POST /api/auth/logout` (Public)
- **Body**: `{ "refreshToken": "..." }`
- **Response (200)**: `{ "status": "success", "message": "Logged out successfully!" }`

---

### User Endpoints
#### `GET /api/users/profile` (Protected)
- **Response (200)**: `{ "status": "success", "data": { "user": { ... } } }`

#### `PUT /api/users/profile` (Protected)
- **Body**: `{ "name": "Jane Doe Updated", "email": "jane.updated@taskflow.pro" }`
- **Response (200)**: `{ "status": "success", "data": { "user": { ... } } }`

#### `PUT /api/users/change-password` (Protected)
- **Body**: `{ "oldPassword": "Password123!", "newPassword": "NewPassword123!" }` 
- **Response (200)**: `{ "status": "success", "message": "Password changed successfully!" }`

#### `PATCH /api/users/avatar` (Protected)
- **Body**: Multipart Form Data key `avatar` holding image file.
- **Response (200)**: `{ "status": "success", "data": { "user": { ... "avatar": "avatar-17196434-xyz.png" } } }`

#### `DELETE /api/users/account` (Protected)
- **Response (200)**: `{ "status": "success", "message": "Account deleted successfully!" }`

---

### Projects Endpoints
#### `POST /api/projects` (Protected)
- **Body**: `{ "name": "New Project", "description": "Scope detail" }`
- **Response (201)**: `{ "status": "success", "data": { "project": { ... } } }`

#### `GET /api/projects` (Protected)
- **Query Params**: `search` (text), `filter` (active/archived/all), `sortBy` (name/created_at/updated_at), `sortOrder` (asc/desc), `page` (number), `limit` (number).
- **Response (200)**: `{ "status": "success", "data": { "projects": [...], "pagination": { ... } } }`

#### `GET /api/projects/stats` (Protected)
- **Response (200)**: Returns aggregates including projects counters, tasks totals, completed percentages, priority rates, and status columns details.

#### `GET /api/projects/:id` (Protected)
- **Response (200)**: `{ "status": "success", "data": { "project": { ... } } }`

#### `PUT /api/projects/:id` (Protected)
- **Body**: `{ "name": "Updated Project", "description": "...", "is_archived": false }`
- **Response (200)**: `{ "status": "success", "data": { "project": { ... } } }`

#### `PATCH /api/projects/:id/archive` (Protected)
- **Response (200)**: `{ "status": "success", "data": { "project": { ... "is_archived": true } } }`

#### `DELETE /api/projects/:id` (Protected)
- **Response (200)**: `{ "status": "success", "message": "Project deleted successfully!" }`

---

### Tasks Endpoints
#### `POST /api/tasks` (Protected)
- **Body**: `{ "projectId": 1, "title": "My Task", "description": "...", "priority": "High", "status": "Todo", "due_date": "2026-07-15" }`
- **Response (201)**: `{ "status": "success", "data": { "task": { ... } } }`

#### `GET /api/tasks` (Protected)
- **Query Params**: `projectId` (number, optional), `search` (text), `status` (Todo/In Progress/Review/Completed), `priority` (Low/Medium/High/Critical), `sortBy`, `sortOrder`, `page`, `limit`.
- **Response (200)**: `{ "status": "success", "data": { "tasks": [...], "pagination": { ... } } }`

#### `GET /api/tasks/:id` (Protected)
- **Response (200)**: `{ "status": "success", "data": { "task": { ... } } }`

#### `PUT /api/tasks/:id` (Protected)
- **Body**: `{ "title": "...", "description": "...", "priority": "Critical", "status": "In Progress", "due_date": "..." }`
- **Response (200)**: `{ "status": "success", "data": { "task": { ... } } }`

#### `DELETE /api/tasks/:id` (Protected)
- **Response (200)**: `{ "status": "success", "message": "Task deleted successfully!" }`

---

## Future Improvements
- **Live Collaborative WebSockets**: Add WebSockets for board synchronization across connected users.
- **Drag-and-Drop Kanban columns**: Integrate HTML5 native drag-and-drop or React Beautiful DnD for sorting board cards.
- **Project Invites**: Add a pivot table linking multiple users to single projects to allow team collaboration.
- **OAuth Integrations**: Incorporate Google and GitHub single sign-on mechanisms.
