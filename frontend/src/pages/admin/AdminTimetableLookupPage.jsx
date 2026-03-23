// import React, { useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
// import Input from "../../shared/ui/Input.jsx";
// import Button from "../../shared/ui/Button.jsx";
// import Select from "../../shared/ui/Select.jsx";
// import { apiErrorMessage } from "../../shared/api/http.js";
// import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
// import {
//   getTimetable,
//   deleteTimetable,
//   listTeachers,
//   listSubjects,
//   listRooms,
// } from "../../features/admin/adminApi.js";
// import { useToast } from "../../shared/ui/toast/ToastContext.jsx";

// const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// const DEPARTMENTS = [
//   "CSE",
//   "IT",
//   "CSAIML",
//   "CSDS",
//   "CSAI",
//   "AIML",
//   "AIDS",
//   "ECE",
//   "EEE",
//   "ME",
// ];

// const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// function normalizeDept(v) {
//   return (v || "").trim().toUpperCase();
// }

// function getId(value) {
//   if (!value) return "";
//   if (typeof value === "string") return value;
//   if (typeof value === "object") return value._id || value.id || "";
//   return String(value);
// }

// export default function AdminTimetableLookupPage() {
//   const { push } = useToast();

//   const [department, setDepartment] = useState("IT");
//   const [semester, setSemester] = useState("3");
//   const [section, setSection] = useState("A");
//   const [academicYear, setAcademicYear] = useState("2025-26");

//   const params = useMemo(
//     () => ({
//       department: normalizeDept(department),
//       semester: String(semester).trim(),
//       section: String(section).trim().toUpperCase(),
//       academicYear: String(academicYear).trim(),
//     }),
//     [department, semester, section, academicYear]
//   );

//   const q = useQuery({
//     queryKey: ["admin-timetable", params],
//     enabled: false,
//     queryFn: () => getTimetable(params),
//   });

//   const del = useMutation({
//     mutationFn: () => deleteTimetable(params),

//     onSuccess: async () => {
//       push({
//         variant: "success",
//         title: "Deleted",
//         message: "Timetable soft-deleted successfully",
//       });
//       await q.refetch();
//     },

//     onError: (e) =>
//       push({
//         variant: "error",
//         title: "Delete failed",
//         message: apiErrorMessage(e),
//       }),
//   });

//   async function onSearch(e) {
//     e.preventDefault();
//     await q.refetch();
//   }

//   const tt = q.data || null;

//   const teachersQ = useQuery({
//     queryKey: ["admin-lookup-teachers", tt?.department],
//     enabled: !!tt?.department,
//     queryFn: () => listTeachers({ department: tt.department }),
//   });

//   const subjectsQ = useQuery({
//     queryKey: ["admin-lookup-subjects", tt?.department, tt?.semester],
//     enabled: !!tt?.department && !!tt?.semester,
//     queryFn: () =>
//       listSubjects({
//         department: tt.department,
//         semester: Number(tt.semester),
//       }),
//   });

//   const roomsQ = useQuery({
//     queryKey: ["admin-lookup-rooms", tt?.department],
//     enabled: !!tt?.department,
//     queryFn: () => listRooms({ department: tt.department }),
//   });

//   const teacherMap = useMemo(() => {
//     const map = new Map();
//     (teachersQ.data || []).forEach((t) => {
//       map.set(String(t._id), t);
//     });
//     return map;
//   }, [teachersQ.data]);

//   const subjectMap = useMemo(() => {
//     const map = new Map();
//     (subjectsQ.data || []).forEach((s) => {
//       map.set(String(s._id), s);
//     });
//     return map;
//   }, [subjectsQ.data]);

//   const roomMap = useMemo(() => {
//     const map = new Map();
//     (roomsQ.data || []).forEach((r) => {
//       map.set(String(r._id), r);
//     });
//     return map;
//   }, [roomsQ.data]);

//   const hydratedEntries = useMemo(() => {
//     const entries = tt?.data || [];

//     return entries.map((e) => {
//       const teacherId = getId(e.teacherId);
//       const subjectId = getId(e.subjectId);
//       const roomId = getId(e.roomId);

