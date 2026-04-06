# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Yunto, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **vedant@yunto.in** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within 48 hours acknowledging receipt.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest `main` | Yes |
| Older releases | No |

## Security Practices

- JWT RS256 with asymmetric key pairs
- Access/refresh token rotation with short-lived access tokens
- Role-based access control (RBAC) with 5 permission levels
- Multi-tenant data isolation via middleware guards
- Input validation with Zod schemas at API boundaries
- Parameterized queries via Prisma ORM (SQL injection prevention)
- CORS and rate limiting on all API endpoints
