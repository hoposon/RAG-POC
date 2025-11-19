# Application (client)

## Features
- add streaming support for long responses (SSE)
  - handle interrupted SSE (which cannot reconnect – timeout reached) and partial results
- allow user to cancel query (or force it) when user manually clicks **Cancel** / starts a new query
- a modal preview of source links (with BE metadata proxy)
- ask follow-up questions based on the result (adding the result as context – handling the context size)
- storing the results locally in IndexedDB → see previous chats and results

## Other
- logging unhandled exceptions and errors
  - to a logging service directly or via BE API
- we need a cookie consent because we will probably use cookies at least for security

## Env related
- different env related configs
  - API base URL
  - API version

---

# Backend (server)

## Features
- response streaming support towards the client (SSE) in case RAG is providing response streaming
  - I would go with the variant of caching the results from RAG for interrupted client connections
    - After reconnect, send either the remainder or the final message depending on timing
    - Keep some reasonable TTL for cached data + max entries
- allow follow-up questions
  - sending original question and response as a context to RAG

## Other
- retry RAG policy
  - well-defined error codes and retry options to minimize unnecessary loads on RAG
  - also to give user a reasonable error code (even though it usually ends up with a general “retry later” message)
  - exponential backoff for retries
  - I think retries in combination with streaming is an interesting topic in general
- connection timeouts
  - RAG streaming timeout for the server
- sanitize user inputs (or even context if that feature is used)
- every request should be assigned a unique ID which is inserted into a response header

## Abuse, overload preventions
- idempotency header → cache (same as streaming cache) with reasonable TTL and RAG request/response status
- per-session HttpOnly, signed, same-site cookie from the `/init` endpoint or authorization header token if API is on a different domain
  - additional use of reCaptcha on `/init` endpoint
- rate limiting on Nginx or similar
- rate limiting per session on API if desirable

## Client API versioning
- adds `/vX/chat` API versions
- keeps old versions in parallel until deprecated

## Logging, metrics
- log errors
- log API requests
  - structured JSONs with identification of the session and request-related data
- log metrics for
  - **cache**
    - size
    - turnarounds
    - cache hit/miss ratio
  - **RAG responses**
    - streaming started
    - streaming chunk count
    - streaming ended
    - streaming reconnected
    - streaming timed out
- there should not be any sensitive data logged, but in this case I guess there are not any

## Env related
- different env related configs
  - RAG API base URL
  - RAG API version
  - RAG API token

---

# Deployment and quality assurance

Two separate deployments.

## React app
- built by CI/CD
- deployed to a CDN (Netlify, Vercel, CloudFront, Cloudflare, etc.)
- static files: HTML, JS, CSS
- use Yarn Berry to speed up builds

## API backend (Node/Express)
- deployed to a server (AWS, ...)
- handles RAG requests
- does real work + security
- using a process manager (PM2) or container autoscaling

## Nginx in front
- routes `/` → SPA CDN
- routes `/chat`, `/init` → API backend
- applies rate limits
- manages TLS termination
- handles allowed methods/routes
- rejects malicious requests early

---

# General
- at least three envs on different subdomains
- CI runs tests → no deployment with errors
- we can have automated tests running against the live FE app
- checks for API being alive

# FE App specifics
- If we do not have test/stage/prod env we should have at least something as a preview deploy
