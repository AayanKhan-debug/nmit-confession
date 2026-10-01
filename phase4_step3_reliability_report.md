# Phase 4 Step 3 — Reliability & Observability Report

## 1. Reliability Changes
- Integrated `spring-boot-starter-actuator` to safely expose `/actuator/health` while keeping all sensitive endpoints disabled.
- Introduced rigorous transaction rollback verification to explicitly prove partial operations revert effectively (e.g., failed audit writes successfully roll back `Confession` status updates).
- Guaranteed fast-fail startup semantics when PostgreSQL configuration is unreachable, preventing dangerous `H2` silently fallbacks in production.

## 2. Observability Changes
- **Logging:** Enabled standardized, operational logging formatted via `%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - [%X{requestId}] - %msg%n`.
- **Correlation ID:** Created `RequestLoggingFilter.java` to attach a unique, randomized `X-Request-ID` to the MDC context and HTTP response headers.
- **Error Handling:** Extended `GlobalExceptionHandler.java` to suppress internal stack traces on 500 errors, instead returning a sanitized response containing a randomly generated `errorId` and the context `requestId` for safe operator diagnosis.

## 3. Database Reliability
- **Transactions:** Rollback tests have been validated using mock-driven injection inside `TransactionTest.java`.
- **Concurrency:** Existing JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` and strict constraint violation handling (`DuplicateReactionException`) preserve absolute data integrity against concurrent modifications.
- **Failure Behavior:** Tested failing audit writes correctly canceling upstream Confession saves and Reaction counting operations. 

## 4. Frontend Reliability
- Frontend API client remains robustly configured to intercept backend 4XX/5XX responses and render safe localized UI errors without exposing backend internal stacks.
- Unintentional, blind mutations (like auto-retrying a reaction submission or anonymous confession) remain strictly avoided to respect backend idempotency. 

## 5. Security & Privacy
- **Deanonymization avoided:** Filter logging captures HTTP context (Method, URI, Status, Latency) strictly avoiding query parameters, request bodies, and identity tokens.
- Audited logs to ensure no instances of `IP`, `RemoteAddr`, `device_token`, or `student_id` are persisted to `stdout`/`stderr`.
- `X-Request-ID` acts as a purely operational correlation identifier disconnected from any token/session state. 

## 6. Tests
- **Backend tests:** 110/110
- **Frontend typecheck:** PASS
- **Frontend build:** PASS
- **PostgreSQL validation:** PASS
- **Docker validation:** NOT EXECUTED

## 7. Known Limitations
- **Stateful Sessions:** Stateful scaling is limited; multiple instances demand sticky session configurations.
- **Instance-local Rate Limiting:** Abuse control relies on JVM memory (`ConcurrentHashMap`), requiring independent limits per replica unless replaced with Redis in the future.
- **No distributed logging:** File or log aggregation is fully delegated to the surrounding deployment architecture (e.g., Docker standard output logs).
- **Docker availability:** Smoke testing inside an orchestrated Compose setup remains unexecuted due to Docker binary restrictions in the host workspace.

## 8. Files Changed
- `src/main/java/com/nmit/confessions/config/RequestLoggingFilter.java` (Created)
- `src/main/java/com/nmit/confessions/exception/GlobalExceptionHandler.java` (Modified)
- `src/main/resources/application.properties` (Modified)
- `src/test/java/com/nmit/confessions/service/TransactionTest.java` (Modified)
- `RELIABILITY.md` (Created)
