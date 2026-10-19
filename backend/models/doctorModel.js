import supabase from "../config/supabase.js";
import { fetchAll, handleSupabaseError, mapRow, mapRows, omitUndefined, stripFields } from "../utils/mapRows.js";

async function create(doctorData) {
  const payload = omitUndefined({
    name: doctorData.name,
    email: doctorData.email,
    password: doctorData.password,
    image: doctorData.image,
    speciality: doctorData.speciality,
    degree: doctorData.degree,
    experience: doctorData.experience,
    about: doctorData.about,
    available: doctorData.available !== undefined ? doctorData.available : true,
    fees: doctorData.fees,
    slots_booked: doctorData.slots_booked || {},
    address: doctorData.address,
    date: doctorData.date,
  });

  const { data, error } = await supabase.from("doctors").insert(payload).select().single();
  handleSupabaseError(error);
  return mapRow(data);
}

async function findOne(filter = {}) {
  let query = supabase.from("doctors").select("*");
  if (filter.email) query = query.eq("email", filter.email);
  if (filter._id || filter.id) query = query.eq("id", filter._id || filter.id);

  const { data, error } = await query.maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

async function findById(id, options = {}) {
  const { data, error } = await supabase.from("doctors").select("*").eq("id", id).maybeSingle();
  handleSupabaseError(error);
  return stripFields(mapRow(data), options.exclude || []);
}

async function find(filter = {}, options = {}) {
  const data = await fetchAll(() => {
    let query = supabase.from("doctors").select("*");
    if (filter.email) query = query.eq("email", filter.email);
    if (filter.available !== undefined) query = query.eq("available", filter.available);
    return query;
  });
  return mapRows(data).map((row) => stripFields(row, options.exclude || []));
}

async function findByIdAndUpdate(id, updates) {
  const { data, error } = await supabase
    .from("doctors")
    .update(omitUndefined(updates))
    .eq("id", id)
    .select()
    .maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

const doctorModel = {
  create,
  findOne,
  findById,
  find,
  findByIdAndUpdate,
};

export default doctorModel;
