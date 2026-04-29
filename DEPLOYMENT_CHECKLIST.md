# OnKey - Production Deployment Checklist

## 🔒 Security & Configuration

### Environment Variables
- [ ] `.env` configured with all required variables:
  - [ ] `DATABASE_URL` pointing to production MySQL
  - [ ] `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - [ ] `JWT_REFRESH_SECRET` (generate with different value)
  - [ ] `FRONTEND_URL` = https://onkey.com.ar or https://www.onkey.com.ar
  - [ ] `MP_ACCESS_TOKEN` from MercadoPago
  - [ ] `MP_WEBHOOK_SECRET` from MercadoPago
  - [ ] `GOOGLE_CLIENT_ID` from Google Cloud Console
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (Gmail or SendGrid)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001` (or Railway assigned port)
  - [ ] `LOG_LEVEL=WARN` (minimize logs in production)
  - [ ] `RATE_LIMIT_WINDOW=900000` (15 minutes in ms)
  - [ ] `RATE_LIMIT_MAX_REQUESTS=5` (login endpoint)

### Secrets & Credentials
- [ ] JWT_SECRET is 32+ random bytes (NOT hardcoded)
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] MercadoPago webhook secret matches backend config
- [ ] Google OAuth credentials are restricted to production domain
- [ ] SMTP credentials tested and working
- [ ] No secrets in git history (check: `git log --all -S "secret" --source`)

### Security Headers
- [ ] Helmet middleware configured:
  - [ ] CSP enabled (Content-Security-Policy)
  - [ ] HSTS enabled (maxAge: 1 year)
  - [ ] X-Frame-Options: deny
  - [ ] X-Content-Type-Options: nosniff
- [ ] CORS origin whitelist updated for production domain
- [ ] Rate limiting enabled on:
  - [ ] POST /api/auth/login (5 attempts/15 min)
  - [ ] POST /api/auth/register (3 /24 hours)
  - [ ] POST /api/auth/resend-verification (3/24 hours)
  - [ ] POST /api/subscriptions/webhook (100/15 min)

