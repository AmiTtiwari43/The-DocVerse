# Payment Approval System Guide

## Overview
The payment approval system allows admins to review and approve/reject patient payments before confirming appointments. This prevents fraud and ensures payment verification.

## System Flow

### 1. Patient Initiates Payment
- Patient books an appointment and selects UPI payment
- System creates a **pending** payment record
- Patient scans QR code and completes payment (or simulates payment)
- `POST /api/payments/upi/confirm` marks payment as **completed** (gateway status)

### 2. Admin Reviews Payments
- Admin goes to Dashboard → Payments tab
- Sees all payments with:
  - **Gateway Status**: pending | completed | failed | refunded
  - **Admin Status**: pending | approved | rejected
- Only shows payments with `adminStatus === 'pending'` for action

### 3. Admin Approves Payment ✓
- **Endpoint**: `PATCH /api/admin/payments/:id/approve`
- **Action**:
  - Sets `adminStatus = 'approved'`
  - If `status === 'completed'`, confirms the appointment
  - Sends confirmation email to patient & doctor
- **Email Content**: Appointment details, transaction ID, reminder to arrive early

### 4. Admin Rejects Payment ✗
- **Endpoint**: `PATCH /api/admin/payments/:id/reject`
- **Action**:
  - Sets `adminStatus = 'rejected'`
  - Sets `status = 'failed'` (gateway)
  - Cancels the appointment
  - Sends rejection email to both parties
- **Email Content**: Payment rejection reason, appointment cancelled, link to rebook

## Database Schema Changes

