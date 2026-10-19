import supabase from "../config/supabase.js";
import { fetchAll, handleSupabaseError, mapRow, mapRows, omitUndefined, stripFields } from "../utils/mapRows.js";
import { DEFAULT_USER_IMAGE } from "./defaultUserImage.js";

const USER_DEFAULTS = {
  image: DEFAULT_USER_IMAGE,
  phone: "000000000",
  address: { line1: "", line2: "" },
  gender: "Not Selected",
  dob: "Not Selected",
};

async function create(userData) {
  const payload = omitUndefined({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    image: userData.image || USER_DEFAULTS.image,
    phone: userData.phone || USER_DEFAULTS.phone,
    address: userData.address || USER_DEFAULTS.address,
    gender: userData.gender || USER_DEFAULTS.gender,
    dob: userData.dob || USER_DEFAULTS.dob,
  });

  const { data, error } = await supabase.from("users").insert(payload).select().single();
  handleSupabaseError(error);
  return mapRow(data);
}

async function findOne(filter = {}) {
  let query = supabase.from("users").select("*");
  if (filter.email) query = query.eq("email", filter.email);
  if (filter._id || filter.id) query = query.eq("id", filter._id || filter.id);

  const { data, error } = await query.maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

async function findById(id, options = {}) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  handleSupabaseError(error);
  return stripFields(mapRow(data), options.exclude || []);
}

async function find(filter = {}, options = {}) {
  const data = await fetchAll(() => {
    let query = supabase.from("users").select("*");
    if (filter.email) query = query.eq("email", filter.email);
    return query;
  });
  return mapRows(data).map((row) => stripFields(row, options.exclude || []));
}

async function findByIdAndUpdate(id, updates) {
  const { data, error } = await supabase
    .from("users")
    .update(omitUndefined(updates))
    .eq("id", id)
    .select()
    .maybeSingle();
  handleSupabaseError(error);
  return mapRow(data);
}

const userModel = {
  create,
  findOne,
  findById,
  find,
  findByIdAndUpdate,
};

export default userModel;
