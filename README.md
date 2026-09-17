live project link: https://pomodoro-timer-app-yocs.vercel.app/

## Email setup

Password recovery OTPs and successful-account welcome emails are sent with Resend. Add these server-only variables to `.env.local` and your deployment environment:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="FocusFlow <noreply@your-verified-domain.com>"
```

The sender domain must be verified in Resend. Apply the password-reset migration before using the feature:

```bash
npx prisma migrate deploy
```
