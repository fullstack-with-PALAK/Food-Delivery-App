# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CraveCart, please report it by emailing security@cravecart.com. Please do not create a public GitHub issue for security vulnerabilities.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures

### Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Role-based access control
- Token expiration

### Data Protection
- HTTPS/SSL encryption in production
- Secure cookies (httpOnly, secure, sameSite)
- Input validation and sanitization
- SQL injection prevention (using Mongoose ORM)
- XSS protection

### API Security
- Rate limiting
- CORS configuration
- Authentication middleware
- Input validation
- Error handling without exposing sensitive data

### Payment Security
- Stripe PCI-compliant payment processing
- No credit card data stored
- Webhook signature verification

### Database Security
- MongoDB authentication enabled
- Connection string encryption
- Regular backups
- Access control

## Best Practices

1. **Never commit sensitive data**
   - Use environment variables
   - Add .env to .gitignore
   - Use .env.example for templates

2. **Keep dependencies updated**
   - Regular npm audit
   - Update packages with vulnerabilities
   - Monitor security advisories

3. **Secure deployment**
   - Use HTTPS
   - Configure CSP headers
   - Enable rate limiting
   - Set secure headers

4. **Monitor and log**
   - Track failed login attempts
   - Log suspicious activities
   - Set up alerts

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed.

---

Last updated: February 2026
