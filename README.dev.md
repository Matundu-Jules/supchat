# 🔧 SUPCHAT Developer Guide

This file is intended for developers who want to quickly launch the full development environment (frontend + backend + database) using VSCode tasks.

---

## ⚡️ Quick Start with VSCode Tasks

We use **custom VSCode tasks** defined in `.vscode/tasks.json`.

### How to launch

1. Open the project folder in Visual Studio Code.
2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac).
3. Type `Run Task` and select the desired task.

### Available Tasks

| Task Label                  | Description                             |
|----------------------------|-----------------------------------------|
| `Start Backend`            | Launches the Express API on port 3000   |
| `Start Frontend Web`       | Launches the React client on port 5173  |
| `Start Mobile`             | Launches the Expo mobile project        |
| `Start DB (Docker Compose)`| Starts MongoDB using Docker Compose     |
| `Dev: API + Web`           | Starts backend and frontend web in parallel |
| `Dev: API + Mobile`        | Starts backend and mobile client        |
| `Dev: API + Web + Mobile`  | Starts full stack (no DB)               |
| `Dev: API + Web + DB`      | Starts backend, web and database        |
| `Stop All Dev Services`    | Stops all Docker services (`docker-compose stop`) |

---

## 🔁 Development Environment Setup

Make sure the following requirements are met before running tasks:

- Node.js is installed (`node -v`)
- Docker is running
- A `.env` file is available for each sub-project (`supchat-server`, `client-web`, etc.)

---

## 📂 Recommended Structure

```
.
├── supchat-server/
├── client-web/
├── client-mobile/
├── docker-compose.yml
├── .vscode/
│   └── tasks.json
├── README.md
└── README.dev.md
```

---

## ❓ Need Help?

Contact the repository owner or check for open issues.