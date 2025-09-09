# Account Recovery System - Database Implementation

## Overview

This document describes the database implementation for the enhanced account recovery system, including new entities, services, and API endpoints.

## Database Entities

### 1. VerificationToken Entity

**Purpose**: Stores verification codes for multi-step account recovery processes.

**Fields**:
- `id`: Primary key
- `token`: Unique verification token
- `email`: User's email address
- `type`: Type of verification ('find_id' or 'reset_password')
- `phone`: User's phone number (optional)
- `name`: User's name (optional)
- `code`: 6-digit verification code
- `isUsed`: Whether the token has been used
- `expiresAt`: Token expiration timestamp
- `ipAddress`: IP address of the request
- `userAgent`: User agent string
- `createdAt`: Creation timestamp
- `usedAt`: Usage timestamp (when token was used)

### 2. PasswordResetToken Entity

**Purpose**: Stores password reset tokens for secure password changes.

**Fields**:
- `id`: Primary key
- `token`: Unique reset token
- `email`: User's email address
- `isUsed`: Whether the token has been used
- `expiresAt`: Token expiration timestamp
- `ipAddress`: IP address of the request
- `userAgent`: User agent string
- `createdAt`: Creation timestamp
- `usedAt`: Usage timestamp (when token was used)

## Services

### 1. EmailService

**Purpose**: Handles email sending for verification codes and password reset links.

**Features**:
- Configurable SMTP settings
- HTML and text email templates
- Mock mode for development
- Error handling and logging

**Methods**:
- `sendVerificationCode()`: Sends 6-digit verification codes
- `sendPasswordResetLink()`: Sends password reset links
- `sendIdFoundEmail()`: Sends ID found confirmation emails

### 2. AccountRecoveryService

**Purpose**: Core business logic for account recovery processes.

**Features**:
- Rate limiting per IP address
- Input validation
- Security logging
- Token generation and management
- User verification

**Methods**:
- `findIdStep1()`: Verify user by name and phone
- `findIdStep2()`: Verify code and return user info
- `resetPasswordStep1()`: Verify user by name and phone
- `resetPasswordStep2()`: Verify code and generate reset token
- `resetPasswordStep3()`: Complete password reset
- `findIdByEmail()`: Legacy email-based find ID
- `findPasswordByEmail()`: Legacy email-based find password
- `cleanupExpiredTokens()`: Clean up expired tokens

## API Endpoints

### Legacy Endpoints (Backward Compatibility)

```
POST /api/auth/find-id
POST /api/auth/find-password
```

### Enhanced Endpoints (New Multi-step Process)

```
POST /api/auth/find-id/verify-user      # Step 1: Verify user by name/phone
POST /api/auth/find-id/verify-code      # Step 2: Verify code and return ID
POST /api/auth/reset-password/verify-user    # Step 1: Verify user by name/phone
POST /api/auth/reset-password/verify-code    # Step 2: Verify code and get reset token
POST /api/auth/reset-password/complete       # Step 3: Complete password reset
```

## Security Features

### 1. Rate Limiting

- **Find ID Step 1**: 5 attempts per hour
- **Find ID Step 2**: 10 attempts per hour
- **Reset Password Step 1**: 5 attempts per hour
- **Reset Password Step 2**: 10 attempts per hour
- **Reset Password Step 3**: 5 attempts per hour
- **Email Verification**: 3 emails per hour

### 2. Token Security

- **Verification Codes**: 6-digit codes, 10-minute expiration
- **Password Reset Tokens**: 64-character hex strings, 1-hour expiration
- **Secure Generation**: Uses crypto.randomBytes() for tokens
- **One-time Use**: Tokens are marked as used after consumption

### 3. Data Protection

- **Input Validation**: Comprehensive validation for all inputs
- **Data Masking**: Email and phone numbers are masked in responses
- **IP Tracking**: All requests are logged with IP addresses
- **User Agent Logging**: Browser/device information is recorded

## Environment Configuration

Add the following to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@gymapp.com
EMAIL_SECURE=false

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd deukgeun/src/backend
npm install nodemailer @types/nodemailer
```

### 2. Create Database Tables

```bash
# Run the database setup script
npx ts-node scripts/createAccountRecoveryTables.ts
```

### 3. Configure Email Settings

1. Copy `env.example` to `.env`
2. Update email configuration with your SMTP settings
3. For Gmail, use App Passwords instead of regular passwords

### 4. Update Database Configuration

The new entities are automatically included in the database configuration:

```typescript
// config/database.ts
entities: [
  // ... existing entities
  VerificationToken,
  PasswordResetToken,
]
```

## Usage Examples

### Frontend Integration

```typescript
import { authApi } from '../api/authApi'