### Payment Model
```javascript
{
  // ... existing fields ...
  status: ['pending', 'completed', 'failed', 'refunded'],
  adminStatus: ['pending', 'approved', 'rejected'],  // NEW
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Admin Endpoints

#### List All Payments
```
GET /api/admin/payments
Auth: Admin required
Response: Array of payments with populated patient/doctor/appointment
```

#### Approve Payment
```
PATCH /api/admin/payments/:id/approve
Auth: Admin required
Request: { }
Response: { success: true, data: payment, message: "Payment approved by admin" }
Side Effects:
- Sets adminStatus = 'approved'
- Confirms appointment if completed
- Sends emails to patient & doctor
```

#### Reject Payment
```
PATCH /api/admin/payments/:id/reject
Auth: Admin required
Request: { }
Response: { success: true, data: payment, message: "Payment rejected by admin" }
Side Effects:
- Sets adminStatus = 'rejected'
- Sets status = 'failed'
- Cancels appointment
- Sends emails to both parties
```

### Patient Endpoints (Existing)

#### Get Payment Details (UPI)
```
POST /api/payments/upi/get-details
Body: { appointmentId: "..." }
Response: { paymentId, amount, upiId, qrCodeData }
```

#### Confirm Payment (After scanning QR)
```
POST /api/payments/upi/confirm
Body: { paymentId: "...", transactionId: "..." }
Response: { success: true, data: payment }
Side Effects:
- Sets status = 'completed'
- Confirms appointment (temporarily, until admin approves)
```

#### Get Payment History
```
GET /api/payments/history
Response: Array of patient's payments
```

## Frontend UI Changes

### Admin Dashboard - Payments Tab
- **Sorted View**: Payments sorted by booking time (newest first)
- **Status Badges**: Shows both Gateway Status and Admin Status
- **Action Buttons**: Only visible when `adminStatus === 'pending'`
- **Approve Button** (Green): Calls `PATCH /api/admin/payments/:id/approve`
- **Reject Button** (Red): Calls `API/admin/payments/:id/reject`
- **Success Toast**: Displays after action completes
- **Info Banner**: Confirms payment approval system is active

## Email Notifications

### On Approve
**To Patient:**
- Subject: "Payment Receipt - Transaction ID: ..."
- Content:
  - **Payment Receipt** design (Green/Teal)
  - Verified by Admin badge
  - Doctor, Date, Time, Amount
  - Status: Waiting for Doctor Confirmation

**To Doctor:**
- Subject: "Action Required: New Appointment Request (Payment Verified)"
- Content:
  - New appointment request details
  - "Payment Verified" status
  - Call to Action: Approve/Reject in Dashboard

### On Reject
**To Patient:**
- Subject: "Payment Rejected - Appointment Cancelled"
- Content:
  - Payment rejection notice
  - Cancelled appointment details
  - Reason: Payment Verification Failed
  - Instructions to rebook with valid payment

**To Doctor:**
- Subject: "Appointment Cancelled - Payment Rejected"
- Content:
  - Patient name
  - Cancelled appointment details
  - Reason: Payment Verification Failed
  - Notification that slot is now available for others

## Testing the Flow

### Prerequisites
1. Server running: `cd server && npm run dev`
2. Client running: `cd client && npm run dev`
3. Two user accounts: one patient, one doctor
4. Doctor profile with fees set

### Test Scenario

1. **Patient Books Appointment**
   - Login as patient
   - Search for doctor
   - Book appointment for future date
   - Select UPI payment method

2. **Patient Simulates Payment** (Manual Test)
   - Call via Postman or browser console:
   ```bash
   POST http://localhost:5000/api/payments/upi/get-details
   Body: { "appointmentId": "<appointment_id>" }
   ```
   - Copy returned `paymentId`
   - Call `POST /api/payments/upi/confirm`
   ```bash
   Body: { "paymentId": "<id>", "transactionId": "UPI_TEST_123" }
   ```
   - Payment now has `status: 'completed'` but `adminStatus: 'pending'`

3. **Admin Reviews Payments**
   - Login as admin
   - Go to Dashboard → Payments tab
   - Should see the payment with:
     - Status badge: "completed"
     - Admin Status badge: "pending"
     - Approve and Reject buttons

4. **Admin Approves Payment**
   - Click "Approve" button
   - Confirm in dialog
   - Toast shows "Payment Approved"
   - Payment now shows `adminStatus: 'approved'`
   - Emails sent to patient & doctor
   - Appointment confirmed

5. **Verify Email (Optional)**
   - Check `emailService.js` logs
   - Or configure SMTP to send real emails
   - Verify content matches expected format

### Test Scenario - Rejection

1. Repeat steps 1-3 (patient completes payment, admin sees it)
2. Click "Reject" button
3. Confirm in dialog
4. Toast shows "Payment Rejected"
5. Payment now shows `adminStatus: 'rejected'`
6. Appointment status changed to 'cancelled'
7. Emails sent with rejection notice

## Troubleshooting

### Issue: Approve/Reject buttons not showing
- Check: Is `adminStatus === 'pending'`?
- Check: Is payment fetched with populated relations?
- Check: Is user authenticated as admin?

### Issue: Emails not sending
- Check: Is `emailService.js` properly configured?
- Check: Environment variables for email service set?
- Check: Check server logs for error messages

### Issue: Appointment not confirming
- Check: Is payment `status === 'completed'`?
- Check: Is appointment being populated in payment query?
- Check: Check server logs for save errors

### Issue: 404 on approve/reject
- Check: Admin routes registered in `index.js`?
- Check: Is `paymentController` imported in `adminRoutes.js`?
- Check: Routes defined as `router.patch(...)`?

## Code References

### Files Modified
- `server/models/Payment.js` — Added `adminStatus` field
- `server/controllers/paymentController.js` — Added admin handlers + email logic
- `server/routes/adminRoutes.js` — Added payment routes
- `client/src/pages/Dashboard.jsx` — Updated Payments tab UI

### Key Functions
- `adminGetPayments()` — List all payments
- `adminApprovePayment()` — Approve + email notification
- `adminRejectPayment()` — Reject + email notification

## Future Enhancements

1. **Admin Notes**: Add `adminNote` field to store rejection reason
2. **Audit Log**: Track who approved/rejected and when
3. **Refund Integration**: Auto-process refunds on rejection
4. **Payment Gateway Webhook**: Auto-update payment status from gateway
5. **Bulk Actions**: Approve/reject multiple payments at once
6. **Payment Analytics**: Show approval rate, average approval time
7. **Fraud Detection**: Flag suspicious patterns (same card, multiple rejections)

## Support

For issues or questions, check:
- Server logs: `npm run dev` console output
- Client logs: Browser DevTools Console
- Network tab: Check API responses
- Database: Verify payment & appointment records updated correctly

