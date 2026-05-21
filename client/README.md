# Client — React + TypeScript + Vite

React 19 frontend for the project management system. Built with Vite, Tailwind CSS v4, shadcn/ui, and React Router v7.

## Prerequisites

- Node.js >= 18.0.0

## Environment Variables

Copy `.env.example` to `.env` and set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

> `VITE_*` variables are **build-time** — they get baked into the static bundle. Change this before building for a different environment.

## Running Locally

**Install dependencies:**

```bash
npm install
```

**Start the development server** (hot-reload on `http://localhost:3000`):

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Preview the production build locally:**

```bash
npm run preview
```

## Docker

The client Dockerfile uses a multi-stage build: Node builds the Vite app, then Nginx serves the static files.

**Build the image** (pass the API URL as a build argument):

```bash
docker build \
  --build-arg VITE_API_URL=http://your-server-host:5000/api \
  -t pms-client .
```

**Run the container:**

```bash
docker run -p 80:80 pms-client
```

The app is served at `http://localhost`.

> For the full stack (client + server + MongoDB), use the root-level `docker-compose.yml`.