//       const teacher = teacherMap.get(String(teacherId));
//       const subject = subjectMap.get(String(subjectId));
//       const room = roomMap.get(String(roomId));

//       return {
//         ...e,
//         teacherId:
//           teacher ||
//           (typeof e.teacherId === "object" ? e.teacherId : { _id: teacherId, name: teacherId }),
//         subjectId:
//           subject ||
//           (typeof e.subjectId === "object" ? e.subjectId : { _id: subjectId, name: subjectId }),
//         roomId:
//           room ||
//           (typeof e.roomId === "object" ? e.roomId : { _id: roomId, name: roomId }),
//       };
//     });
//   }, [tt, teacherMap, subjectMap, roomMap]);

//   const hydratedTimetable = useMemo(() => {
//     if (!tt) return null;
//     return {
//       ...tt,
//       data: hydratedEntries,
//     };
//   }, [tt, hydratedEntries]);

//   const entryStats = useMemo(() => {
//     const entries = hydratedEntries || [];
//     return {
//       total: entries.length,
//       days: [...new Set(entries.map((e) => e.day).filter(Boolean))].length,
//       teachers: [
//         ...new Set(entries.map((e) => getId(e.teacherId)).filter(Boolean)),
//       ].length,
//       rooms: [...new Set(entries.map((e) => getId(e.roomId)).filter(Boolean))].length,
//     };
//   }, [hydratedEntries]);

//   const lookupMetaError = teachersQ.isError || subjectsQ.isError || roomsQ.isError;

//   return (
//     <div className="space-y-4">
//       <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//         <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight">Lookup Timetable</h1>
//             <p className="mt-1 text-sm text-slate-200">
//               Search, view, manage, and edit timetable entries for any department and semester.
//             </p>
//           </div>

//           <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
//             <div className="text-xs uppercase tracking-wide text-slate-200">
//               Current Filter
//             </div>
//             <div className="mt-1 font-medium text-white">
//               {department} • Sem {semester} • Sec {String(section).trim().toUpperCase() || "—"}
//             </div>
//           </div>
//         </div>
//       </div>

//       <Card className="overflow-hidden border-white/10">
//         <CardHeader className="border-b border-white/5 bg-zinc-950">
//           <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div>
//               <div className="text-lg font-semibold text-zinc-50">
//                 Timetable Search
//               </div>
//               <div className="mt-1 text-sm text-zinc-400">
//                 Enter timetable details below to fetch and manage records.
//               </div>
//             </div>

//             <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
//               Admin Access
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="p-5">
//           <form
//             onSubmit={onSearch}
//             className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
//           >
//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-zinc-300">
//                 Department
//               </label>
//               <Select
//                 value={department}
//                 onChange={(e) => setDepartment(e.target.value)}
//               >
//                 {DEPARTMENTS.map((dept) => (
//                   <option key={dept} value={dept}>
//                     {dept}
//                   </option>
//                 ))}
//               </Select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-zinc-300">
//                 Semester
//               </label>
//               <Select
//                 value={semester}
//                 onChange={(e) => setSemester(e.target.value)}
//               >
//                 {SEMESTERS.map((sem) => (
//                   <option key={sem} value={sem}>
//                     Semester {sem}
//                   </option>
//                 ))}
//               </Select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-zinc-300">
//                 Section
//               </label>
//               <Input
//                 value={section}
//                 onChange={(e) => setSection(e.target.value)}
//                 placeholder="Enter section"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-zinc-300">
//                 Academic Year
//               </label>
//               <Input
//                 value={academicYear}
//                 onChange={(e) => setAcademicYear(e.target.value)}
//                 placeholder="e.g. 2025-26"
//               />
//             </div>

//             <div className="md:col-span-2 xl:col-span-4">
//               <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
//                 <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//                   Search Summary
//                 </div>

//                 <div className="mt-2 flex flex-wrap gap-2">
//                   <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//                     Department: {department}
//                   </span>
//                   <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//                     Semester: {semester}
//                   </span>
//                   <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//                     Section: {String(section).trim().toUpperCase() || "—"}
//                   </span>
//                   <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//                     Academic Year: {academicYear || "—"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
//               <Button type="submit" disabled={q.isFetching}>
//                 {q.isFetching ? "Loading..." : "Get Timetable"}
//               </Button>

