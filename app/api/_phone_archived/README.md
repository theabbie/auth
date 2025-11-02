# Phone OTP Verification (Archived)

This feature has been temporarily disabled as Firebase Phone Authentication is now a paid service.

## Archived Files
- `/app/api/_phone_archived/send-otp/route.ts` - Send OTP endpoint
- `/app/api/_phone_archived/verify-otp/route.ts` - Verify OTP endpoint
- `/components/profile/_phone-verification.archived.tsx` - Phone verification UI component

## Current Implementation
Phone numbers are now stored as regular text fields with format validation only.

## To Re-enable
1. Rename `_phone_archived` back to `phone`
2. Rename `_phone-verification.archived.tsx` back to `phone-verification.tsx`
3. Update profile form to use PhoneVerification component
4. Add `phoneVerified` field back to User type and validation schema
5. Enable Firebase Phone Authentication in Firebase Console
