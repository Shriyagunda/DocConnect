import assert from "node:assert/strict";
import test from "node:test";
import { formatConfirmationMessage, isValidAppointmentSlot } from "../utils/appointmentMessages.js";
import { sendConfirmationSms } from "../services/smsWebhook.js";

test("confirmation text includes the doctor name, booking date, and time", () => {
  assert.equal(
    formatConfirmationMessage({
      doctorName: "Dr. Asha Rao",
      slotDate: "5_11_2026",
      slotTime: "03:30 PM",
    }),
    "Your appointment has been confirmed by Dr. Asha Rao. Booking slot: 05/11/2026 at 03:30 PM."
  );
});

test("appointment slot validation accepts real dates and supported times", () => {
  assert.equal(isValidAppointmentSlot("19_10_2026", "10:00 AM"), true);
  assert.equal(isValidAppointmentSlot("31_02_2026", "10:00 AM"), false);
  assert.equal(isValidAppointmentSlot("19_10_2026", "25:00 PM"), false);
  assert.equal(isValidAppointmentSlot("2026-10-19", "10:00 AM"), false);
});

test("SMS delivery requires a configured relay and international phone number", async (t) => {
  const previousUrl = process.env.SMS_WEBHOOK_URL;
  t.after(() => {
    if (previousUrl === undefined) delete process.env.SMS_WEBHOOK_URL;
    else process.env.SMS_WEBHOOK_URL = previousUrl;
  });

  process.env.SMS_WEBHOOK_URL = "";
  await assert.rejects(
    sendConfirmationSms({ recipient: "+15551234567", message: "Confirmed", id: "notification-1" }),
    /SMS_WEBHOOK_URL is not configured/
  );

  process.env.SMS_WEBHOOK_URL = "https://sms.example.test/send";
  await assert.rejects(
    sendConfirmationSms({ recipient: "5551234567", message: "Confirmed", id: "notification-1" }),
    /E.164 format/
  );

  process.env.SMS_WEBHOOK_URL = "http://sms.example.test/send";
  await assert.rejects(
    sendConfirmationSms({ recipient: "+15551234567", message: "Confirmed", id: "notification-1" }),
    /must use HTTPS/
  );

});

test("SMS relay receives the doctor confirmation message", async (t) => {
  const previousUrl = process.env.SMS_WEBHOOK_URL;
  const previousToken = process.env.SMS_WEBHOOK_TOKEN;
  const previousFetch = globalThis.fetch;
  let request;

  process.env.SMS_WEBHOOK_URL = "https://sms.example.test/send";
  process.env.SMS_WEBHOOK_TOKEN = "test-token";
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 202 };
  };

  t.after(() => {
    if (previousUrl === undefined) delete process.env.SMS_WEBHOOK_URL;
    else process.env.SMS_WEBHOOK_URL = previousUrl;
    if (previousToken === undefined) delete process.env.SMS_WEBHOOK_TOKEN;
    else process.env.SMS_WEBHOOK_TOKEN = previousToken;
    globalThis.fetch = previousFetch;
  });

  await sendConfirmationSms({
    id: "notification-1",
    recipient: "+15551234567",
    message: "Your appointment has been confirmed by Dr. Rao. Booking slot: 19/10/2026 at 10:00 AM.",
  });

  assert.equal(request.url.href, "https://sms.example.test/send");
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(request.options.body), {
    to: "+15551234567",
    message: "Your appointment has been confirmed by Dr. Rao. Booking slot: 19/10/2026 at 10:00 AM.",
    notificationId: "notification-1",
    type: "appointment_confirmation",
  });
});