//               {hydratedTimetable ? (
//                 <Button
//                   variant="danger"
//                   type="button"
//                   onClick={() => del.mutate()}
//                   disabled={del.isPending}
//                 >
//                   {del.isPending ? "Deleting..." : "Delete Timetable"}
//                 </Button>
//               ) : null}
//             </div>

//             {q.isError ? (
//               <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                 {apiErrorMessage(q.error)}
//               </div>
//             ) : null}

//             {lookupMetaError ? (
//               <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                 {apiErrorMessage(teachersQ.error || subjectsQ.error || roomsQ.error)}
//               </div>
//             ) : null}
//           </form>
//         </CardContent>
//       </Card>

//       {hydratedTimetable ? (
//         <>
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
//             <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//               <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//                 Total Entries
//               </div>
//               <div className="mt-2 text-2xl font-bold text-zinc-50">
//                 {entryStats.total}
//               </div>
//             </div>

//             <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//               <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//                 Active Days
//               </div>
//               <div className="mt-2 text-2xl font-bold text-zinc-50">
//                 {entryStats.days}
//               </div>
//             </div>

//             <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//               <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//                 Teachers Involved
//               </div>
//               <div className="mt-2 text-2xl font-bold text-zinc-50">
//                 {entryStats.teachers}
//               </div>
//             </div>

//             <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//               <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//                 Rooms Used
//               </div>
//               <div className="mt-2 text-2xl font-bold text-zinc-50">
//                 {entryStats.rooms}
//               </div>
//             </div>
//           </div>

//           <Card className="overflow-hidden border-white/10">
//             <CardHeader className="border-b border-white/5 bg-zinc-950">
//               <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <div className="text-lg font-semibold text-zinc-50">
//                     Timetable Overview
//                   </div>
//                   <div className="mt-1 text-sm text-zinc-400">
//                     {hydratedTimetable.department} • Sem {hydratedTimetable.semester} • Sec {hydratedTimetable.section} • {hydratedTimetable.academicYear}
//                   </div>
//                 </div>

//                 <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
//                   Timetable Loaded
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="p-5">
//               <TimetableGrid
//                 title={`${hydratedTimetable.department} • Sem ${hydratedTimetable.semester} • Sec ${hydratedTimetable.section} • ${hydratedTimetable.academicYear}`}
//                 days={DAYS.slice(0, hydratedTimetable.days || 5)}
//                 periodsPerDay={hydratedTimetable.periodsPerDay || 8}
//                 breakSlots={hydratedTimetable.breakSlots || []}
//                 entries={hydratedTimetable.data || []}
//                 showMeta
//               />
//             </CardContent>
//           </Card>

//           <Card className="overflow-hidden border-white/10">
//             <CardHeader className="border-b border-white/5 bg-zinc-950">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-base font-semibold text-zinc-50">Entries</div>
//                   <div className="mt-1 text-sm text-zinc-400">
//                     Open any row to edit the selected timetable entry.
//                   </div>
//                 </div>

//                 <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
//                   {hydratedTimetable.data?.length || 0} Rows
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="p-5">
//               <div className="overflow-auto rounded-2xl border border-white/10 bg-zinc-900">
//                 <table className="min-w-full text-left text-sm">
//                   <thead className="bg-zinc-950 text-xs uppercase text-slate-600">
//                     <tr>
//                       <th className="px-4 py-3 font-semibold">Day</th>
//                       <th className="px-4 py-3 font-semibold">Slot</th>
//                       <th className="px-4 py-3 font-semibold">Subject</th>
//                       <th className="px-4 py-3 font-semibold">Teacher</th>
//                       <th className="px-4 py-3 font-semibold">Room</th>
//                       <th className="px-4 py-3 font-semibold">Action</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {hydratedTimetable.data?.length ? (
//                       hydratedTimetable.data.map((e) => (
//                         <tr
//                           key={e._id}
//                           className="border-t border-white/5 transition hover:bg-zinc-900/5"
//                         >
//                           <td className="px-4 py-3 font-medium text-zinc-300">
//                             {e.day}
//                           </td>

