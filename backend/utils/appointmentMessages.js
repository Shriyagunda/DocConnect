export function formatConfirmationMessage({ doctorName, slotDate, slotTime }) {
  const name = (doctorName || "your doctor").trim();
  const displayName = /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
  const dateParts = String(slotDate).split("_");
  const displayDate =
    dateParts.length === 3
      ? `${dateParts[0].padStart(2, "0")}/${dateParts[1].padStart(2, "0")}/${dateParts[2]}`
      : slotDate;

  return `Your appointment has been confirmed by ${displayName}. Booking slot: ${displayDate} at ${slotTime}.`;
}

export function isValidAppointmentSlot(slotDate, slotTime) {
  if (typeof slotDate !== "string" || typeof slotTime !== "string") {
    return false;
  }

  const dateMatch = /^(\d{1,2})_(\d{1,2})_(\d{4})$/.exec(slotDate);
  const timeMatch = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i.test(slotTime);
  if (!dateMatch || !timeMatch) {
    return false;
  }

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
