# Email Configuration for Password Reset

This document explains how to configure email functionality for the forgot password feature.

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# SMTP Configuration for Email
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password-or-app-password
```

## Popular Email Provider Settings

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Note**: For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password (not your regular password)
3. Use the App Password in `SMTP_PASS`

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

## Features

### Password Reset Flow
1. User enters email on `/forgot-password` page
2. System generates a secure reset token (32 bytes)
3. Token expires after 15 minutes
4. Email sent with reset link to `/reset-password?token=...`
5. User clicks link and sets new password
6. Token is cleared after successful reset

### Security Features
- **Token Expiry**: Reset tokens expire after 15 minutes
- **One-time Use**: Tokens are cleared after successful password reset
- **Secure Generation**: Uses crypto.randomBytes for token generation
- **Email Validation**: Only sends emails to existing users with passwords
- **Privacy Protection**: Doesn't reveal if email exists in system

### Email Template
The password reset email includes:
- Professional HTML design with TaYaima branding
- Clear call-to-action button
- Security warnings about token expiry
- Plain text fallback
- Responsive design

## Testing Email Configuration

The email service includes a test connection method. You can verify your SMTP settings are working correctly.

## Error Handling

- If email configuration is missing, the system logs warnings but doesn't crash
- Failed email sends are logged but don't prevent the user flow
- Users always receive success messages for security (prevents email enumeration)

## Production Considerations

1. **Use a Dedicated Email Service**: Consider using SendGrid, Mailgun, or AWS SES for production
2. **Monitor Email Delivery**: Set up monitoring for failed email deliveries
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Email Templates**: Customize the email template to match your brand
5. **Logging**: Monitor password reset attempts for security

## Troubleshooting

### Common Issues

1. **Gmail "Less Secure Apps"**
   - Gmail no longer supports "less secure apps"
   - Use App Passwords instead

2. **Port Issues**
   - Try port 465 (SSL) if 587 (TLS) doesn't work
   - Update `SMTP_PORT` accordingly

3. **Authentication Errors**
   - Verify username and password are correct
   - For Gmail, ensure you're using App Password
   - Check if 2FA is required

4. **Firewall Issues**
   - Ensure your server can connect to SMTP ports
   - Check if your hosting provider blocks SMTP

### Testing

You can test the email functionality by:
1. Going to `/forgot-password`
2. Entering a valid user email
3. Checking your email inbox
4. Following the reset link

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |

Make sure to restart your application after adding these environment variables.