//                           <td className="px-4 py-3">
//                             <span className="inline-flex rounded-full bg-zinc-900/50 px-2.5 py-1 text-xs font-semibold text-zinc-300">
//                               P{e.slot}
//                             </span>
//                           </td>

//                           <td className="px-4 py-3 text-zinc-300">
//                             {e.subjectId?.name || e.subjectId?.code || getId(e.subjectId)}
//                           </td>

//                           <td className="px-4 py-3 text-zinc-300">
//                             {e.teacherId?.name || getId(e.teacherId)}
//                           </td>

//                           <td className="px-4 py-3 text-zinc-300">
//                             {e.roomId?.name || getId(e.roomId)}
//                           </td>

//                           <td className="px-4 py-3">
//                             <Link
//                               to={`/admin/edit-entry/${e._id}`}
//                               state={{ entry: e, timetableParams: params }}
//                               className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
//                             >
//                               Edit Entry
//                             </Link>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="px-4 py-8 text-center text-zinc-400" colSpan={6}>
//                           No entries found in this timetable.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       ) : (
//         <Card className="border-white/10">
//           <CardContent className="p-6 text-sm text-slate-600">
//             Search for a timetable to view its grid and edit individual entries.
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
import { useTimetableSocket } from "../../shared/hooks/useTimetableSocket.js";
import {
  getTimetable,
  deleteTimetable,
  listTeachers,
  listSubjects,
  listRooms,
  moveTimetableEntry,
} from "../../features/admin/adminApi.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEPARTMENTS = [
  "CSE",
  "IT",
  "CSAIML",
  "CSDS",
  "CSAI",
  "AIML",
  "AIDS",
  "ECE",
  "EEE",
  "ME",
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
}

