import "dotenv/config";
import supabase from "../config/supabase.js";

async function check(table, columns) {
  const { error } = await supabase.from(table).select(columns).limit(1);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  console.log(`${table} table is accessible`);
}

try {
  await check("users", "id,name,email,image,phone,address,gender,dob");
  await check("doctors", "id,name,email,image,speciality,degree,experience,about,available,fees,slots_booked,address,date");
  await check("appointments", "id,userId,docId,slotDate,slotTime,userData,docData,amount,date,cancelled,payment,isCompleted");
  console.log("Supabase schema check passed");
  process.exit(0);
} catch (error) {
  console.error("Supabase check failed:", error.message);
  console.error("Run backend/supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor, then retry.");
  process.exit(1);
}
