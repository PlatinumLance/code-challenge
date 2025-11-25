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
    participant API as API Service (Express + TS)
    participant Postgres
    participant Pub as Redis Pub/Sub (or Kafka)
    participant Aggregator as Leaderboard Aggregator (worker)
    participant Cache as Redis (sorted set)
    participant WS as WS/SSE Service
    Browser->>LB: POST /actions/:actionId/complete (Authorization: Bearer <jwt>)
    LB->>API: forward request
    API->>API: verify JWT (auth middleware)
    API->>Postgres: BEGIN
    API->>Postgres: insert action_completion (user_id, action_id, points, ts)
    API->>Postgres: upsert users.score = users.score + points
    Postgres-->>API: ok
    API->>Postgres: COMMIT
    API->>Pub: publish "action_completed" event (user_id, delta, ts)
    Pub->>Aggregator: event
    Aggregator->>Cache: ZINCRBY leaderboard:global <delta> <user_id>
    Aggregator->>Cache: ZREVRANGE leaderboard:global 0 9 WITHSCORES
    Aggregator->>Aggregator: compare previous top10 vs new top10
    alt top10 changed
        Aggregator->>Pub: publish "top10_changed" (list)
        Pub->>WS: notify WS/SSE service
        WS->>Browser: push new top10 to subscribers
    else no change
        Aggregator->>Aggregator: no broadcast
    end
```
## Component diagram

```mermaid
graph TB
  Browser[Browser / Client]
  LB[Load Balancer / API Gateway]
  APIPods[API Service Pods<br/>Node.js + Express + TypeScript]
  Postgres[(PostgreSQL)]
  Redis[(Redis)<br/>- Pub/Sub<br/>- Sorted Set (ZSET) for leaderboard)]
  Aggregator[Aggregator Worker(s)]
  WSPods[WS/SSE Service Pods]
  Metrics[Monitoring / Tracing]

  Browser --> LB
  LB --> APIPods
  APIPods --> Postgres
  APIPods --> Redis
  APIPods -->|publish events| Redis
  Redis --> Aggregator
  Aggregator --> Redis
  Aggregator -->|notify| Redis
  Redis --> WSPods
  WSPods --> Browser
  APIPods --> Metrics
  Aggregator --> Metrics
  WSPods --> Metrics
```

## API specification

### Authentication

* Use JWT (signed with strong HMAC or RSA keys). JWT contains `sub=user_id`, `exp`, `iat`, roles/claims.
* All endpoints that mutate data must require `Authorization: Bearer <token>`.

## Additional improvement suggestions