export default function AdminTimetableLookupPage() {
  const { push } = useToast();
  const qc = useQueryClient();

  const [department, setDepartment] = useState(() => sessionStorage.getItem("lookup_dept") || "IT");
  const [semester, setSemester] = useState(() => sessionStorage.getItem("lookup_sem") || "3");
  const [section, setSection] = useState(() => sessionStorage.getItem("lookup_sec") || "A");
  const [academicYear, setAcademicYear] = useState(() => sessionStorage.getItem("lookup_year") || "2025-26");
  const [lookupResult, setLookupResult] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("lookup_dept", department);
    sessionStorage.setItem("lookup_sem", semester);
    sessionStorage.setItem("lookup_sec", section);
    sessionStorage.setItem("lookup_year", academicYear);
  }, [department, semester, section, academicYear]);

  // Listen for real-time schedule updates for currently viewed class
  useTimetableSocket(department, semester, async (action) => {
    if (action === "delete") {
      setLookupResult(null);
    } else {
      const result = await qc.refetchQueries({ queryKey: ["admin-timetable", params] });
      // Because `refetchQueries` doesn't directly return the data array the same way `useQuery().refetch()` does,
      // it's safer to just trigger `onSearch` logic or rely on the query getting cached, then we can read it.
      // But we can just use `q.refetch()` since `q` is already bound to the active params!
      const res = await q.refetch();
      if (res.isSuccess && res.data) {
        setLookupResult(res.data);
      }
    }
  }, { suppressToast: true });

  const params = useMemo(
    () => ({
      department: normalizeDept(department),
      semester: String(semester).trim(),
      section: String(section).trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
    }),
    [department, semester, section, academicYear]
  );

  const q = useQuery({
    queryKey: ["admin-timetable", params],
    enabled: false,
    queryFn: () => getTimetable(params),
    retry: false,
  });

  const del = useMutation({
    mutationFn: () => deleteTimetable(params),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Deleted",
        message: "Timetable soft-deleted successfully",
      });

      // clear local UI immediately
      setLookupResult(null);

      // clear cached query for this timetable
      qc.setQueryData(["admin-timetable", params], null);
      qc.removeQueries({ queryKey: ["admin-timetable", params] });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Delete failed",
        message: apiErrorMessage(e),
      }),
  });

  const moveMut = useMutation({
    mutationFn: (body) => moveTimetableEntry(body),
    onSuccess: async () => {
      push({
        variant: "success",
        title: "Success",
        message: "Timetable updated successfully",
      });
      // WebSockets will handle the real-time refresh automatically,
      // but we can manually refetch just in case:
      if (q.isSuccess) {
        setLookupResult((await q.refetch()).data);
      }
    },
    onError: (e) =>
      push({
        variant: "error",
        title: "Move Failed",
        message: apiErrorMessage(e),
      }),
  });

  const handleTimetableMove = (draggedEntryId, targetDay, targetSlot) => {
    if (!tt?._id) return;
    moveMut.mutate({
      timetableId: tt._id,
      draggedEntryId,
      targetDay,
      targetSlot,
    });
  };

  async function onSearch(e) {
    e.preventDefault();

    const result = await q.refetch();

    if (result.isSuccess && result.data) {
      setLookupResult(result.data);
    } else {
      setLookupResult(null);
    }
  }

  const tt = lookupResult || null;

  const teachersQ = useQuery({
    queryKey: ["admin-lookup-teachers", tt?.department],
    enabled: !!tt?.department,
    queryFn: () => listTeachers({ department: tt.department }),
  });

  const subjectsQ = useQuery({
    queryKey: ["admin-lookup-subjects", tt?.department, tt?.semester],
    enabled: !!tt?.department && !!tt?.semester,
    queryFn: () =>
      listSubjects({
        department: tt.department,
        semester: Number(tt.semester),
      }),
  });

  const roomsQ = useQuery({
    queryKey: ["admin-lookup-rooms", tt?.department],
    enabled: !!tt?.department,
    queryFn: () => listRooms({ department: tt.department }),
  });

  const teacherMap = useMemo(() => {
    const map = new Map();
    (teachersQ.data || []).forEach((t) => {
      map.set(String(t._id), t);
    });
    return map;
  }, [teachersQ.data]);

  const subjectMap = useMemo(() => {
    const map = new Map();
    (subjectsQ.data || []).forEach((s) => {
      map.set(String(s._id), s);
    });
    return map;
  }, [subjectsQ.data]);

  const roomMap = useMemo(() => {
    const map = new Map();
    (roomsQ.data || []).forEach((r) => {
      map.set(String(r._id), r);
    });
    return map;
  }, [roomsQ.data]);

  const hydratedEntries = useMemo(() => {
    const entries = tt?.data || [];

    return entries.map((e) => {
      const teacherId = getId(e.teacherId);
      const subjectId = getId(e.subjectId);
      const roomId = getId(e.roomId);

      const teacher = teacherMap.get(String(teacherId));
      const subject = subjectMap.get(String(subjectId));
      const room = roomMap.get(String(roomId));

      return {
        ...e,
        teacherId:
          teacher ||
          (typeof e.teacherId === "object"
            ? e.teacherId
            : { _id: teacherId, name: teacherId }),
        subjectId:
          subject ||
          (typeof e.subjectId === "object"
            ? e.subjectId
            : { _id: subjectId, name: subjectId }),
        roomId:
          room ||
          (typeof e.roomId === "object"
            ? e.roomId
            : { _id: roomId, name: roomId }),
      };
    });
  }, [tt, teacherMap, subjectMap, roomMap]);

  const hydratedTimetable = useMemo(() => {
    if (!tt) return null;
    return {
      ...tt,
      data: hydratedEntries,
    };
  }, [tt, hydratedEntries]);

  const entryStats = useMemo(() => {
    const entries = hydratedEntries || [];
    return {
      total: entries.length,
      days: [...new Set(entries.map((e) => e.day).filter(Boolean))].length,
      teachers: [
        ...new Set(entries.map((e) => getId(e.teacherId)).filter(Boolean)),
      ].length,
      rooms: [...new Set(entries.map((e) => getId(e.roomId)).filter(Boolean))].length,
    };
  }, [hydratedEntries]);

  const lookupMetaError = teachersQ.isError || subjectsQ.isError || roomsQ.isError;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lookup Timetable</h1>
            <p className="mt-1 text-sm text-slate-200">
              Search, view, manage, and edit timetable entries for any department and semester.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Current Filter
            </div>
            <div className="mt-1 font-medium text-white">
              {department} • Sem {semester} • Sec {String(section).trim().toUpperCase() || "—"}
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-white/10">
        <CardHeader className="border-b border-white/5 bg-zinc-950">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-zinc-50">
                Timetable Search
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                Enter timetable details below to fetch and manage records.
              </div>
            </div>

            <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
              Admin Access
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form
            onSubmit={onSearch}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Department
              </label>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Semester
              </label>
              <Select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Section
              </label>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter section"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Academic Year
              </label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025-26"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit" disabled={q.isFetching}>
                {q.isFetching ? "Loading..." : "Get Timetable"}
              </Button>

              {hydratedTimetable ? (
                <Button
                  variant="danger"
                  type="button"
                  onClick={() => del.mutate()}
                  disabled={del.isPending}
                >
                  {del.isPending ? "Deleting..." : "Delete Timetable"}
                </Button>
              ) : null}
            </div>

            {q.isError && (
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(q.error)}
              </div>
            )}

            {lookupMetaError && (
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(teachersQ.error || subjectsQ.error || roomsQ.error)}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {hydratedTimetable ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Total Entries
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {entryStats.total}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Active Days
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {entryStats.days}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Teachers Involved
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {entryStats.teachers}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Rooms Used
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {entryStats.rooms}
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-white/10">
            <CardHeader className="border-b border-white/5 bg-zinc-950">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-zinc-50">
                    Timetable Overview
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    {hydratedTimetable.department} • Sem {hydratedTimetable.semester} • Sec {hydratedTimetable.section} • {hydratedTimetable.academicYear}
                  </div>
                </div>

                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Timetable Loaded
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <TimetableGrid
                title={`${hydratedTimetable.department} • Sem ${hydratedTimetable.semester} • Sec ${hydratedTimetable.section} • ${hydratedTimetable.academicYear}`}
                days={DAYS.slice(0, hydratedTimetable.days || 5)}
                periodsPerDay={hydratedTimetable.periodsPerDay || 8}
                breakSlots={hydratedTimetable.breakSlots || []}
                entries={hydratedTimetable.data || []}
                showMeta
                isEditable={true}
                onMove={handleTimetableMove}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/10">
            <CardHeader className="border-b border-white/5 bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-zinc-50">Entries</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Open any row to edit the selected timetable entry.
                  </div>
                </div>

                <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
                  {hydratedTimetable.data?.length || 0} Rows
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="overflow-auto rounded-2xl border border-white/10 bg-zinc-900">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-950 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Day</th>
                      <th className="px-4 py-3 font-semibold">Slot</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Teacher</th>
                      <th className="px-4 py-3 font-semibold">Room</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {hydratedTimetable.data?.length ? (
                      hydratedTimetable.data.map((e) => (
                        <tr
                          key={e._id}
                          className="border-t border-white/5 transition hover:bg-zinc-900/5"
                        >
                          <td className="px-4 py-3 font-medium text-zinc-300">
                            {e.day}
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-zinc-900/50 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                              P{e.slot}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-zinc-300">
                            {e.subjectId?.name || e.subjectId?.code || getId(e.subjectId)}
                          </td>

                          <td className="px-4 py-3 text-zinc-300">
                            {e.teacherId?.name || getId(e.teacherId)}
                          </td>

                          <td className="px-4 py-3 text-zinc-300">
                            {e.roomId?.name || getId(e.roomId)}
                          </td>

                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/edit-entry/${e._id}`}
                              state={{ entry: e, timetableParams: params }}
                              className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                            >
                              Edit Entry
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-8 text-center text-zinc-400" colSpan={6}>
                          No entries found in this timetable.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-white/10">
          <CardContent className="p-6 text-sm text-slate-600">
            Search for a timetable to view its grid and edit individual entries.
          </CardContent>
        </Card>
      )}
    </div>
  );
}