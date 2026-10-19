const E164_PHONE = /^\+[1-9]\d{7,14}$/;

export async function sendConfirmationSms(notification) {
  const webhookUrl = process.env.SMS_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("SMS_WEBHOOK_URL is not configured");
  }

  let endpoint;
  try {
    endpoint = new URL(webhookUrl);
  } catch {
    throw new Error("SMS_WEBHOOK_URL must be a valid HTTP or HTTPS URL");
  }
  if (endpoint.protocol !== "https:") {
    throw new Error("SMS_WEBHOOK_URL must use HTTPS");
  }
  if (!E164_PHONE.test(notification.recipient || "")) {
    throw new Error("The patient's phone number must use international E.164 format");
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.SMS_WEBHOOK_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SMS_WEBHOOK_TOKEN}`;
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        to: notification.recipient,
        message: notification.message,
        notificationId: notification.id,
        type: "appointment_confirmation",
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    throw new Error(`SMS webhook request failed: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`SMS webhook returned HTTP ${response.status}`);
  }
}
