// export function displayRef(ref) {
//   if (!ref) return "";
//   if (typeof ref === "string") return ref.slice(-6);
//   // mongoose populated object can be {_id, name}
//   if (typeof ref === "object") return ref.name || ref._id?.slice?.(-6) || "";
//   return String(ref);
// }

// export function groupEntries(entries = []) {
//   const map = new Map(); // key: day|slot
//   for (const e of entries) {
//     const key = `${e.day}|${e.slot}`;
//     map.set(key, e);
//   }
//   return map;
// }

export function displayRef(ref) {
  if (!ref) return "";

  if (typeof ref === "string") {
    return ref;
  }

  if (typeof ref === "object") {
    if (ref.code && ref.name) return `${ref.code} — ${ref.name}`;
    if (ref.name) return ref.name;
    if (ref.code) return ref.code;
    if (ref._id) return String(ref._id).slice(-6);
  }

  return String(ref);
}

export function groupEntries(entries = []) {
  const map = new Map();

  for (const e of entries) {
    if (!e?.day || e?.slot == null) continue;
    const key = `${e.day}|${e.slot}`;
    map.set(key, e);
  }

  return map;
}