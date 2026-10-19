# Backend setup

Apply `supabase/migrations/001_initial_schema.sql`, `002_appointment_workflow.sql`, then `003_remove_payment_provider_fields.sql` in the Supabase SQL editor. These migrations add appointment confirmation, an SMS outbox, and transactional booking/cancellation functions, then remove payment-gateway state. Do not expose the Supabase service-role key to the frontend.

## Seed sample doctors

After applying the migrations and configuring `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`, run `npm run seed:doctors` from this directory. The script inserts sample doctors only when their email addresses are not already present, so it is safe to rerun. Sample doctor accounts use the password `doctor123`; change these credentials before using the accounts outside local development.

## Doctor confirmation and SMS

The authenticated doctor API confirms an appointment at `POST /api/doctor/confirm-appointment` with the doctor token in the `dtoken` header and `{ "appointmentId": "..." }` in the request body. The response contains `smsStatus`.

SMS delivery uses a provider-neutral relay. Configure `SMS_WEBHOOK_URL` to an HTTPS endpoint that accepts:

```json
{
  "to": "+15551234567",
  "message": "Your appointment has been confirmed by Dr. Example. Booking slot: 19/10/2026 at 10:00 AM.",
  "notificationId": "notification-id",
  "type": "appointment_confirmation"
}
```

If set, `SMS_WEBHOOK_TOKEN` is sent as a Bearer token. Patient phone numbers must be in international E.164 format. Until a relay URL is configured, confirmations are saved and the SMS remains pending; confirming again retries pending/failed delivery.

## Images

Image uploads have been disabled. Existing patient/doctor image URLs continue to display. New doctor records use the built-in default profile image, and patient profile edits do not change their image. The doctor admin endpoint now accepts JSON rather than multipart uploads.

## Tests

Run `npm test` in this directory. These unit tests cover slot validation, confirmation message content, and SMS relay payload/validation. Apply the Supabase migrations before exercising database-backed appointment flows.