### SSL/TLS
- [ ] HTTPS enabled (not HTTP)
- [ ] SSL certificate valid and non-expired
- [ ] certificate auto-renewal configured (Let's Encrypt)
- [ ] HSTS preload header included in Helmet

---

## 🗄️ Database

### Migrations
- [ ] Run all database migrations:
  ```bash
  # Log into MySQL
  mysql -h <host> -u <user> -p <database> < backend/migrations/001-*.sql
  mysql -h <host> -u <user> -p <database> < backend/migrations/010-*.sql
  mysql -h <host> -u <user> -p <database> < backend/migrations/015-*.sql
  # (Full list below)
  ```
- [ ] Verify tables exist: `SHOW TABLES;`
- [ ] Verify indices created: `SHOW INDEXES FROM <table>;`
- [ ] Verify data integrity:
  ```sql
  SELECT COUNT(*) FROM usuarios;
  SELECT COUNT(*) FROM tenants;
  SELECT COUNT(*) FROM propiedades;
  ```

### Backup Strategy
- [ ] Daily automated backups enabled (Railway, AWS RDS, etc)
- [ ] Backup encryption enabled
- [ ] Test restore procedure (restore to staging, verify data)
- [ ] Backup retention: minimum 30 days
- [ ] Backup notifications configured

### Performance
- [ ] All indices from migration 015 created:
  ```sql
  -- Verify with:
  SHOW INDEX FROM contratos;
  SHOW INDEX FROM personas;
  -- etc
  ```
- [ ] Query performance tested (EXPLAIN plans reviewed)
- [ ] Connection pooling configured (pool size: 10)
- [ ] Slow query log enabled for monitoring

---

## 📦 Dependencies & Build

### Node.js & Packages
- [ ] Node.js version >= 18.x
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `npm ci` (clean install from package-lock.json)
- [ ] No devDependencies in production bundle
- [ ] Critical packages pinned to specific versions:
  - [ ] express: 4.19.2+
  - [ ] jsonwebtoken: 9.0.3+
  - [ ] bcrypt: 6.0.0+
  - [ ] helmet: 3.0.0+
  - [ ] express-rate-limit: latest

### Frontend Build
- [ ] `npm run build` produces optimized bundle
- [ ] Source maps excluded from production
- [ ] API_URL environment variable set correctly
- [ ] GOOGLE_CLIENT_ID set correctly in frontend
- [ ] Vercel deployment configured with correct env vars

---

## 🚀 Deployment Process

### Pre-Deployment Testing
- [ ] All tests passing locally:
  ```bash
  npm test
  ```
- [ ] Manual testing of critical flows:
  - [ ] Register new account → email verification → login
  - [ ] Create property → create lease
  - [ ] Upgrade plan → webhook processing
  - [ ] Rate limiting works (test with 10 rapid logins)
  - [ ] Error messages don't expose stack traces

### Deployment Steps
- [ ] Database migrations run successfully
- [ ] Backend deployed (Railway or similar)
- [ ] Frontend deployed (Vercel or similar)
- [ ] Environment variables verified in production
- [ ] Health check passes: `curl https://api.onkey.com.ar/api/health`
- [ ] Smoke tests passed (login, create property, etc)

### Post-Deployment
- [ ] Monitor error logs (first 24 hours)
- [ ] Check database disk usage
- [ ] Verify SSL certificate
- [ ] Test backup restore procedure
- [ ] Performance baseline recorded

---

## 📊 Monitoring & Logging

### Application Logging
- [ ] Structured logging enabled (JSON format)
- [ ] Log aggregation configured (CloudWatch, DataDog, ELK, etc)
- [ ] Log retention: 30+ days
- [ ] Sensitive data redacted in logs:
  - [ ] No password hashes logged
  - [ ] No JWT tokens logged
  - [ ] No document numbers logged
  - [ ] No email addresses in logs (sanitized)

### Error Tracking
- [ ] Sentry or similar error tracking configured
- [ ] Critical errors alert team
- [ ] Error messages sanitized (no stack traces to users)

### Performance Monitoring
- [ ] Uptime monitoring enabled (StatusPage, Datadog, etc)
- [ ] Database performance monitored
- [ ] API response times tracked
- [ ] Alert thresholds set:
  - [ ] API response time > 2s
  - [ ] Error rate > 5%
  - [ ] Database CPU > 80%
  - [ ] Disk usage > 80%

### Security Monitoring
- [ ] Failed login attempts tracked
- [ ] Rate limit breaches logged
- [ ] Webhook validation failures logged
- [ ] Suspicious activity alerts configured

---

## 📝 Documentation

### API Documentation
- [ ] API endpoints documented
- [ ] Authentication flow documented (JWT + refresh tokens)
- [ ] Error codes documented
- [ ] Rate limit limits documented
- [ ] Webhook format documented

### Runbooks
- [ ] Incident response runbook created
- [ ] Database recovery procedure documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed

### Code Comments
- [ ] Security-critical code well-commented
- [ ] Complex algorithms explained
- [ ] TODO items tracked in code or issue tracker

---

## 🔄 Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs and Sentry alerts
- [ ] Weekly: Monitor database disk usage
- [ ] Monthly: Review security logs
- [ ] Monthly: Update dependencies (if security updates available)
- [ ] Quarterly: Penetration testing / security audit
- [ ] Yearly: Disaster recovery drill

### Update Strategy
- [ ] Security updates applied within 24 hours
- [ ] Major version updates tested in staging first
- [ ] Downtime windows scheduled during low-traffic periods
- [ ] Notification sent to users before major updates

---

## ✅ Final Checklist (Before Launch)

**Security:**
- [ ] No hardcoded secrets
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Data filtering working
- [ ] Error messages sanitized

**Performance:**
- [ ] Database indices created
- [ ] Connection pool configured
- [ ] Static assets cached
- [ ] API response times < 500ms

**Reliability:**
- [ ] Database backups configured
- [ ] Monitoring enabled
- [ ] Error tracking enabled
- [ ] Incident response plan ready
- [ ] Rollback procedure documented

**Compliance:**
- [ ] GDPR privacy policy reviewed
- [ ] Terms of service updated
- [ ] Cookie consent configured
- [ ] Payment security (PCI-DSS via MercadoPago)

---

## 🆘 Rollback Procedure

If critical issues found after deployment:

1. **Immediate Actions:**
   ```bash
   # Stop accepting new requests (optional)
   # Switch to previous working version
   git checkout <previous_commit>
   npm ci
   npm run build
   ```

2. **Database Rollback:**
   ```bash
   # Restore from backup if schema changed
   mysql -h <host> -u <user> -p <database> < backup.sql
   ```

3. **Notify Users:**
   - Update StatusPage to "Investigating"
   - Notify support team
   - Prepare communication for users if necessary

4. **Post-Mortem:**
   - Document what went wrong
   - Fix issue in staging environment
   - Test thoroughly before re-deployment

---

**Last Updated:** 2026-04-28
**Deployment Status:** Ready for Review
