export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== "string" || !secret.trim()) {
    const message =
      "Missing required environment variable JWT_SECRET. Configure it in the backend environment.";
    console.error(`[JWT Config Error] ${message}`);
    throw new Error(message);
  }
  return secret;
}
