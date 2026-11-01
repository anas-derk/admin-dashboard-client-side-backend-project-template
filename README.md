# admin-dashboard-client-side-backend-project-template

REST API for `admin-dashboard-client-side-backend-project-template`, built with Node.js, Express, and MongoDB. It provides password, user management, OTP verification, contact information, localized transactional emails, and Redis-backed rate limiting.

## Requirements

- Node.js `20.11.0` or later.
- npm `10.2.4` or later, or pnpm.
- MongoDB replica set for the users and dashboard databases. Transactions are used for password resets.
- Redis at `127.0.0.1:6379` for rate limiting.
- SMTP credentials when transactional emails are enabled.

## Installation and Development

```bash
pnpm install
pnpm dev
```

Available commands:

| Command | Environment | Description |
|---|---|---|
| `pnpm dev` | development | Start the server with Nodemon |
| `pnpm start` | production | Start the production server |
| `pnpm staging` | staging | Start the staging server |
| `pnpm test` | test | Start the server with the test configuration |

The application loads the environment file matching `NODE_ENV`:

```text
.env.development
.env.production
.env.staging
.env.test
```

Environment loading, validation, defaults, and type conversion are centralized in
`src/config/environment`. Application modules consume that configuration instead of
reading `process.env` directly.

## Environment Variables

Create the environment file required for the selected environment. Never commit `.env*` files.

```dotenv
PORT=3000
TRUSTED_PROXIES=

DB_URL=mongodb://127.0.0.1:27017/client-side-backend-project-template-users
DASH_DB_URL=mongodb://127.0.0.1:27017/client-side-backend-project-template-dashboard

SECRET_KEY=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_TLS=false

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=replace-with-smtp-username
SMTP_PASSWORD=replace-with-smtp-password

WEBSITE_URL=https://example.com
BASE_API_IMAGES_URL=https://api.example.com
```

Leave `TRUSTED_PROXIES` empty when the API is exposed directly. When it runs behind
known reverse proxies, provide only their IP addresses or CIDR ranges as a comma-separated
allowlist, for example `loopback,10.0.0.0/8`. Forwarded IP headers are ignored unless the
immediate proxy is trusted by this setting.

Do not place real keys, credentials, or passwords in this file or in the Git repository.

## Architecture

The application follows this dependency flow:

```text
routes → controllers → services → repositories → models
```

```text
src/
├── config/          # Redis and rate-limiter configuration
├── constants/       # Application constants and reusable Zod fields
├── controllers/     # HTTP request and response handling
├── database/        # Database connections
├── helpers/         # Application response, exception, translation, and domain helpers
├── locales/         # Localized messages
├── middlewares/     # Authentication, files, and rate limiting
├── models/          # Mongoose models
├── repositories/    # Data access and the repository factory
├── routes/          # API route definitions
├── services/        # Business logic
├── templates/       # EJS email templates
├── utils/           # Technical utilities for dates, files, email, and Google identity
└── validators/      # Zod validation middlewares

public/
└── uploads/         # Publicly served uploaded files
```

## API Response Format

API responses use the following structure:

```json
{
  "status": true,
  "code": "LOGIN_SUCCESS",
  "message": "Operation completed successfully",
  "data": {}
}
```

- `status`: Whether the operation succeeded; it does not represent the HTTP status.
- `code`: A stable machine-readable result code.
- `message`: A localized, human-readable message.
- `data`: The response payload or `null`.

Example response for an unexpected error:

```json
{
  "status": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "INTERNAL_SERVER_ERROR",
  "data": null
}
```

## Localization

The desired language can be provided as a query parameter:

```http
?language=ar
```

When omitted, the application uses the default language configured in `src/constants/languages`.

## Authentication

Protected routes expect a Bearer token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Access tokens expire after 15 minutes. Login and account activation also return a
30-day opaque refresh token. Refresh tokens are stored only as SHA-256 hashes, are
rotated on every refresh, and are invalidated by logout or a password change. Reusing
the previous refresh token revokes its authentication session.

Changing a local account's email marks it as unverified and revokes all existing
authentication sessions. Emails managed by Google cannot be changed through this API.

## API Endpoints

There is currently no global prefix such as `/api`; all paths start at the server root.

### Authentication

| Method | Path | Required data |
|---|---|---|
| `POST` | `/auth/login` | `email`, `password` |
| `POST` | `/auth/refresh` | `refreshToken` |
| `POST` | `/auth/logout` | Bearer access token |
| `POST` | `/auth/forgot-password` | `email` |
| `PUT` | `/auth/reset-password` | `session`, `code`, `password` |

The forgot-password endpoint always returns the same public response shape whether or
not the email belongs to a local account, preventing direct account enumeration.

Example registration request:

```json
{
  "firstName": "Anas",
  "lastName": "Derk",
  "email": "user@example.com",
  "password": "Password1",
  "language": "ar"
}
```

### Verification Codes

| Method | Path | Required data |
|---|---|---|
| `POST` | `/otp` | `email`, `typeOfUse` |
| `POST` | `/otp/verify` | `session`, `code` |

Supported `typeOfUse` values:

- `activate-account`
- `reset-password`

The verification endpoint is protected by per-IP and per-session rate limiters in addition to the attempt lock stored with each verification code.

### Users

All endpoints in this section require a JWT.

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | Retrieve the current user |
| `PUT` | `/users` | Update the current user |
| `PUT` | `/users/image` | Replace the current user's profile image (`userImage` multipart field) |
| `DELETE` | `/users` | Delete the current user account |

The user update endpoint accepts the following optional fields:

```json
{
  "firstName": "Anas",
  "lastName": "Derk",
  "email": "user@example.com",
  "password": "CurrentPassword1",
  "newPassword": "NewPassword1"
}
```

Both `password` and `newPassword` must be provided when changing a password.

### Contact Information

| Method | Path | Description |
|---|---|---|
| `GET` | `/contact` | Retrieve public contact information |

## Validation and Security

- Body and query validation with Zod.
- Password hashing with bcrypt.
- JWT authentication for protected endpoints.
- Google ID token verification using Google Auth Library.
- Global and endpoint-specific rate limiting.
- Redis-backed rate-limit counters.
- Internal lockout for incorrect OTP attempts.
- Centralized exception handling without exposing internal error details.
- File-content type validation before storage.

## Reliability

- Password reset writes run in a MongoDB transaction: the OTP is consumed, the password is changed, authentication sessions are revoked, and the OTP session is removed atomically.
- Redis connection failures are propagated as server errors and are not reported as HTTP `429` responses.
- `SIGINT` and `SIGTERM` stop accepting requests and then close MongoDB and Redis connections. A ten-second deadline prevents shutdown from hanging indefinitely.

## Public Files

Express serves the contents of `public` as static files. Uploaded files are stored under:

```text
public/uploads/
```

Keep uploaded content out of Git while retaining the required `.gitignore` files that preserve the directory structure.

## License

ISC
