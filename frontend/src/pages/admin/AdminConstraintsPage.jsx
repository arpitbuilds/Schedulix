// import React, { useMemo, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
// import Input from "../../shared/ui/Input.jsx";
// import Button from "../../shared/ui/Button.jsx";
// import Select from "../../shared/ui/Select.jsx";
// import Table from "../../shared/ui/Table.jsx";
// import { apiErrorMessage } from "../../shared/api/http.js";
// import { useToast } from "../../shared/ui/toast/ToastContext.jsx";
// import {
//   createConstraint,
//   deleteConstraint,
//   listConstraints,
//   listTeachers,
//   listRooms,
//   listSubjects,
//   updateConstraint
// } from "../../features/admin/adminApi.js";

// const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// function normalizeDept(v) {
//   return (v || "").trim().toUpperCase();
// }

// function parseSlots(raw) {
//   // backend schema: slots are [String]
//   // We'll accept "1,2,3" or "P1,P2"
//   return String(raw || "")
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// export default function AdminConstraintsPage() {
//   const qc = useQueryClient();
//   const { push } = useToast();

//   const [form, setForm] = useState({
//     department: "IT",
//     type: "General",
//     teacherId: "",
//     roomId: "",
//     subjectId: "",
//     rule: "",
//     day: "Monday",
//     slotsRaw: "1,2",
//     priority: "Medium",
//     description: ""
//   });

//   const [editing, setEditing] = useState(null);

//   const q = useQuery({
//     queryKey: ["admin-constraints"],
//     queryFn: () => listConstraints()
//   });

//   const dept = normalizeDept(form.department);

//   const teachersQ = useQuery({
//     queryKey: ["admin-constraints-teachers", dept],
//     queryFn: () => listTeachers({ department: dept }),
//     enabled: !!dept
//   });

//   const roomsQ = useQuery({
//     queryKey: ["admin-constraints-rooms", dept],
//     queryFn: () => listRooms({ department: dept }),
//     enabled: !!dept
//   });

//   const subjectsQ = useQuery({
//     queryKey: ["admin-constraints-subjects", dept],
//     queryFn: () => listSubjects({ department: dept }),
//     enabled: !!dept
//   });

//   const rows = q.data ?? [];
//   const teachers = teachersQ.data ?? [];
//   const rooms = roomsQ.data ?? [];
//   const subjects = subjectsQ.data ?? [];

//   const save = useMutation({
//     mutationFn: async (payload) => {
//       if (editing?._id) return updateConstraint(editing._id, payload);
//       return createConstraint(payload);
//     },
//     onSuccess: async () => {
//       push({ variant: "success", title: "Saved", message: "Constraint saved" });
//       setEditing(null);
//       setForm((f) => ({
//         ...f,
//         rule: "",
//         slotsRaw: "1,2",
//         description: "",
//         teacherId: "",
//         roomId: "",
//         subjectId: ""
//       }));
//       await qc.invalidateQueries({ queryKey: ["admin-constraints"] });
//     },
//     onError: (e) => push({ variant: "error", title: "Save failed", message: apiErrorMessage(e) })
//   });

//   const del = useMutation({
//     mutationFn: (id) => deleteConstraint(id),
//     onSuccess: async () => {
//       push({ variant: "success", title: "Deleted", message: "Constraint deleted" });
//       await qc.invalidateQueries({ queryKey: ["admin-constraints"] });
//     },
//     onError: (e) => push({ variant: "error", title: "Delete failed", message: apiErrorMessage(e) })
//   });

//   function onEdit(c) {
//     setEditing(c);
//     setForm({
//       department: c.department ?? "IT",
//       type: c.type ?? "General",
//       teacherId: c.teacherId?._id ?? c.teacherId ?? "",
//       roomId: c.roomId?._id ?? c.roomId ?? "",
//       subjectId: c.subjectId?._id ?? c.subjectId ?? "",
//       rule: c.rule ?? "",
//       day: c.day ?? "Monday",
//       slotsRaw: Array.isArray(c.slots) ? c.slots.join(",") : "1,2",
//       priority: c.priority ?? "Medium",
//       description: c.description ?? ""
//     });
//   }

