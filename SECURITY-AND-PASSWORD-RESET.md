# AI FARM Security and Password Reset

## Role rules

- Owner can create and assign Manager, Agronomist, Technician and Worker.
- Manager can create and assign Agronomist, Technician and Worker.
- Manager cannot create/promote another Manager or Owner.
- Worker, Agronomist and Technician cannot manage users.
- The API enforces these rules; the frontend only reflects them.

## Authentication

- Passwords are hashed with BCrypt.
- JWT issuer, audience, signature and lifetime are validated.
- HTTPS is used for local development.
- Remember Me uses persistent browser storage only when checked. Without it, the login session uses sessionStorage.
- Protected API calls accept either the remembered or session-only token.

## Password reset

Forgot Password is implemented with a one-time cryptographically random token.

- Token lifetime: 30 minutes.
- Only a SHA-256 hash of the reset token is stored in SQL Server.
- The token is removed after a successful reset.
- Password change also invalidates any outstanding reset token.
- Forgot-password responses do not reveal whether an email exists.
- In Development, when SMTP is not configured, the API returns a development-only reset link so the feature can be tested.
- In a real deployment, configure SMTP in `appsettings`/environment secrets.

### SMTP configuration

Do not commit a real SMTP password to source control. Configure these values through user secrets or environment variables:

`Email:SmtpHost`
`Email:SmtpPort`
`Email:Username`
`Email:Password`
`Email:From`

### Database migration

A migration named `AddPasswordResetFields` adds the reset-token hash and expiry columns to `Users`.

Run:

```text
dotnet ef database update
```

from the `backend` folder.

## Other security hardening included

- CORS no longer uses AllowAnyOrigin.
- Login, registration and password-reset endpoints have rate limiting.
- Farm resources are scoped to the logged-in user's farm in the existing controllers.
- Role and permission checks remain server-side.
- Protected role fields are not accepted from public registration.
- Password reset links use URL fragments so the token is not sent to the server as part of the request URL.

## Production note

`appsettings.json` does not contain a production JWT signing key. Set `Jwt:Key` through a secure secret/environment configuration before deploying.

The Development configuration contains a development-only key for Visual Studio local development.
