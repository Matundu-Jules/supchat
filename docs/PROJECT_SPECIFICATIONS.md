# SUPCHAT – Project Specification

## 1. Project Context

The company **“La Confiance Règne”** aims to enhance internal communication and collaboration between teams.

An RFP has been launched to subcontract the development of **SUPCHAT**.

Your team is competing for the contract. You must develop both a **web and mobile** application to satisfy all users. A visual identity (style guide) must also be defined.

---

## 2. Project Description

### 2.1 General Overview

SUPCHAT is designed to let company teams communicate, collaborate, and share information within dedicated **workspaces** and **channels**.

Each user has a personal account and may join multiple workspaces.  
Each workspace includes public/private channels and private messaging.  
Emphasis is placed on **simplicity**, **security**, and **flexible permissions**.

---

### 2.2 Core Features

#### 2.2.1 Authentication

- Users can log in with a classic account or using **OAuth2** (Google, Facebook).

#### 2.2.2 Workspaces

- Users can create workspaces and invite members via email or invitation link.
- Workspaces can be **public** (open to all) or **private** (invite-only).
- A dashboard allows users to view/manage their workspaces.

#### 2.2.3 Channels

Each workspace can contain:

- **Public channels**: accessible to all workspace members.
- **Private channels**: accessible only to invited users.
- Organized in a menu with a search bar.

#### 2.2.4 Instant Messaging

- Real-time messaging with live updates.
- Supports:
  - Text messages
  - Reactions (emojis)
  - File sharing (images, videos, PDF, etc.)
  - Mentions (@user) and hashtags (#channel)
  - Keyword-based message search

#### 2.2.5 Permissions Management

Channel/workspace creators can:

- Assign roles: admin, member, guest
- Set permissions: post, moderate, manage members
- Configure granular permissions (per user or group)

#### 2.2.6 Notifications

- Real-time notifications:
  - User mentions
  - New messages in channels/workspaces
- Notification settings:
  - By channel
  - Push or email alerts

#### 2.2.7 Integrations & Automations

- Integration with tools:
  - Google Drive, Microsoft Teams, GitHub
- Bots for:
  - Reminders, polls, third-party API automation

#### 2.2.8 Search

Unified search to find:

- Messages (with context preview)
- Shared files
- Channels and users

#### 2.2.9 User Settings

- Manage account info and OAuth2 links
- User preferences:
  - Dark/light theme
  - Custom status (online, busy, offline)
  - Export personal data (GDPR compliant)

---

### 2.3 Deployment

#### 2.3.1 Architecture

The application must include:

- A **server** (REST or GraphQL) implementing all features
- Two **clients** (web + mobile) that only interact with the server
- A **database** (free choice)

All business logic must remain server-side. Clients act as interfaces only.

#### 2.3.2 Dockerization

- Include a `docker-compose.yml` at the root
- At least 3 Docker services:
  - Backend (server)
  - Frontend (web client)
  - Database

The whole app must run via Docker Compose.

---

## 3. Deliverables

You must submit a `.zip` archive including:

- Source code
- Media assets (sounds, images, etc.)
- Technical documentation
- User manual

### Technical Documentation (for developers):

- Environment setup & dependencies
- Deployment guide
- Language/library justification
- UML diagrams
- Database schema

### User Manual (for end users):

- How to use the app
- Overview of main features

**Important**:  
No secret (API key, password, etc.) must appear in the code. If present:

- Minor secrets → Penalty on code quality
- Critical secrets → Project failure

You can include **mocked secrets** in a doc section marked “For evaluation only”.

---

## 4. Grading

Total: **500 points**

- Up to **50 bonus points**

### Breakdown:

| Category                            | Points  | Note        |
| ----------------------------------- | ------- | ----------- |
| **Documentation**                   | 50 pts  | <30 = FAIL  |
| ├─ Technical Doc                    | 30 pts  |             |
| └─ User Manual                      | 20 pts  |             |
| **UI Quality**                      | 10 pts  |             |
| **UX Quality**                      | 10 pts  |             |
| **Deployment**                      | 50 pts  | <30 = FAIL  |
| ├─ Architecture & Abstraction       | 30 pts  |             |
| └─ Dockerization                    | 20 pts  |             |
| **Features**                        | 190 pts | <100 = FAIL |
| ├─ Auth (Signup/Login)              | 30 pts  |             |
| │ ├─ Standard login                 | 10 pts  |             |
| │ └─ OAuth2 login                   | 20 pts  |             |
| └─ General Features                 | 160 pts |             |
|    ├─ Workspaces & Channels         | 40 pts  |             |
|    ├─ Messaging                     | 40 pts  |             |
|    ├─ Notifications                 | 20 pts  |             |
|    ├─ Permissions                   | 20 pts  |             |
|    └─ Integrations & Search         | 40 pts  |             |
| **Code Quality**                    | 190 pts | <100 = FAIL |
| └─ Assessed per feature implemented |         |             |
|    ├─ Data structure use            | ✔       |             |
|    ├─ No code duplication           | ✔       |             |
|    ├─ Readability (naming, logic)   | ✔       |             |
|    └─ Maintainability & abstraction | ✔       |             |

---

### Bonus (up to 50 pts)

Examples:

- Professional-grade UI/UX, robust architecture, clean code
- App deployed and available online
- Extra features (video calls, screen sharing, etc.)

---

### Penalties

- **Hardcoded secrets** (API key, password):
  - Minor → Code quality score = 0
  - Critical → Project fails
- **Passwords stored in plain text** → Immediate project failure

---
