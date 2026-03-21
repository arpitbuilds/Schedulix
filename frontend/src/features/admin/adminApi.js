import { http } from "../../shared/api/http.js";

/* ========= Teachers ========= */
export async function listTeachers(params) {
  const resp = await http.get("/api/admin/teachers", { params });
  return resp.data?.data ?? [];
}
export async function createTeacher(body) {
  const resp = await http.post("/api/admin/teachers", body);
  return resp.data?.data;
}
export async function updateTeacher(id, body) {
  const resp = await http.put(`/api/admin/teachers/${id}`, body);
  return resp.data?.data;
}
export async function deleteTeacher(id) {
  const resp = await http.delete(`/api/admin/teachers/${id}`);
  return resp.data;
}

/* ========= Subjects ========= */
export async function listSubjects(params) {
  const resp = await http.get("/api/admin/subjects", { params });
  return resp.data?.data ?? [];
}
export async function createSubject(body) {
  const resp = await http.post("/api/admin/subjects", body);
  return resp.data?.data;
}
export async function updateSubject(id, body) {
  const resp = await http.put(`/api/admin/subjects/${id}`, body);
  return resp.data?.data;
}
export async function deleteSubject(id) {
  const resp = await http.delete(`/api/admin/subjects/${id}`);
  return resp.data;
}

/* ========= Rooms ========= */
export async function listRooms(params) {
  const resp = await http.get("/api/admin/rooms", { params });
  return resp.data?.data ?? [];
}
export async function createRoom(body) {
  const resp = await http.post("/api/admin/rooms", body);
  return resp.data?.data;
}
export async function updateRoom(id, body) {
  const resp = await http.put(`/api/admin/rooms/${id}`, body);
  return resp.data?.data;
}
export async function deleteRoom(id) {
  const resp = await http.delete(`/api/admin/rooms/${id}`);
  return resp.data;
}

/* ========= Constraints ========= */
export async function listConstraints() {
  const resp = await http.get("/api/admin/constraints");
  return resp.data?.data ?? [];
}
export async function createConstraint(body) {
  const resp = await http.post("/api/admin/constraints", body);
  return resp.data?.data;
}
export async function updateConstraint(id, body) {
  const resp = await http.put(`/api/admin/constraints/${id}`, body);
  return resp.data?.data;
}
export async function deleteConstraint(id) {
  const resp = await http.delete(`/api/admin/constraints/${id}`);
  return resp.data;
}

/* ========= Timetable ========= */
export async function generateTimetable(body) {
  const resp = await http.post("/api/timetable/generate", body);
  return resp.data?.data;
}

export async function getTimetable(params) {
  const resp = await http.get("/api/timetable", { params });
  return resp.data?.data;
}

export async function updateTimetableEntry(entryId, body) {
  const resp = await http.put(`/api/timetable/entry/${entryId}`, body);
  return resp.data?.data;
}

export async function deleteTimetable(body) {
  const resp = await http.delete("/api/timetable", { data: body });
  return resp.data;
}