````markdown
# HMCTS Dev Test Frontend

Frontend application for the HMCTS case management technical test. This service provides a user-friendly interface for managing caseworker tasks and integrates with the backend Task API.

## Overview

This application allows caseworkers to manage tasks through a simple server-rendered interface. It supports the full task lifecycle, from creation through to deletion, and communicates with the backend API from the Express server.

## Features

- View all tasks
- Create a new task with:
  - title
  - optional description
  - status
  - due date and time
- View task details
- Edit an existing task
- Update task status
- Delete a task with confirmation

## Tech Stack

- **Node.js**
- **Express**
- **Nunjucks** for server-side rendered templates
- **GOV.UK Frontend** styling via the starter asset pipeline
- **Axios** for server-side API calls

## Prerequisites

This repository is intended to run on **Node 20** (LTS). Running on newer Node versions, such as Node 24, may cause dependency or runtime issues.

### Recommended versions

- **Node:** 20.x  
  Tested on `20.11.1`
- **Yarn:** 3.8.2  
  Managed via **Corepack**

### Windows note

On Windows, using **nvm-windows** is recommended to make switching Node versions easier.

## Configuration

The backend API base URL is configured in:

- `config/default.json` → `services.taskApiUrl`

Default value:

```json
{
  "services": {
    "taskApiUrl": "http://localhost:4000"
  }
}
````

## Getting Started

### 1. Start the backend first

The frontend depends on the Task API being available.

Confirm the backend is running by checking:

```text
GET http://localhost:4000/tasks
```

Example response:

```json
[]
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Build assets

```bash
yarn webpack
```

### 4. Start the application in development mode

```bash
yarn start:dev
```

The application will be available at:

* `http://localhost:3100/tasks`

> In development, the server runs over HTTP by default and falls back to HTTP if local SSL certificates are not present.

## Available Routes

| Method | Route               | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/tasks`            | View all tasks           |
| GET    | `/tasks/new`        | Show create task form    |
| GET    | `/tasks/:id`        | View a single task       |
| GET    | `/tasks/:id/edit`   | Show edit task form      |
| GET    | `/tasks/:id/delete` | Show delete confirmation |

## Scripts

### Linting

```bash
yarn lint
```

### Route tests

```bash
yarn test:routes
```

### Asset build

```bash
yarn webpack
```

### Development server

```bash
yarn start:dev
```

## Design Notes

* The UI is **server-side rendered** using Nunjucks.
* The Express server calls the backend Task API using Axios.
* This avoids browser-side CORS issues and keeps API configuration on the server.
* Task status values are stored and sent as enums:

  * `TODO`
  * `IN_PROGRESS`
  * `DONE`
* These values are displayed in the UI using human-readable labels.

## Project Assumptions

* The backend API is available locally at `http://localhost:4000` unless otherwise configured.
* The backend exposes task endpoints expected by the frontend.
* The frontend is designed for local development as part of the technical test setup.

## Troubleshooting

### Backend not running / “Something went wrong”

If the backend is unavailable, or `services.taskApiUrl` is incorrect, the UI will not be able to load tasks.

Check that:

* `http://localhost:4000/tasks` is reachable
* `config/default.json` points to the correct backend API base URL

### Node or Yarn version issues

If you encounter runtime or dependency errors, check your installed versions:

```bash
node -v
yarn -v
```

Recommended:

* Node 20.x
* Yarn 3.8.2 via Corepack

## Future Improvements

Potential enhancements could include:

- More comprehensive validation (including consistent GOV.UK error summary + inline field errors across all forms)
- Improved empty/error state UX (e.g. guidance when the API is unavailable)
- Sorting/filtering tasks (by status and due date) and pagination for larger lists
- End-to-end tests (e.g. Playwright/Cypress) covering create/edit/status/delete flows
- Accessibility review against WCAG 2.2 and GOV.UK Design System guidance
- Containerised local setup (Docker Compose for frontend + backend + Postgres)
- CI pipeline (GitHub Actions) for linting, tests, and build checks on pull requests

## Summary

This frontend provides a simple, maintainable interface for managing caseworker tasks, using a server-rendered GOV.UK-style application architecture and a separate backend API for task data.