-- Appointment confirmations, payments, SMS outbox, and atomic slot operations.
-- Apply after 001_initial_schema.sql.

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;

CREATE TABLE IF NOT EXISTS public.appointment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id TEXT NOT NULL REFERENCES public.appointments(id),
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE (appointment_id, notification_type)
);

ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.appointment_notifications FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.appointment_notifications TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_payment_reference
  ON public.appointments ("paymentProvider", "paymentReference")
  WHERE "paymentReference" IS NOT NULL;

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_user_id TEXT,
  p_doc_id TEXT,
  p_slot_date TEXT,
  p_slot_time TEXT,
  p_user_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_doctor public.doctors%ROWTYPE;
  v_appointment public.appointments%ROWTYPE;
  v_slots JSONB;
  v_day_slots JSONB;
BEGIN
  SELECT * INTO v_doctor
  FROM public.doctors
  WHERE id = p_doc_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'doctor_not_found');
  END IF;
  IF NOT v_doctor.available THEN
    RETURN jsonb_build_object('success', false, 'code', 'doctor_unavailable');
  END IF;

  v_slots := COALESCE(v_doctor.slots_booked, '{}'::jsonb);
  v_day_slots := COALESCE(v_slots -> p_slot_date, '[]'::jsonb);
  IF v_day_slots ? p_slot_time THEN
    RETURN jsonb_build_object('success', false, 'code', 'slot_unavailable');
  END IF;

  v_slots := jsonb_set(
    v_slots,
    ARRAY[p_slot_date],
    v_day_slots || to_jsonb(p_slot_time),
    true
  );
  UPDATE public.doctors SET slots_booked = v_slots WHERE id = p_doc_id;

  INSERT INTO public.appointments (
    "userId", "docId", "slotDate", "slotTime", "userData", "docData",
    amount, date, cancelled, payment, "isCompleted", "isConfirmed"
  )
  VALUES (
    p_user_id, p_doc_id, p_slot_date, p_slot_time, p_user_data,
    to_jsonb(v_doctor) - 'password' - 'slots_booked',
    v_doctor.fees, (extract(epoch FROM clock_timestamp()) * 1000)::bigint,
    false, false, false, false
  )
  RETURNING * INTO v_appointment;

  RETURN jsonb_build_object('success', true, 'appointment', to_jsonb(v_appointment));
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_appointment(
  p_appointment_id TEXT,
  p_actor_id TEXT,
  p_actor_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_appointment public.appointments%ROWTYPE;
  v_doctor public.doctors%ROWTYPE;
  v_slots JSONB;
  v_day_slots JSONB;
BEGIN
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_not_found');
  END IF;
  IF (p_actor_role = 'user' AND v_appointment."userId" <> p_actor_id)
    OR (p_actor_role = 'doctor' AND v_appointment."docId" <> p_actor_id)
    OR p_actor_role NOT IN ('user', 'doctor', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_owner');
  END IF;
  IF v_appointment.cancelled THEN
    RETURN jsonb_build_object('success', true, 'already_cancelled', true);
  END IF;
  IF v_appointment.payment THEN
    RETURN jsonb_build_object('success', false, 'code', 'payment_received');
  END IF;
  IF v_appointment."paymentReference" IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'payment_in_progress');
  END IF;
  IF v_appointment."isCompleted" THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_completed');
  END IF;

  UPDATE public.appointments SET cancelled = true WHERE id = p_appointment_id;

  SELECT * INTO v_doctor
  FROM public.doctors
  WHERE id = v_appointment."docId"
  FOR UPDATE;

  IF FOUND THEN
    v_slots := COALESCE(v_doctor.slots_booked, '{}'::jsonb);
    v_day_slots := COALESCE(v_slots -> v_appointment."slotDate", '[]'::jsonb);
    SELECT COALESCE(jsonb_agg(value), '[]'::jsonb) INTO v_day_slots
    FROM jsonb_array_elements(v_day_slots) AS slots(value)
    WHERE value <> to_jsonb(v_appointment."slotTime");

    v_slots := jsonb_set(v_slots, ARRAY[v_appointment."slotDate"], v_day_slots, true);
    UPDATE public.doctors SET slots_booked = v_slots WHERE id = v_doctor.id;
  END IF;

  RETURN jsonb_build_object('success', true, 'already_cancelled', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_appointment(
  p_appointment_id TEXT,
  p_doc_id TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_appointment public.appointments%ROWTYPE;
  v_notification_id UUID;
  v_phone TEXT;
BEGIN
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_not_found');
  END IF;
  IF v_appointment."docId" <> p_doc_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_owner');
  END IF;
  IF v_appointment.cancelled OR v_appointment."isCompleted" THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_not_confirmable');
  END IF;

  UPDATE public.appointments
  SET "isConfirmed" = true, "confirmedAt" = COALESCE("confirmedAt", now())
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  SELECT phone INTO v_phone
  FROM public.users
  WHERE id = v_appointment."userId";
  v_phone := COALESCE(v_phone, v_appointment."userData" ->> 'phone', '');

  INSERT INTO public.appointment_notifications (
    appointment_id, notification_type, recipient, message
  )
  VALUES (p_appointment_id, 'confirmation_sms', v_phone, p_message)
  ON CONFLICT (appointment_id, notification_type) DO UPDATE
    SET recipient = EXCLUDED.recipient,
        message = EXCLUDED.message,
        status = 'pending',
        last_error = NULL,
        updated_at = now()
    WHERE public.appointment_notifications.status IN ('pending', 'failed')
  RETURNING id INTO v_notification_id;

  IF v_notification_id IS NULL THEN
    SELECT id INTO v_notification_id
    FROM public.appointment_notifications
    WHERE appointment_id = p_appointment_id
      AND notification_type = 'confirmation_sms';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'appointment', to_jsonb(v_appointment),
    'notification_id', v_notification_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_appointment(
  p_appointment_id TEXT,
  p_doc_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_appointment public.appointments%ROWTYPE;
BEGIN
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_not_found');
  END IF;
  IF v_appointment."docId" <> p_doc_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_owner');
  END IF;
  IF v_appointment.cancelled THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_cancelled');
  END IF;
  IF v_appointment."paymentReference" IS NOT NULL AND NOT v_appointment.payment THEN
    RETURN jsonb_build_object('success', false, 'code', 'payment_in_progress');
  END IF;
  IF v_appointment."isCompleted" THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true);
  END IF;

  UPDATE public.appointments SET "isCompleted" = true
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  RETURN jsonb_build_object('success', true, 'already_completed', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_appointment_notification(p_notification_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_notification public.appointment_notifications%ROWTYPE;
BEGIN
  UPDATE public.appointment_notifications
  SET status = 'sending', attempts = attempts + 1, updated_at = now(), last_error = NULL
  WHERE id = p_notification_id
    AND (
      status IN ('pending', 'failed')
      OR (status = 'sending' AND updated_at < now() - interval '5 minutes')
    )
  RETURNING * INTO v_notification;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(v_notification);
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_appointment_notification(
  p_notification_id UUID,
  p_sent BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointment_notifications
  SET status = CASE WHEN p_sent THEN 'sent' ELSE 'failed' END,
      last_error = CASE WHEN p_sent THEN NULL ELSE left(COALESCE(p_error, 'SMS delivery failed'), 1000) END,
      sent_at = CASE WHEN p_sent THEN now() ELSE NULL END,
      updated_at = now()
  WHERE id = p_notification_id AND status = 'sending';

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_appointment_payment_reference(
  p_appointment_id TEXT,
  p_user_id TEXT,
  p_provider TEXT,
  p_reference TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET "paymentProvider" = p_provider, "paymentReference" = p_reference
  WHERE id = p_appointment_id
    AND "userId" = p_user_id
    AND "isConfirmed" = true
    AND payment = false
    AND cancelled = false
    AND "isCompleted" = false
    AND (
      "paymentReference" IS NULL
      OR ("paymentProvider" = p_provider AND "paymentReference" = p_reference)
    );

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_appointment_payment_reference(
  p_appointment_id TEXT,
  p_user_id TEXT,
  p_provider TEXT,
  p_reference TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET "paymentProvider" = NULL, "paymentReference" = NULL
  WHERE id = p_appointment_id
    AND "userId" = p_user_id
    AND "paymentProvider" = p_provider
    AND "paymentReference" = p_reference
    AND payment = false;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_appointment_paid(
  p_appointment_id TEXT,
  p_user_id TEXT,
  p_provider TEXT,
  p_reference TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET payment = true
  WHERE id = p_appointment_id
    AND "userId" = p_user_id
    AND "paymentProvider" = p_provider
    AND "paymentReference" = p_reference
    AND "isConfirmed" = true
    AND cancelled = false
    AND "isCompleted" = false;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.book_appointment(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_appointment(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_appointment(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_appointment(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_appointment_notification(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_appointment_notification(UUID, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_appointment_paid(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.book_appointment(TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_appointment(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_appointment(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_appointment(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_appointment_notification(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_appointment_notification(UUID, BOOLEAN, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_appointment_paid(TEXT, TEXT, TEXT, TEXT) TO service_role;
