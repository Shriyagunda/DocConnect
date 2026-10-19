import supabase from "../config/supabase.js";
import { fetchAll, handleSupabaseError, mapRow, mapRows, omitUndefined } from "../utils/mapRows.js";

function snapshotWithoutPassword(value) {
  if (!value || typeof value !== "object") return value;
  const { password, ...rest } = value;
  return rest;
}

async function create(appointmentData) {
  const payload = omitUndefined({
    userId: appointmentData.userId,
    docId: appointmentData.docId,
    slotDate: appointmentData.slotDate,
    slotTime: appointmentData.slotTime,
    userData: snapshotWithoutPassword(appointmentData.userData),
    docData: snapshotWithoutPassword(appointmentData.docData),
    amount: appointmentData.amount,
    date: appointmentData.date,
    cancelled: appointmentData.cancelled ?? false,
    payment: appointmentData.payment ?? false,
    isCompleted: appointmentData.isCompleted ?? false,
    isConfirmed: appointmentData.isConfirmed ?? false,
    confirmedAt: appointmentData.confirmedAt,
  });

  const { data, error } = await supabase.from("appointments").insert(payload).select().single();
  handleSupabaseError(error);
  return mapRow(data);
}

async function findById(id) {
  const { data, error } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

async function find(filter = {}) {
  const data = await fetchAll(() => {
    let query = supabase.from("appointments").select("*").order("date", { ascending: true });
    if (filter.userId) query = query.eq("userId", filter.userId);
    if (filter.docId) query = query.eq("docId", filter.docId);
    return query;
  });
  return mapRows(data);
}

async function findByIdAndUpdate(id, updates) {
  const { data, error } = await supabase
    .from("appointments")
    .update(omitUndefined(updates))
    .eq("id", id)
    .select()
    .maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

async function bookAtomically({ userId, docId, slotDate, slotTime, userData }) {
  const { data, error } = await supabase.rpc("book_appointment", {
    p_user_id: userId,
    p_doc_id: docId,
    p_slot_date: slotDate,
    p_slot_time: slotTime,
    p_user_data: snapshotWithoutPassword(userData),
  });
  handleSupabaseError(error);
  return data?.appointment ? { ...data, appointment: mapRow(data.appointment) } : data;
}

async function cancelAtomically(appointmentId, actorId, actorRole) {
  const { data, error } = await supabase.rpc("cancel_appointment", {
    p_appointment_id: appointmentId,
    p_actor_id: actorId,
    p_actor_role: actorRole,
  });
  handleSupabaseError(error);
  return data;
}

async function confirmAtomically(appointmentId, docId, message) {
  const { data, error } = await supabase.rpc("confirm_appointment", {
    p_appointment_id: appointmentId,
    p_doc_id: docId,
    p_message: message,
  });
  handleSupabaseError(error);
  return data?.appointment ? { ...data, appointment: mapRow(data.appointment) } : data;
}

async function completeAtomically(appointmentId, docId) {
  const { data, error } = await supabase.rpc("complete_appointment", {
    p_appointment_id: appointmentId,
    p_doc_id: docId,
  });
  handleSupabaseError(error);
  return data;
}

async function claimNotification(notificationId) {
  const { data, error } = await supabase.rpc("claim_appointment_notification", {
    p_notification_id: notificationId,
  });
  handleSupabaseError(error);
  return data;
}

async function finishNotification(notificationId, sent, errorMessage = null) {
  const { data, error } = await supabase.rpc("finish_appointment_notification", {
    p_notification_id: notificationId,
    p_sent: sent,
    p_error: errorMessage,
  });
  handleSupabaseError(error);
  return data;
}

async function setPaymentReference(appointmentId, userId, provider, reference) {
  const { data, error } = await supabase.rpc("set_appointment_payment_reference", {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_provider: provider,
    p_reference: reference,
  });
  handleSupabaseError(error);
  return data;
}

async function clearPaymentReference(appointmentId, userId, provider, reference) {
  const { data, error } = await supabase.rpc("clear_appointment_payment_reference", {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_provider: provider,
    p_reference: reference,
  });
  handleSupabaseError(error);
  return data;
}

async function markPaid(appointmentId, userId, provider, reference) {
  const { data, error } = await supabase.rpc("mark_appointment_paid", {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_provider: provider,
    p_reference: reference,
  });
  handleSupabaseError(error);
  return data;
}

const appointmentModel = {
  create,
  findById,
  find,
  findByIdAndUpdate,
  bookAtomically,
  cancelAtomically,
  confirmAtomically,
  completeAtomically,
  claimNotification,
  finishNotification,
  setPaymentReference,
  clearPaymentReference,
  markPaid,
};

export default appointmentModel;
