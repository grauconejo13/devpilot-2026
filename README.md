# DevPilot 2026 – Shell App (Micro Frontend Host)

## Overview

This repository contains the Shell App (Host)

The Shell is responsible for orchestrating multiple **Micro Frontends (MFEs)** and connecting them to backend **Microservices** through a unified **Apollo Gateway**.

This implementation follows a **Micro Frontend + Microservice architecture**, where the Shell acts as the central integration layer.

---

## Responsibilities

The Shell application is responsible for:

- Hosting and dynamically loading Micro Frontends using Module Federation
- Managing global routing (React Router)
- Providing a single Apollo Client instance
- Handling authentication state using session-based authentication
- Enforcing protected routes
- Providing a unified navigation layout

---

## Architecture

### Frontend (Micro Frontends)

- **Shell App (Host)** → This repository
- **Projects App (Remote)** → Project management UI
- **AI Review App (Remote)** → Placeholder for future AI integration

### Backend (Microservices via Apollo Federation)

- **Auth Service** → Authentication and session management
- **Projects Service** → Projects, features, drafts
- **Apollo Gateway** → Unified GraphQL endpoint (`/graphql`)

---

## Communication Flow

Shell App
↓
Apollo Client (credentials: include)
↓
Apollo Gateway (/graphql)
↓
Auth Service + Projects Service

---

## Authentication Strategy

- Session-based authentication
- HTTP-only cookies (no JWT in localStorage)
- Session stored in MongoDB (handled by Auth Service)
- Session persists across browser refresh

Example query used by Shell:

```graphql
query {
  currentUser {
    id
    username
    role
  }
}

Tech Stack
React 18 (TypeScript)
Vite
Vite Module Federation
Apollo Client (GraphQL)
React Router
React Bootstrap
Getting Started
Install dependencies
npm install
Run development server
npm run dev

Default:

http://localhost:5173

Micro Frontend Integration

The Shell dynamically loads remotes using Module Federation.

Example:

const ProjectsApp = lazy(() => import("projects/App"));

All remotes must:

Share React as a singleton
Use the same React version (18.2.0)

Important Notes
Single Apollo Client

The Shell owns the only Apollo Client instance to ensure:

consistent authentication
no duplicated network layers
Cookie-Based Authentication

All GraphQL requests must include:

credentials: "include"
React Version Consistency

All applications must use:

"react": "18.2.0",
"react-dom": "18.2.0"

to avoid runtime conflicts.
No Business Logic in Shell
The Shell is responsible for orchestration only.

It does not:
implement backend logic
handle database operations
enforce business rules

Current Milestone Status
 Vite + React + TypeScript setup
 Apollo Client configured
 Auth context structure prepared
 Routing and protected routes scaffolded
 Backend integration (Auth + Gateway)
 Micro Frontend integration (Projects + AI Review)

Team Responsibilities
Member	Responsibility
Member A	Auth Service
Member B	Apollo Gateway
Member C	Projects Service
Member D	AI Review Service
Member E	Micro Frontends UI
Member F  Shell App
```
