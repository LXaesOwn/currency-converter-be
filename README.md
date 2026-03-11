# Currency Converter Backend

A robust RESTful API for currency conversion with multi-level caching, user management via httpOnly cookies, and external exchange rate integration.

## Features

- **User Authentication**: Automatic user identification via httpOnly cookies (no login required)
- **Multi-Level Caching**:
  - In-memory cache (5 minutes) for repeated user requests
  - Database cache (24 hours) for exchange rates
  - Static list cache (1 hour) for supported currencies
- **External API Integration**: Fetches real-time exchange rates from exchangerate.host
- **Comprehensive Documentation**: Swagger UI available at `/api-docs`
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Clean Architecture**: Repository pattern, service layer, and separation of concerns

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| TypeScript | Programming language |
| Supabase | PostgreSQL database |
| Zod | Data validation |
| memory-cache | In-memory caching |
| Swagger UI | API documentation |
| Axios | HTTP client for external API |
| ESLint + Prettier | Code quality |

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account (free tier works perfectly)
- Exchange rate API key (optional - exchangerate.host works without key)