//   function onSubmit(e) {
//     e.preventDefault();
//     const payload = {
//       department: dept,
//       type: form.type,
//       rule: form.rule,
//       day: form.day,
//       slots: parseSlots(form.slotsRaw),
//       priority: form.priority,
//       description: form.description
//     };

//     if (form.type === "Teacher") payload.teacherId = form.teacherId;
//     if (form.type === "Room") payload.roomId = form.roomId;
//     if (form.type === "Subject") payload.subjectId = form.subjectId;

//     save.mutate(payload);
//   }

//   const columns = useMemo(
//     () => [
//       { key: "department", header: "Dept" },
//       { key: "type", header: "Type" },
//       {
//         key: "entity",
//         header: "Entity",
//         render: (r) => {
//           if (r.type === "Teacher") return r.teacherId?.name || r.teacherId?._id || "—";
//           if (r.type === "Room") return r.roomId?.name || r.roomId?._id || "—";
//           if (r.type === "Subject") return r.subjectId?.name || r.subjectId?._id || "—";
//           return "—";
//         }
//       },
//       { key: "day", header: "Day" },
//       {
//         key: "slots",
//         header: "Slots",
//         render: (r) => (Array.isArray(r.slots) ? r.slots.join(", ") : "")
//       },
//       { key: "priority", header: "Priority" },
//       { key: "rule", header: "Rule" },
//       {
//         key: "actions",
//         header: "Actions",
//         render: (r) => (
//           <div className="flex flex-wrap gap-2">
//             <Button size="sm" variant="secondary" type="button" onClick={() => onEdit(r)}>
//               Edit
//             </Button>
//             <Button size="sm" variant="danger" type="button" onClick={() => del.mutate(r._id)}>
//               Delete
//             </Button>
//           </div>
//         )
//       }
//     ],
//     [del]
//   );

//   return (
//     <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//       <Card className="lg:col-span-1">
//         <CardHeader>
//           <div className="text-base font-semibold">{editing ? "Edit Constraint" : "Create Constraint"}</div>
//           <div className="text-sm text-slate-600 font-mono">/api/admin/constraints</div>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={onSubmit} className="space-y-3">
//             <div>
//               <label className="text-sm font-medium">Department *</label>
//               <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
//             </div>

//             <div>
//               <label className="text-sm font-medium">Type *</label>
//               <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
//                 <option value="General">General</option>
//                 <option value="Teacher">Teacher</option>
//                 <option value="Room">Room</option>
//                 <option value="Subject">Subject</option>
//               </Select>
//               <div className="text-xs text-zinc-400 mt-1">Backend enum: Teacher/Room/Subject/General</div>
//             </div>

//             {form.type === "Teacher" ? (
//               <div>
//                 <label className="text-sm font-medium">Teacher *</label>
//                 <Select value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
//                   <option value="">Select Teacher</option>
//                   {teachers.map((t) => (
//                     <option key={t._id} value={t._id}>
//                       {t.name} ({t.department})
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             ) : null}

//             {form.type === "Room" ? (
//               <div>
//                 <label className="text-sm font-medium">Room *</label>
//                 <Select value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}>
//                   <option value="">Select Room</option>
//                   {rooms.map((r) => (
//                     <option key={r._id} value={r._id}>
//                       {r.name} ({r.type})
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             ) : null}

//             {form.type === "Subject" ? (
//               <div>
//                 <label className="text-sm font-medium">Subject *</label>
//                 <Select value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
//                   <option value="">Select Subject</option>
//                   {subjects.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {s.code} — {s.name} (Sem {s.semester})
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             ) : null}