// Enhanced Find ID
const step1Result = await authApi.findIdStep1({
  name: "홍길동",
  phone: "010-1234-5678",
  recaptchaToken: "token"
})

const step2Result = await authApi.findIdStep2({
  email: "user@example.com",
  code: "123456",
  recaptchaToken: "token"
})

// Enhanced Password Reset
const resetStep1Result = await authApi.resetPasswordStep1({
  name: "홍길동",
  phone: "010-1234-5678",
  recaptchaToken: "token"
})

const resetStep2Result = await authApi.resetPasswordStep2({
  email: "user@example.com",
  code: "123456",
  recaptchaToken: "token"
})

const resetStep3Result = await authApi.resetPasswordStep3({
  resetToken: "token",
  newPassword: "newPassword123",
  confirmPassword: "newPassword123",
  recaptchaToken: "token"
})
```

### Backend Service Usage

```typescript
import { accountRecoveryService } from '../services/accountRecoveryService'

// Find ID Step 1
const result = await accountRecoveryService.findIdStep1(
  "홍길동",
  "010-1234-5678",
  {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date()
  }
)
```

## Monitoring and Maintenance

### 1. Token Cleanup

Run token cleanup periodically to remove expired tokens:

```typescript
// Can be scheduled as a cron job
await accountRecoveryService.cleanupExpiredTokens()
```

### 2. Logging

All account recovery actions are logged with:
- Action type
- User email
- IP address
- User agent
- Timestamp
- Success/failure status

### 3. Rate Limit Monitoring

Monitor rate limit violations to detect potential abuse:
- Check logs for "rate_limited" actions
- Monitor IP addresses with frequent failures
- Set up alerts for unusual patterns

## Error Handling

### Common Error Scenarios

1. **Invalid Input**: Returns 400 with validation error message
2. **User Not Found**: Returns 404 with appropriate message
3. **Rate Limit Exceeded**: Returns 429 with retry information
4. **Invalid/Expired Token**: Returns 400 with clear error message
5. **Email Send Failure**: Returns 500 with retry suggestion

### Error Response Format

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error code"
}
```

## Testing

### Unit Tests

```bash
# Test account recovery service
npm test -- --grep "AccountRecoveryService"

# Test email service
npm test -- --grep "EmailService"
```

### Integration Tests

```bash
# Test API endpoints
npm test -- --grep "Account Recovery API"
```

## Migration from Legacy System

The new system maintains backward compatibility with existing email-based endpoints:

- Existing `/api/auth/find-id` and `/api/auth/find-password` continue to work
- New enhanced endpoints are available alongside legacy ones
- Gradual migration to enhanced system is possible
- Frontend can choose which flow to use

## Performance Considerations

1. **Database Indexes**: Proper indexes on token, email, and createdAt fields
2. **Rate Limiting**: In-memory storage (consider Redis for production)
3. **Email Queuing**: Consider message queue for high-volume email sending
4. **Token Cleanup**: Scheduled cleanup to prevent database bloat

## Security Best Practices

1. **HTTPS Only**: All endpoints should be served over HTTPS
2. **Input Sanitization**: All inputs are validated and sanitized
3. **Token Rotation**: Tokens are single-use and time-limited
4. **Rate Limiting**: Prevents brute force attacks
5. **Logging**: Comprehensive audit trail for security monitoring
6. **Data Masking**: Sensitive data is masked in responses

## Troubleshooting

### Common Issues

1. **Email Not Sending**: Check SMTP configuration and credentials
2. **Database Connection**: Verify database connection and table creation
3. **Rate Limiting**: Check if IP is being rate limited
4. **Token Expiration**: Ensure tokens are used within time limits

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## Future Enhancements

1. **SMS Integration**: Add SMS verification as an alternative to email
2. **Multi-factor Authentication**: Integrate with MFA systems
3. **Admin Dashboard**: Web interface for monitoring recovery attempts
4. **Analytics**: Detailed analytics on recovery success rates
5. **Internationalization**: Support for multiple languages
