# Deployment Architecture

## 1. Architecture

The application uses a separated architecture deployed via Docker Compose:

```text
React/Vite Frontend (Static Build / Separately Deployable)
   ↓
Spring Boot Backend (Containerized)
   ↓
PostgreSQL Database (Containerized)
```

## 2. Requirements

- Java 21 (Eclipse Temurin)
- Maven 3.9+
- Node.js 20+
- npm 10+
- Docker and Docker Compose (for the provided Compose deployment)
- PostgreSQL 14 (if deployed natively without Docker)

## 3. Environment Variables

Provide the following environment variables (defined in `.env.example`). Do NOT commit real values to version control.

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_DISCOVERY_TIMEZONE`
- `CORS_ALLOWED_ORIGINS`
- `PORT`

## 4. Local PostgreSQL

For local/Docker deployments, a robust PostgreSQL container configuration is provided in `docker-compose.yml`. It uses environment variables, a named persistent volume (`pgdata`), and a standard `pg_isready` health check. 

## 5. Backend

To build the Spring Boot artifact manually (and run the full test suite):

```bash
mvn clean package
```

The application starts in production mode by setting `SPRING_PROFILES_ACTIVE=prod`.

## 6. Frontend

To build the frontend manually:

```bash
cd frontend
npm install
npm run build
```

Configure the backend URL by passing `VITE_API_BASE_URL` at build-time if the frontend is hosted on a different domain than the backend.

## 7. Docker

To run the complete Backend + PostgreSQL deployment via Docker:

```bash
docker compose up --build -d
```

## 8. CORS

The backend securely restricts CORS to protect anonymous identities. You MUST specify the production frontend origin via the `CORS_ALLOWED_ORIGINS` environment variable (e.g., `https://confessions.example.com`).

## 9. Sessions

The backend uses in-memory, stateful HTTP sessions for authentication, abuse controls, and CSRF protection. Therefore, you must use **single-instance hosting** OR configure **sticky sessions** (session affinity) on your load balancer.

## 10. CSRF

CSRF protection is strictly enforced. It operates via the `X-XSRF-TOKEN` cookie/header mechanism. Do not disable it. Ensure that reverse proxies properly forward the `X-Forwarded-Proto` header if terminating SSL.

## 11. PostgreSQL

The production profile relies on the database schema already existing, using:
`spring.jpa.hibernate.ddl-auto=validate`

PostgreSQL compatibility has been strictly validated (Phase 4 Step 1). Schema migrations (like Flyway/Liquibase) are not currently bundled; for initial generation, you may temporarily set `SPRING_JPA_DDL_AUTO=update` on first boot.

## 12. Troubleshooting

- **Backend cannot connect to database:** Ensure `SPRING_DATASOURCE_URL` uses the correct internal Docker host (e.g. `db` rather than `localhost`).
- **CORS Error:** Verify `CORS_ALLOWED_ORIGINS` matches the exact protocol and domain of the frontend.
- **Frontend cannot reach backend:** If frontend is decoupled, ensure `VITE_API_BASE_URL` was baked in during the build.
- **CSRF Failure / Missing Token:** Ensure your deployment uses HTTPS and passes cookies properly. `SameSite=Strict` may drop cookies across non-matching subdomains.
- **Session cookie not being sent:** Ensure the reverse proxy configuration trusts proxy headers if the application sits behind an SSL load balancer.
