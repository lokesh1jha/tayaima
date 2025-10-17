# Phone Authentication Setup Guide

This guide explains how to set up phone number authentication with OTP using Fast2SMS integration.

## Features Implemented

✅ **Phone Number + OTP Authentication**
- Users can sign up and login using phone number + OTP
- OTP is sent via SMS using Fast2SMS API
- Rate limiting: 3 attempts per 10 minutes, 30-minute cooldown

✅ **Email + Password (Existing)**
- Traditional email/password authentication remains available
- Google OAuth integration maintained

✅ **Phone Number Management**
- Users can update their phone number in profile
- Phone number verification required for updates
- Phone numbers are unique across the system

✅ **Smart Notifications**
- Order confirmations sent via SMS when email unavailable
- Order status updates sent via SMS
- Email notifications sent when available
- Fallback to SMS ensures users always receive notifications

✅ **Optional Email Registration**
- Email is no longer mandatory during signup
- Users can add email later in their profile
- System works with phone-only accounts

## Environment Variables Required

Add these to your `.env` file:

```bash
# Fast2SMS Configuration
FAST2SMS_API_KEY="your-fast2sms-api-key"
FAST2SMS_SENDER_ID="TAYAIM"
FAST2SMS_MESSAGE_TEMPLATE="111111"
```

## Fast2SMS Setup

1. **Sign up at Fast2SMS**: https://www.fast2sms.com/
2. **Get API Key**: Go to Dashboard > Dev API section
3. **Setup DLT**: Submit your sender ID and message templates
4. **Configure Environment**: Add your API key to `.env`

### DLT Setup Steps

1. **Sender ID**: Submit "TAYAIM" (or your preferred sender ID)
2. **Message Template**: Create a template like "Your OTP is {#var#}. Valid for 10 minutes."
3. **Template ID**: Use the provided template ID in `FAST2SMS_MESSAGE_TEMPLATE`

## Database Migration

Run the migration to add phone authentication support:

```bash
npx prisma migrate deploy
```

This adds:
- `phone` field to User model (optional, unique)
- `phoneVerified` timestamp
- `OtpVerification` model for OTP management

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
{
  "phone": "9876543210"
}
```

### Verify OTP
```
POST /api/auth/verify-otp
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe", // Required for signup
  "isSignup": true
}
```

## Rate Limiting

- **Max Attempts**: 3 OTP requests per 10 minutes
- **Cooldown**: 30 minutes after exceeding limit
- **OTP Expiry**: 10 minutes
- **Attempt Tracking**: Failed verification attempts tracked

## User Flow

### Phone Signup
1. User enters phone number and name
2. System sends OTP via SMS
3. User enters OTP
4. Account created with verified phone
5. User redirected to dashboard

### Phone Login
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP
4. User logged in and redirected to dashboard

### Phone Update
1. User goes to profile > personal details
2. Clicks "Add/Update Phone"
3. Enters new phone number
4. System sends OTP to new number
5. User verifies OTP
6. Phone number updated

## Notification System

### Order Confirmations
- **Email**: Sent if user has email
- **SMS**: Always sent as backup/primary
- **Content**: Order ID, total amount, items list

### Order Updates
- **Email**: Sent if user has email
- **SMS**: Always sent as backup/primary
- **Content**: Order ID, new status

## Security Features

- **Phone Validation**: Indian mobile number format (6-9 starting digits)
- **OTP Security**: 6-digit random OTP, 10-minute expiry
- **Rate Limiting**: Prevents spam and abuse
- **Unique Phone**: One phone number per account
- **Verification Required**: Phone must be verified for updates

## Testing

### Test Phone Numbers
Use Fast2SMS test numbers for development:
- Check Fast2SMS documentation for test numbers
- Test OTP delivery and verification flow

### Production Considerations
- **DLT Compliance**: Ensure all SMS templates are DLT approved
- **Sender ID**: Use approved sender ID
- **Message Content**: Follow TRAI guidelines
- **Delivery Reports**: Monitor SMS delivery rates

## Troubleshooting

### Common Issues

1. **OTP Not Received**
   - Check Fast2SMS API key
   - Verify sender ID and template ID
   - Check phone number format
   - Review rate limiting

2. **Authentication Failed**
   - Verify OTP expiry (10 minutes)
   - Check attempt limits
   - Ensure phone number matches

3. **SMS Not Sent**
   - Check Fast2SMS account balance
   - Verify API key permissions
   - Check DLT template approval

### Debug Mode
Enable debug logging in development:
```bash
NODE_ENV=development
```

## Integration with Existing Features

- **Cart System**: Works with phone-only users
- **Order Management**: SMS notifications for all users
- **Profile Management**: Phone number in personal details
- **Admin Panel**: Phone numbers visible in user management

## Future Enhancements

- **WhatsApp Integration**: Alternative to SMS
- **Voice OTP**: Backup for SMS failures
- **International Numbers**: Support for non-Indian numbers
- **Bulk SMS**: Admin notifications to all users
- **SMS Templates**: Multiple templates for different purposes
