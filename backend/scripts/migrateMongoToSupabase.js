/**
 * Optional data migration: MongoDB collections -> Supabase tables.
 * Schema must already exist (run 001_initial_schema.sql first).
 *
 * Safe behavior:
 * - Inserts by original Mongo _id (TEXT)
 * - Skips rows whose id already exists in Supabase (no overwrite)
 * - Does not delete anything
 *
 * Usage (from backend/):
 *   npm run migrate:mongo
 *
 * Requires MONGODB_URI in backend .env. If MongoDB is unreachable, this
 * script exits without modifying Supabase.
 */
import mongoose from "mongoose";
import "dotenv/config";
import supabase from "../config/supabase.js";

function toId(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value.toString === "function") return value.toString();
  return String(value);
}

function jsonSafe(value) {
  if (value == null) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "object" && (value._bsontype === "ObjectId" || value._bsontype === "ObjectID")) {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(jsonSafe);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === "__v") continue;
      out[key] = jsonSafe(nested);
    }
    return out;
  }
  return value;
}

async function idExists(table, id) {
  const { data, error } = await supabase.from(table).select("id").eq("id", id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function migrateCollection(name, mongoDocs, table, mapDoc) {
  let inserted = 0;
  let skipped = 0;

  for (const doc of mongoDocs) {
    const id = toId(doc._id);
    if (!id) {
      skipped += 1;
      continue;
    }
    if (await idExists(table, id)) {
      skipped += 1;
      continue;
    }
    const payload = mapDoc(doc, id);
    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      if (error.code === "23505") {
        skipped += 1;
        continue;
      }
      console.error(`Failed inserting ${name} ${id}:`, error.message);
      throw error;
    }
    inserted += 1;
  }

  return { inserted, skipped, total: mongoDocs.length };
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.log("MONGODB_URI is not set. Skipping data migration.");
    console.log("Schema migration is separate: run backend/supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor.");
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const users = await db.collection("users").find({}).toArray();
  const doctors = await db.collection("doctors").find({}).toArray();
  const appointments = await db.collection("appointments").find({}).toArray();

  console.log(`MongoDB source counts: users=${users.length}, doctors=${doctors.length}, appointments=${appointments.length}`);

  const userResult = await migrateCollection("user", users, "users", (doc, id) => ({
    id,
    name: doc.name,
    email: doc.email,
    image: doc.image ?? null,
    phone: doc.phone ?? "000000000",
    address: jsonSafe(doc.address) ?? { line1: "", line2: "" },
    gender: doc.gender ?? "Not Selected",
    dob: doc.dob ?? "Not Selected",
    password: doc.password,
  }));

  const doctorResult = await migrateCollection("doctor", doctors, "doctors", (doc, id) => ({
    id,
    name: doc.name,
    email: doc.email,
    password: doc.password,
    image: doc.image,
    speciality: doc.speciality,
    degree: doc.degree,
    experience: doc.experience,
    about: doc.about,
    available: doc.available !== undefined ? doc.available : true,
    fees: doc.fees,
    slots_booked: jsonSafe(doc.slots_booked) || {},
    address: jsonSafe(doc.address),
    date: typeof doc.date === "number" ? doc.date : Number(doc.date),
  }));

  const appointmentResult = await migrateCollection("appointment", appointments, "appointments", (doc, id) => {
    const userData = jsonSafe(doc.userData) || {};
    const docData = jsonSafe(doc.docData) || {};
    delete userData.password;
    delete docData.password;
    return {
      id,
      userId: toId(doc.userId),
      docId: toId(doc.docId),
      slotDate: doc.slotDate,
      slotTime: doc.slotTime,
      userData,
      docData,
      amount: doc.amount,
      date: typeof doc.date === "number" ? doc.date : Number(doc.date),
      cancelled: Boolean(doc.cancelled),
      payment: Boolean(doc.payment),
      isCompleted: Boolean(doc.isCompleted),
    };
  });

  console.log("Data migration complete (skip-if-exists, no overwrites):");
  console.log("users", userResult);
  console.log("doctors", doctorResult);
  console.log("appointments", appointmentResult);

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Data migration failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });
