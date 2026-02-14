# Admin Environment Setup Guide

This guide explains how to configure the Super Admin account for different environments (Local, Staging, Production). The system uses an automated script to manage the Super Admin credentials securely.

## 1. The Super Admin Rotator Script

We use `scripts/super-admin-rotator.ts` to create or update the Super Admin account.

- **Role**: Assigns the `SUPER_ADMIN` role (wildcard permissions).
- **Password**: Generates a random secure password.
- **Notification**: Emails the new credentials to the configured email address.

## 2. Environment Configuration

You must configure the `SUPER_ADMIN_EMAIL` environment variable for each environment. This ensures that the sensitive Super Admin access is tied to the correct person/alias for that specific environment.

### Local Environment (`.env`)

For local development, use your personal work email or a dummy one.

```bash
SUPER_ADMIN_EMAIL=developer@mls.com
```

**To Setup:**

1.  Add the variable to your `.env` file.
2.  Run: `bun run scripts/super-admin-rotator.ts`
3.  Check your console (or email if SMTP is configured) for the password.

### Staging Environment

Use a shared staging alias or the QA lead's email.

```bash
SUPER_ADMIN_EMAIL=admin-staging@mls.com
```

**Deployment Step:**
Ensure this variable is set in your CI/CD pipeline or staging server environment variables.

### Production Environment

**CRITICAL**: Use a dedicated, secure email alias for production access usage.

```bash
SUPER_ADMIN_EMAIL=admin-prod@mls.com
```

## 3. Automation (Password Rotation)

For security, the Super Admin password should be rotated regularly (e.g., every 24 hours).

**Cron Job Setup:**
Configure a daily cron job on the server to run the rotator script:

```bash
0 0 * * * cd /path/to/project && bun run scripts/super-admin-rotator.ts
```

This ensures that even if a password is leaked, it is only valid for a maximum of 24 hours.

## 4. Troubleshooting

**"I lost the Super Admin password"**
Manually run the script on the relevant environment server to generate a new one immediately.

```bash
bun run scripts/super-admin-rotator.ts
```
