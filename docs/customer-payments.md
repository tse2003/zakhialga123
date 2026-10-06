# Customer accounts and QPay payments

Customers register with a name, eight-digit Mongolian phone number and a password of 8–128 characters at `/account`. Login uses phone/password. This does not verify ownership of the phone number. Passwords use salted scrypt; sessions use random tokens stored as hashes in MongoDB, with HttpOnly cookies and seven-day expiry. Logout revokes the current session. Login/register attempts are limited using MongoDB counters (20 per phone/IP per 15-minute window). Configure trusted proxy IP headers in production. Password recovery and SMS verification are not included.

Customers must log in before submitting an order. Product prices and quantities are validated server-side. Existing anonymous orders are not automatically assigned by phone number. The customer order list shows the newest 100 orders. Duplicate submissions with the same idempotency key return the existing order.

## Configure

1. Obtain QPay Merchant V2 sandbox credentials and invoice code from QPay.
2. Set `APP_URL` to the publicly reachable HTTPS origin. Set `QPAY_CLIENT_ID`, `QPAY_CLIENT_SECRET`, `QPAY_INVOICE_CODE`, and a strong random `QPAY_CALLBACK_SECRET` (at least 32 random bytes). Keep them in server environment settings, never in git or NEXT_PUBLIC variables.
3. Start with `QPAY_BASE_URL=https://merchant-sandbox.qpay.mn`.
4. Confirm MongoDB unique indexes are created for accounts, sessions, auth attempts and order request keys. Existing orders need no migration; new payment fields are optional.
5. Deploy the branch, register a test account, submit product and filter orders, open a QR, pay in sandbox, and verify the callback updates both customer and admin order views. Test duplicate callbacks, unpaid/partial/wrong-currency responses, cancelled orders, another customer's access, logout, invalid credentials, and parallel QR requests.
6. Only after successful sandbox validation switch to the production merchant credentials and `https://merchant.qpay.mn`.

QR creation is locked atomically. If a provider request times out or fails, the order is marked `needs_review`: an admin must reconcile the sender_invoice_no (Mongo order ID) with QPay before attaching an existing invoice or clearing invoiceState. Do not blindly create a second invoice. A callback that arrives before invoice persistence receives 503 and needs provider retry; confirm retry behavior with QPay and reconcile missed callbacks before launch.

Payment callbacks have a per-deployment secret and always verify the stored invoice through QPay's payment/check endpoint; incoming callback values never mark an order paid. Only unique PAID MNT payment rows totaling at least the stored amount count. Repeated callbacks are idempotent. All orders keep their fulfilment state even if payment arrives. Payments and fulfilment are separate fields. The customer refresh button reads local status only and does not poll QPay, following the provider's callback guidance.

No live payment or production database was exercised during development. Account/order/payment integration tests require a dedicated MongoDB and QPay sandbox. Add password recovery and phone verification before relying on phone identity for sensitive workflows.
