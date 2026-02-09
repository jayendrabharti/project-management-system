# Project Management System

A full-stack MERN (MongoDB, Express, React, Node.js) project management system similar to Clipup, built with TypeScript and modern tooling.

## 🚀 Tech Stack

### Frontend

- **React 19** with **TypeScript**
- **Vite** for fast development and building
- **React Router v7** for routing
- **Tailwind CSS v4** with custom design system
- **shadcn/ui** component library
- **Axios** for API calls
- Dark/Light theme support

### Backend

- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **Zod** for validation
- **bcrypt** for password hashing

### Monorepo

- **pnpm workspaces** for package management
- Parallel development with concurrent scripts

## 📁 Project Structure

```
project-management-system/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API service layer
│   │   ├── contexts/    # React contexts (Auth, etc.)
│   │   ├── types/       # TypeScript types
│   │   └── lib/         # Utilities
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── config/      # Configuration files
│   │   ├── utils/       # Helper functions
│   │   └── scripts/     # Utility scripts (seeding, etc.)
│   └── package.json
└── package.json         # Root workspace config
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   **Server** (`server/.env`):

   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/project-management
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

   **Client** (`client/.env`):

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Seed the database with test data** (optional)
   ```bash
   pnpm seed
   ```

### Running the Application

**Development mode** (runs both client and server concurrently):

```bash
pnpm dev
```

**Run individually**:

```bash
# Client only (port 3000)
pnpm dev:client

# Server only (port 5000)
pnpm dev:server
```

**Production build**:

```bash
pnpm build
pnpm start
```

## 🔑 Features

- ✅ User authentication (Register/Login) with JWT
- ✅ Protected routes
- ✅ Project management (CRUD)
- ✅ Task management (CRUD)
- ✅ User assignment to projects and tasks
- ✅ Status tracking (Todo, In Progress, Completed)
- ✅ Priority levels (Low, Medium, High)
- ✅ Dark/Light theme
- ✅ Responsive design

## 🧪 Testing

After seeding the database, you can log in with any of the generated test users:

- Email: `user1@example.com` (through `user10@example.com`)
- Password: `password123`

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects

- `GET /api/projects` - Get all projects (protected)
- `GET /api/projects/:id` - Get project by ID (protected)
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Tasks

- `GET /api/tasks` - Get all tasks with filters (protected)
- `GET /api/tasks/:id` - Get task by ID (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC
