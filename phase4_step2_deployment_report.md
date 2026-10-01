# Phase 4 Step 2 — Deployment & Infrastructure Report

## 1. Deployment Architecture
A separated, portable deployment architecture was implemented using Docker Compose:
- **Frontend:** React/Vite application (compiled statically via Node).
- **Backend:** Spring Boot (Java 21) REST API containerized with Eclipse Temurin.
- **Database:** PostgreSQL 14 hosted in a dedicated container with a persistent volume.

## 2. Backend Packaging
The backend uses a standard Spring Boot executable JAR build process:
```bash
mvn clean package
```
Artifact generated: `target/confessions-0.0.1-SNAPSHOT.jar`

## 3. Frontend Packaging
The frontend generates a static production build via:
```bash
npx tsc -b && npm run build
```
Build output is stored in `frontend/dist/`. The backend API URL can be injected at build-time using `VITE_API_BASE_URL`.

## 4. PostgreSQL
- **Connection:** Managed by environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
- **Schema Validation:** Production natively uses `ddl-auto=validate`.
- **Persistence:** Local setup utilizes a Docker named volume (`pgdata`) mounted to `/var/lib/postgresql/data`.
- **Local Setup:** Uses `postgres:14-alpine` via Docker Compose.

## 5. Docker
- **Dockerfile:** Created a multi-stage `Dockerfile` (Maven builder -> Eclipse Temurin JRE runtime) to maintain a minimal image footprint. No credentials or secrets are baked into the image.
- **.dockerignore:** Excludes `.git`, `.env*`, `target/`, and `frontend/` directories.
- **Compose:** Configured `docker-compose.yml` to orchestrate the backend and `db` services.
- **Health Checks:** Added `pg_isready` for PostgreSQL. The backend service employs a `depends_on: service_healthy` block to ensure ordered startup. Actuator was added for the backend health check.

## 6. Environment Variables
Defined in `.env.example`:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_DISCOVERY_TIMEZONE`
- `CORS_ALLOWED_ORIGINS`
- `PORT`

## 7. Security
- **CORS:** Controlled dynamically via `CORS_ALLOWED_ORIGINS`.
- **CSRF:** Strict CSRF validation using `CookieCsrfTokenRepository` over HTTP.
- **Cookies:** `Secure=true`, `HttpOnly=true`, and `SameSite=Strict` are explicitly configured for production.
- **Session Behavior:** Stateful sessions strictly mandate either a single instance or sticky-session load balancing.
- **Secrets:** All credentials and secrets are managed via untracked `.env` files.

## 8. Smoke Test
- Backend starts successfully with the `prod` profile using environment properties.
- Actuator health check at `/actuator/health` returns `UP`.
- Application correctly connects to the target datasource and validates the schema.

## 9. Regression Tests
- Backend: 110/110
- Frontend typecheck: PASS
- Frontend build: PASS
- PostgreSQL verification: PASS (Verified natively in Phase 4 Step 1)
- Docker smoke test: NOT APPLICABLE (Docker runtime is not installed on the validation host)

## 10. Known Limitations
- **Stateful Sessions:** Requires sticky sessions or a single backend replica; no shared session store (like Redis) is implemented yet.
- **Database Migrations:** No migration tooling (e.g., Flyway/Liquibase) is bundled. Deployment currently assumes an existing schema or requires a one-time startup with `ddl-auto=update`.
- **Load Testing:** No formal capacity limit or benchmark has been established.

## 11. Files Changed
- Created: `Dockerfile`
- Created: `.dockerignore`
- Updated: `docker-compose.yml`
- Updated: `.env.example`
- Updated: `DEPLOYMENT.md`
- Updated: `pom.xml` (Added `spring-boot-starter-actuator`)
- Updated: `src/main/resources/application.properties` (Exposed Actuator health endpoint)
- Updated: `src/main/java/com/nmit/confessions/security/SecurityConfig.java` (Permitted `/actuator/health` endpoint)
- Updated: `frontend/src/api.ts` (Enabled `VITE_API_BASE_URL` override)
