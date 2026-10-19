-- Remove unused payment-gateway state after Stripe and Razorpay integrations
-- have been removed from the application. Keep the legacy payment boolean.

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
  IF v_appointment."isCompleted" THEN
    RETURN jsonb_build_object('success', false, 'code', 'appointment_completed');
  END IF;
  IF v_appointment.payment THEN
    RETURN jsonb_build_object('success', false, 'code', 'payment_received');
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
  IF v_appointment."isCompleted" THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true);
  END IF;

  UPDATE public.appointments SET "isCompleted" = true
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  RETURN jsonb_build_object('success', true, 'already_completed', false);
END;
$$;

DROP FUNCTION IF EXISTS public.set_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.clear_appointment_payment_reference(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.mark_appointment_paid(TEXT, TEXT, TEXT, TEXT);

DROP INDEX IF EXISTS public.idx_appointments_payment_reference;
ALTER TABLE public.appointments
  DROP COLUMN IF EXISTS "paymentProvider",
  DROP COLUMN IF EXISTS "paymentReference";
