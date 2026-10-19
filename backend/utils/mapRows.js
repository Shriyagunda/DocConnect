/** Map a Supabase row (id) to the Mongo-style document the frontend expects (_id). */

const PAGE_SIZE = 1000;

function mapNestedDocument(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const nested = { ...value };
  if (nested.id && !nested._id) {
    nested._id = nested.id;
  }
  delete nested.id;
  delete nested.password;
  return nested;
}

export function mapRow(row) {
  if (!row) return null;
  const { id, ...rest } = row;
  const mapped = { _id: id, ...rest };

  if (mapped.fees !== undefined && mapped.fees !== null) {
    mapped.fees = Number(mapped.fees);
  }
  if (mapped.amount !== undefined && mapped.amount !== null) {
    mapped.amount = Number(mapped.amount);
  }
  if (mapped.date !== undefined && mapped.date !== null) {
    mapped.date = Number(mapped.date);
  }
  if (mapped.userData) {
    mapped.userData = mapNestedDocument(mapped.userData);
  }
  if (mapped.docData) {
    mapped.docData = mapNestedDocument(mapped.docData);
  }
  if (mapped.slots_booked && typeof mapped.slots_booked === "string") {
    try {
      mapped.slots_booked = JSON.parse(mapped.slots_booked);
    } catch {
      mapped.slots_booked = {};
    }
  }

  return mapped;
}

export function mapRows(rows) {
  return (rows || []).map(mapRow);
}

export function stripFields(doc, fields = []) {
  if (!doc) return null;
  const copy = { ...doc };
  for (const field of fields) {
    delete copy[field];
  }
  return copy;
}

export function omitUndefined(obj = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && key !== "id" && key !== "_id") {
      clean[key] = value;
    }
  }
  return clean;
}

export function handleSupabaseError(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

/** PostgREST returns at most 1000 rows unless paginated. */
export async function fetchAll(buildQuery) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    handleSupabaseError(error);
    const batch = data || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