//             <div>
//               <label className="text-sm font-medium">Rule *</label>
//               <Input value={form.rule} onChange={(e) => setForm((f) => ({ ...f, rule: e.target.value }))} placeholder="e.g. No classes in last slot" />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-sm font-medium">Day *</label>
//                 <Select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
//                   {DAYS.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </Select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Priority</label>
//                 <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
//                   <option value="High">High</option>
//                   <option value="Medium">Medium</option>
//                   <option value="Low">Low</option>
//                 </Select>
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Slots *</label>
//               <Input value={form.slotsRaw} onChange={(e) => setForm((f) => ({ ...f, slotsRaw: e.target.value }))} placeholder="1,2,3" />
//               <div className="text-xs text-zinc-400 mt-1">Stored as array of strings in backend.</div>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Description</label>
//               <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="optional" />
//             </div>

//             <div className="flex gap-2">
//               <Button disabled={save.isPending} type="submit">
//                 {save.isPending ? "Saving..." : "Save"}
//               </Button>
//               {editing ? (
//                 <Button
//                   variant="secondary"
//                   type="button"
//                   onClick={() => {
//                     setEditing(null);
//                     setForm({
//                       department: "IT",
//                       type: "General",
//                       teacherId: "",
//                       roomId: "",
//                       subjectId: "",
//                       rule: "",
//                       day: "Monday",
//                       slotsRaw: "1,2",
//                       priority: "Medium",
//                       description: ""
//                     });
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               ) : null}
//             </div>

//             {(save.isError || teachersQ.isError || roomsQ.isError || subjectsQ.isError) ? (
//               <div className="text-sm text-red-600">
//                 {apiErrorMessage(save.error || teachersQ.error || roomsQ.error || subjectsQ.error)}
//               </div>
//             ) : null}
//           </form>
//         </CardContent>
//       </Card>

//       <div className="lg:col-span-2 space-y-3">
//         {q.isError ? <Card><CardContent className="text-sm text-red-600">{apiErrorMessage(q.error)}</CardContent></Card> : null}
//         <Table columns={columns} rows={rows} rowKey={(r) => r._id} />
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import Table from "../../shared/ui/Table.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";
import {
  createConstraint,
  deleteConstraint,
  listConstraints,
  listTeachers,
  listRooms,
  listSubjects,
  updateConstraint,
} from "../../features/admin/adminApi.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEPARTMENTS = [
  "CSE",
  "IT",
  "CSAIML",
  "CSAI",
  "CSDS",
  "AIDS",
  "AIML",
  "ECE",
  "EEE",
  "ME",
];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

