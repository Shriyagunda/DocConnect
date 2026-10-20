import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.js";

test("getJwtSecret returns secret when JWT_SECRET is configured", (t) => {
  const previousSecret = process.env.JWT_SECRET;
  t.after(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  });

  process.env.JWT_SECRET = "test-secret-key-12345";
  assert.equal(getJwtSecret(), "test-secret-key-12345");

  const token = jwt.sign({ id: "user_test_id" }, getJwtSecret());
  const decoded = jwt.verify(token, getJwtSecret());
  assert.equal(decoded.id, "user_test_id");
});

test("getJwtSecret throws clear configuration error when JWT_SECRET is missing or empty", (t) => {
  const previousSecret = process.env.JWT_SECRET;
  t.after(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  });

  process.env.JWT_SECRET = "";
  assert.throws(
    () => getJwtSecret(),
    /Missing required environment variable JWT_SECRET/
  );

  delete process.env.JWT_SECRET;
  assert.throws(
    () => getJwtSecret(),
    /Missing required environment variable JWT_SECRET/
  );

  process.env.JWT_SECRET = "   ";
  assert.throws(
    () => getJwtSecret(),
    /Missing required environment variable JWT_SECRET/
  );
});
