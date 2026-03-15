# HMCTS Dev Test Frontend

Frontend application for the HMCTS case management technical test. This service provides a simple, user-friendly UI for managing caseworker tasks and integrates with the backend Task API.

## Features

- View all tasks
- Create a task (title, optional description, status, due date/time)
- View task details
- Edit a task
- Update task status
- Delete a task

## Tech Stack

- Node.js + Express
- Nunjucks templates
- GOV.UK Frontend styling (via the starter’s asset pipeline)
- Axios (server-side API calls)

## Prerequisites

This repo is intended to run on **Node 20** (LTS). Running on newer Node versions (e.g. Node 24) may cause dependency/runtime errors.

Recommended versions:

- **Node:** 20.x (tested on 20.11.1)
- **Yarn:** 3.8.2 (via Corepack)

### Windows note (recommended)
If you are on Windows, using **nvm-windows** makes switching Node versions straightforward.

## Configuration

Backend API base URL is configured in:

- `config/default.json` → `services.taskApiUrl`

Default:
- `http://localhost:4000`

## Getting Started

Install dependencies:

```bash
yarn install