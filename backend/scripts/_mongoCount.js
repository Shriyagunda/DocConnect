import mongoose from "mongoose";
import "dotenv/config";

if (!process.env.MONGODB_URI) {
  console.log("MONGODB_URI not set");
  process.exit(0);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = await db.collection("users").countDocuments();
  const doctors = await db.collection("doctors").countDocuments();
  const appointments = await db.collection("appointments").countDocuments();
  console.log(`MongoDB reachable. counts users=${users} doctors=${doctors} appointments=${appointments}`);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("MongoDB not reachable:", error.message);
  process.exit(1);
}
