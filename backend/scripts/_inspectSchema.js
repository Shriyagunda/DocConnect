import "dotenv/config";
import supabase from "../config/supabase.js";

async function check(table, columns) {
  const { error } = await supabase.from(table).select(columns).limit(1);
  if (error) {
    console.log(table, "MISSING/MISMATCH:", error.message);
  } else {
    console.log(table, "OK columns", columns);
  }
}

await check("users", "id,name,email,image,phone,address,gender,dob,password");
await check("doctors", "id,name,email,password,image,speciality,degree,experience,about,available,fees,slots_booked,address,date");
await check("appointments", "id,userId,docId,slotDate,slotTime,userData,docData,amount,date,cancelled,payment,isCompleted");
