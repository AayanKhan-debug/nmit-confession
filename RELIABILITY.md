# Reliability & Observability Guide

## 1. Health
- **Endpoint:** `/actuator/health`
- **Purpose:** Used for basic liveness and readiness probing.
- **Safety:** It only returns the overall status (e.g., `{"status":"UP"}`) without leaking database credentials, environment variables, or internal configuration. Other sensitive endpoints (`/env`, `/beans`) are strictly disabled.

## 2. Logging
- **Format:** Configured in `application.properties` to use structured plain-text logging.
- **Levels:** Standard levels (`INFO`, `WARN`, `ERROR`) are applied to production. Detailed SQL logging is disabled to maintain privacy and reduce IO overhead.
- **Safe Fields:** Logs include standard HTTP parameters (Method, Path, Status, Duration), generic error IDs, and correlation identifiers.
- **Prohibited Sensitive Fields:** **Passwords, Session IDs, device tokens, voter/reporter tokens, IP addresses, student IDs, and raw confession content are NEVER logged.**

## 3. Request Correlation
- **Lifecycle:** A random UUID `X-Request-ID` is assigned to each incoming request via `RequestLoggingFilter` if one isn't present.
- **MDC (Mapped Diagnostic Context):** This ID is propagated through the SLF4J MDC, meaning every log statement generated during the request's lifecycle is automatically tagged with the `requestId`.
- **Response:** The ID is returned to the client in the `X-Request-ID` header.
- **Privacy:** Request IDs are purely operational, strictly non-persisted, and never linked to device tokens, IPs, or submissions.

## 4. Errors
- Unexpected errors (`Exception.class`) return a generic 500 response alongside a randomly generated `errorId` and the current `requestId`.
- Stack traces, SQL errors, and framework internals are safely suppressed in `GlobalExceptionHandler`.
- Expected client errors (400, 403, 404, 409, 429) continue to provide structured, sanitized failure details.

## 5. Database Reliability
- **Transactions:** High-risk workflows (e.g., Moderation updates, report creation, reaction counter updates) are strongly governed by `@Transactional` boundaries. Rollback tests confirm that partial failures (such as an audit log crash) correctly abort the entire state transition.
- **Failure Behavior:** If PostgreSQL is unreachable during application startup, the service fails fast, providing immediate operational visibility without falling back to a hidden H2 instance.

## 6. Concurrency
- Pessimistic write locks (`PESSIMISTIC_WRITE`) remain enforced on critical operations like `ReactionService.java` and `ReportService.java`.
- Duplicate insertion prevention is strictly guarded by unique database constraints (`DataIntegrityViolationException`), keeping race conditions completely neutralized.

## 7. Sessions & Rate Limits
- **Sessions:** Since the application utilizes stateful HTTP Sessions, multiple application instances require a load balancer configured with sticky sessions (session affinity).
- **Rate Limiting:** IP-less device tracking rate limits are instance-local (kept in-memory via `ConcurrentHashMap`). The architectural limitation of non-distributed rate-limiting is intentional to preserve absolute anonymity and avoid introducing Redis at this stage.

## 8. Monitoring & Limitations
Operators can safely observe application throughput, endpoint failure rates, database connectivity, and backend latency without collecting user identity. No formal load testing or capacity claims have been made. Docker deployments depend on host environments with the Docker engine installed (which may be unavailable on strict validation hosts).