function parseSlots(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getInitialForm() {
  return {
    department: "IT",
    type: "General",
    teacherId: "",
    roomId: "",
    subjectId: "",
    rule: "",
    day: "Monday",
    slotsRaw: "1,2",
    priority: "Medium",
    description: "",
  };
}

export default function AdminConstraintsPage() {
  const qc = useQueryClient();
  const { push } = useToast();

  const [form, setForm] = useState(getInitialForm());
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: ["admin-constraints"],
    queryFn: () => listConstraints(),
  });

  const dept = normalizeDept(form.department);

  const teachersQ = useQuery({
    queryKey: ["admin-constraints-teachers", dept],
    queryFn: () => listTeachers({ department: dept }),
    enabled: !!dept,
  });

  const roomsQ = useQuery({
    queryKey: ["admin-constraints-rooms", dept],
    queryFn: () => listRooms({ department: dept }),
    enabled: !!dept,
  });

  const subjectsQ = useQuery({
    queryKey: ["admin-constraints-subjects", dept],
    queryFn: () => listSubjects({ department: dept }),
    enabled: !!dept,
  });

  const teachers = teachersQ.data ?? [];
  const rooms = roomsQ.data ?? [];
  const subjects = subjectsQ.data ?? [];
  const allRows = q.data ?? [];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allRows;

    return allRows.filter((r) => {
      const entityName =
        r.type === "Teacher"
          ? r.teacherId?.name || r.teacherId?._id || ""
          : r.type === "Room"
            ? r.roomId?.name || r.roomId?._id || ""
            : r.type === "Subject"
              ? r.subjectId?.name || r.subjectId?._id || ""
              : "";

      const haystack = [
        r.department,
        r.type,
        entityName,
        r.day,
        Array.isArray(r.slots) ? r.slots.join(", ") : "",
        r.priority,
        r.rule,
        r.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [allRows, search]);

  const save = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) return updateConstraint(editing._id, payload);
      return createConstraint(payload);
    },

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Saved",
        message: editing ? "Constraint updated successfully" : "Constraint created successfully",
      });

      setEditing(null);
      setForm(getInitialForm());

      await qc.invalidateQueries({
        queryKey: ["admin-constraints"],
      });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Save failed",
        message: apiErrorMessage(e),
      }),
  });

  const del = useMutation({
    mutationFn: (id) => deleteConstraint(id),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Deleted",
        message: "Constraint deleted successfully",
      });

      await qc.invalidateQueries({
        queryKey: ["admin-constraints"],
      });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Delete failed",
        message: apiErrorMessage(e),
      }),
  });

  function onEdit(c) {
    setEditing(c);

    setForm({
      department: c.department ?? "IT",
      type: c.type ?? "General",
      teacherId: c.teacherId?._id ?? c.teacherId ?? "",
      roomId: c.roomId?._id ?? c.roomId ?? "",
      subjectId: c.subjectId?._id ?? c.subjectId ?? "",
      rule: c.rule ?? "",
      day: c.day ?? "Monday",
      slotsRaw: Array.isArray(c.slots) ? c.slots.join(",") : "1,2",
      priority: c.priority ?? "Medium",
      description: c.description ?? "",
    });


  }

  function resetForm() {
    setEditing(null);
    setForm(getInitialForm());
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      department: dept,
      type: form.type,
      rule: form.rule,
      day: form.day,
      slots: parseSlots(form.slotsRaw),
      priority: form.priority,
      description: form.description,
    };

    if (form.type === "Teacher") payload.teacherId = form.teacherId;
    if (form.type === "Room") payload.roomId = form.roomId;
    if (form.type === "Subject") payload.subjectId = form.subjectId;

    save.mutate(payload);
  }

  function getEntityPreview() {
    if (form.type === "Teacher") {
      const teacher = teachers.find((t) => t._id === form.teacherId);
      return teacher ? teacher.name : "No teacher selected";
    }

    if (form.type === "Room") {
      const room = rooms.find((r) => r._id === form.roomId);
      return room ? `${room.name} (${room.type})` : "No room selected";
    }

    if (form.type === "Subject") {
      const subject = subjects.find((s) => s._id === form.subjectId);
      return subject ? `${subject.code} — ${subject.name}` : "No subject selected";
    }

    return "Applies generally to the timetable";
  }

  const columns = useMemo(
    () => [
      {
        key: "department",
        header: "Department",
        render: (r) => (
          <span className="inline-flex rounded-full bg-zinc-900/50 px-2.5 py-1 text-xs font-semibold text-zinc-300">
            {r.department}
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (r) => {
          const styles =
            r.type === "Teacher"
              ? "bg-blue-100 text-blue-700"
              : r.type === "Room"
                ? "bg-emerald-100 text-emerald-700"
                : r.type === "Subject"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-amber-100 text-amber-700";

          return (
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
              {r.type}
            </span>
          );
        },
      },
      {
        key: "entity",
        header: "Entity",
        render: (r) => {
          if (r.type === "Teacher") return r.teacherId?.name || r.teacherId?._id || "—";
          if (r.type === "Room") return r.roomId?.name || r.roomId?._id || "—";
          if (r.type === "Subject") return r.subjectId?.name || r.subjectId?._id || "—";
          return "General Rule";
        },
      },
      {
        key: "day",
        header: "Day",
        render: (r) => r.day || "—",
      },
      {
        key: "slots",
        header: "Slots",
        render: (r) =>
          Array.isArray(r.slots) && r.slots.length ? (
            <div className="flex flex-wrap gap-1.5">
              {r.slots.map((slot, idx) => (
                <span
                  key={`${slot}-${idx}`}
                  className="inline-flex rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs font-medium text-zinc-300"
                >
                  {slot}
                </span>
              ))}
            </div>
          ) : (
            "—"
          ),
      },
      {
        key: "priority",
        header: "Priority",
        render: (r) => {
          const styles =
            r.priority === "High"
              ? "bg-rose-100 text-rose-700"
              : r.priority === "Medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700";

          return (
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
              {r.priority}
            </span>
          );
        },
      },
      {
        key: "rule",
        header: "Rule",
        render: (r) => (
          <div className="max-w-[240px]">
            <div className="font-medium text-zinc-100">{r.rule || "—"}</div>
            {r.description ? (
              <div className="mt-1 text-xs text-zinc-400">{r.description}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => onEdit(r)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              type="button"
              onClick={() => del.mutate(r._id)}
              disabled={del.isPending}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [del.isPending]
  );

  const selectedSlots = parseSlots(form.slotsRaw);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Constraint Management</h1>
            <p className="mt-1 text-sm text-slate-200">
              Create timetable rules for teachers, rooms, subjects, or general scheduling logic.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Total Constraints:{" "}
              <span className="font-semibold">{filteredRows.length}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Active Department: <span className="font-semibold">{dept || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-white/10 lg:col-span-1">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-zinc-50">
                  {editing ? "Edit Constraint" : "Create Constraint"}
                </div>
              </div>

              {editing ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing Mode
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  New Rule
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Department *
                </label>
                <Select
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  {DEPARTMENTS.map((deptOption) => (
                    <option key={deptOption} value={deptOption}>
                      {deptOption}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Constraint Type *
                </label>
                <Select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value,
                      teacherId: "",
                      roomId: "",
                      subjectId: "",
                    }))
                  }
                >
                  <option value="General">General</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Room">Room</option>
                  <option value="Subject">Subject</option>
                </Select>
                <div className="mt-1 text-xs text-zinc-400">
                  Backend enum: Teacher / Room / Subject / General
                </div>
              </div>

              {form.type === "Teacher" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Teacher *
                  </label>
                  <Select
                    value={form.teacherId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, teacherId: e.target.value }))
                    }
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              {form.type === "Room" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Room *
                  </label>
                  <Select
                    value={form.roomId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, roomId: e.target.value }))
                    }
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              {form.type === "Subject" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Subject *
                  </label>
                  <Select
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subjectId: e.target.value }))
                    }
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} — {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Selected Target
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-100">
                  {getEntityPreview()}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Rule *
                </label>
                <Input
                  value={form.rule}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rule: e.target.value }))
                  }
                  placeholder="e.g. No classes in last slot"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Day *
                  </label>
                  <Select
                    value={form.day}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, day: e.target.value }))
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Priority
                  </label>
                  <Select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value }))
                    }
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Slots *
                </label>
                <Input
                  value={form.slotsRaw}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slotsRaw: e.target.value }))
                  }
                  placeholder="1,2,3"
                />
                <div className="mt-1 text-xs text-zinc-400">
                  Stored as array of strings in backend.
                </div>

                {selectedSlots.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedSlots.map((slot, idx) => (
                      <span
                        key={`${slot}-${idx}`}
                        className="inline-flex rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs font-medium text-zinc-300"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional note for this constraint"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button disabled={save.isPending} type="submit">
                  {save.isPending ? "Saving..." : editing ? "Update Constraint" : "Save Constraint"}
                </Button>

                {editing ? (
                  <Button variant="secondary" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>

              {(save.isError || teachersQ.isError || roomsQ.isError || subjectsQ.isError) ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {apiErrorMessage(
                    save.error || teachersQ.error || roomsQ.error || subjectsQ.error
                  )}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Card className="border-white/10">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between">
              <div className="w-full md:max-w-sm">
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Search Constraints
                </label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by type, day, rule, entity..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    qc.invalidateQueries({
                      queryKey: ["admin-constraints"],
                    })
                  }
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {q.isError ? (
            <Card>
              <CardContent className="text-sm text-red-600">
                {apiErrorMessage(q.error)}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-zinc-50">
                  Constraints List
                </div>
                <div className="text-sm text-zinc-400">
                  Showing {filteredRows.length} item{filteredRows.length === 1 ? "" : "s"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table columns={columns} rows={filteredRows} rowKey={(r) => r._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}