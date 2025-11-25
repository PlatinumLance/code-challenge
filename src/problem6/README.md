# Architecture

## Requirements

- Records user action to increase user's score.
- Show top 10 users with highest scores.
- Pushes live update when the leaderboard changes.
- Prevent malicious score manipulation.
- Support reasonable concurrency and scale

## Edge cases & asumptions
- Points per action are configured server-side.
- We assume no maximum score limit.
- Actions are idempotent because we store a request ID or nonce to detect and prevent duplicate processing.
- We assume clients use HTTPS and transport-level security.

## Tech Stack
- Node.js, TypeScript
- Express
- PostgreSQL
- Redis (for leaderboard cache)
- Kafka
- Docker for deployment

## Execution Flow

```mermaid
sequenceDiagram
    participant Browser
    participant LB as Load Balancer
    participant API as API Service
    participant Postgres
    participant Kafka
    participant Aggregator
    participant Cache as Redis (ZSET)
    participant WS as WS/SSE Service

    Browser->>LB: POST /actions/:actionId/complete
    LB->>API: forward request
    API->>API: verify JWT

    API->>Postgres: BEGIN
    API->>Postgres: insert action_completion
    API->>Postgres: upsert users.score += points
    Postgres-->>API: ok
    API->>Postgres: COMMIT

    API->>Kafka: publish action_completed (user_id, delta)

    Kafka->>Aggregator: event

    Aggregator->>Cache: ZINCRBY leaderboard <delta> <user_id>
    Aggregator->>Cache: ZREVRANGE top 10

    alt top10 changed
        Aggregator->>Kafka: publish top10_changed
        Kafka->>WS: deliver top10 update
        WS->>Browser: push SSE/WS update
    else
        note over Aggregator: no broadcast
    end
```
## Component diagram

```mermaid
graph TB
  Browser[Browser / Client]
  LB[Load Balancer]
  API[API Service Pods<br/>Node.js + Express]
  Postgres[(PostgreSQL)]
  Kafka[(Kafka Topics)]
  Redis[(Redis ZSET<br/>Leaderboard Cache)]
  Aggregator[Leaderboard Aggregator Worker]
  WS[WS/SSE Service]
  Metrics[Monitoring / Tracing]

  Browser --> LB
  LB --> API

  API --> Postgres
  API -->|publish action_completed| Kafka

  Kafka --> Aggregator
  Aggregator --> Redis
  Aggregator -->|publish top10_changed| Kafka

  Kafka --> WS
  WS --> Browser

  API --> Metrics
  Aggregator --> Metrics
  WS --> Metrics
```

## API specification

### Authentication

* Use JWT (signed with strong HMAC or RSA keys). JWT contains `sub=user_id`, `exp`, `iat`, roles/claims.
* All endpoints that mutate data must require `Authorization: Bearer <token>`.

## Database Schema
### users
| column     | type       | notes              |
| ---------- | ---------- | ------------------ |
| user_id    | UUID | PK                 |
| username   | text       | Optional           |
| score      | integer    | Updated atomically |
| created_at | timestamp  |                    |

### action_completions
| column     | type      | notes                |
| ---------- | --------- | -------------------- |
| id         | UUID      | PK                   |
| user_id    | FK(users) |                      |
| action_id  | text      | action type          |
| request_id | UUID      | for idempotency      |
| points     | integer   | computed server-side |
| created_at | timestamp |                      |

## Security & Anti score manipulation

### Idempotency

- Store a request_id for every action,
- Reject duplications.

### Replay prevention

- JWT must include iat with short expiry.
- Reject tokens older than configured threshold.

### Rate limit

#### Redis token bucket can help:

- Limit action completion per minute for each user.
- Helps detect score inflation.

## Additional suggestions

- Add action_types table to configure actions and points dynamically.
- Add fraud detection module to catch anomalies.
- Add integration tests simulating high concurrency and leaderboard churn.