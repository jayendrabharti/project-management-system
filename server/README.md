# Server — Express + TypeScript API

Express + TypeScript backend for the project management system. Uses MongoDB with Mongoose, JWT authentication, and Zod validation.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (local instance or MongoDB Atlas)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/project-management
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=http://localhost:3000
```

## Running Locally

**Install dependencies:**

```bash
npm install
```

**Start in development mode** (hot-reload via ts-node-dev):

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
npm start
```

**Seed the database with test data:**

```bash
npm run seed
```

The server runs on `http://localhost:5000` by default.

## Docker

**Build the image:**

```bash
docker build -t pms-server .
```

**Run the container:**

```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=mongodb://<mongo-host>:27017/project-management \
  -e JWT_SECRET=your-secret \
  -e CORS_ORIGIN=http://localhost \
  pms-server
```

> For the full stack (server + client + MongoDB), use the root-level `docker-compose.yml`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |
| GET | `/api/projects` | List projects (protected) |
| POST | `/api/projects` | Create project (protected) |
| GET | `/api/projects/:id` | Get project (protected) |
| PUT | `/api/projects/:id` | Update project (protected) |
| DELETE | `/api/projects/:id` | Delete project (protected) |
| GET | `/api/tasks` | List tasks with filters (protected) |
| POST | `/api/tasks` | Create task (protected) |
| GET | `/api/tasks/:id` | Get task (protected) |
| PUT | `/api/tasks/:id` | Update task (protected) |
| DELETE | `/api/tasks/:id` | Delete task (protected) |
