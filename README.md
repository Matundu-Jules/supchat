# SUPCHAT

SUPCHAT is a collaborative messaging platform that enables teams to communicate, collaborate, and share information within dedicated channels. This project includes a web application, a mobile application, and an API server.

---

## 📦 Project Content

- `client-web` → Web application (React + Vite)
- `client-mobile` → Mobile application (React Native / Expo)
- `supchat-server` → API server (Node.js, Express, MongoDB)
- `docker-compose.yml` → Containerization and service orchestration

---

## 🚀 Launch the Project with Docker (recommended)

### Prerequisites

- [Docker](https://www.docker.com/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/) installed

### Steps

1. Clone the repository:

```bash
git clone https://github.com/JuloushVolley/3PROJ.git
cd 3PROJ
```

2. Make sure your secrets are properly configured (environment variables, `.env` → do not leave secrets in clear text in the repository!)

3. Start the services:

```bash
docker-compose up --build
```

4. Access the applications:

- Web app: [http://localhost:80](http://localhost:80)
- API (Swagger): [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Mobile app (Expo): Launch the mobile app on an emulator or a phone using Expo Go (QR code displayed in the container logs)

5. Stop the services:

```bash
docker-compose down
```

---

## ⚙️ Service Details

| Service       | Port     | Description                            |
| ------------- | -------- | -------------------------------------- |
| Web client    | 80       | React web interface                    |
| API server    | 3000     | Node.js API with Swagger documentation |
| Mobile client | Expo CLI | Mobile app (React Native)              |
| Database      | 27017    | MongoDB (if configured in compose)     |

---

## 🛠️ Launch Without Docker (manual development mode)

> ⚠️ For production or demo use, **Docker** is recommended.

### Backend

```bash
cd supchat-server
npm install
npm start
```

### Web client

```bash
cd client-web
npm install
npm run dev
```

### Mobile client

```bash
cd client-mobile
npm install
npm start
```

---

## 📃 Technical Documentation

- API: Swagger available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- UML diagrams: see `docs/` folder (to be completed)
- Database schema: see `docs/` folder (to be completed)
- Deployment and architecture guide: to be completed

---

## ✅ Main Features

- Authentication (login, register)
- Workspaces, public/private channels
- Instant messaging (partial REST, real-time to be completed)
- Permission management
- Full containerization

## 🔔 Real-time Notifications

The web client connects to the WebSocket server using `useSocket`. When you pass
the connected user's ID to `useNotifications` (which forwards it to `useSocket`),
the hook automatically joins the `user_<userId>` room and listens for
`notification` events. The server sends these events when commands like
`inviteToWorkspace` or `inviteToChannel` create a new invite, so any user
subscribed with `useSocket(undefined, userId)` receives the notification
instantly.

---

## 📢 Authors

- Jules-langa MATUNDU
- Julien SHOEFFRE
- Kévin Gabriel BUMBESCU
- Enzo LECHANOINE

---

## ⚠️ Important

- **Do not include sensitive secrets (API keys, passwords) in the source code.**
- Use environment variables and share them only in a secure, separate document.

```

```
