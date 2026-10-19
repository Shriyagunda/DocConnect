import "dotenv/config";

const keys = [
  "PORT",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MONGODB_URI",
];
for (const key of keys) {
  const value = process.env[key];
  const present = Boolean(value && String(value).trim());
  console.log(`${key}=${present ? "set" : "missing"}`);
}
