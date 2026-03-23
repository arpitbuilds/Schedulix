// import React, { useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
// import Input from "../../shared/ui/Input.jsx";
// import Button from "../../shared/ui/Button.jsx";
// import Select from "../../shared/ui/Select.jsx";
// import { apiErrorMessage } from "../../shared/api/http.js";
// import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
// import {
//   generateTimetable,
//   getTimetable,
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

// export default function AdminGenerateTimetablePage() {
//   const { push } = useToast();

//   const [department, setDepartment] = useState("IT");
//   const [semester, setSemester] = useState(3);
//   const [section, setSection] = useState("A");
//   const [academicYear, setAcademicYear] = useState("2025-26");
//   const [generatedTimetable, setGeneratedTimetable] = useState(null);

//   const params = useMemo(
//     () => ({
//       department: normalizeDept(department),
//       semester: Number(semester),
//       section: String(section).trim().toUpperCase(),
//       academicYear: String(academicYear).trim(),
//       days: 5,
//       periodsPerDay: 8,
//       breakSlots: [4],
//     }),
//     [department, semester, section, academicYear]
//   );

//   const lookup = useQuery({
//     queryKey: ["admin-generate-lookup", params],
//     enabled: false,
//     queryFn: () => getTimetable(params),
//   });

//   const gen = useMutation({
//     mutationFn: () => generateTimetable(params),

//     onSuccess: (data) => {
//       setGeneratedTimetable(data);

//       push({
//         variant: "success",
//         title: "Generated",
//         message: "Timetable generated successfully",
//       });

//       // optional background refresh
//       lookup.refetch();
//     },

//     onError: (e) => {
//       setGeneratedTimetable(null);
//       push({
//         variant: "error",
//         title: "Generation failed",
//         message: apiErrorMessage(e),
//       });
//     },
//   });

//   function onGenerate(e) {
//     e.preventDefault();
//     gen.mutate();
//   }

//   async function onLoadExisting() {
//     const result = await lookup.refetch();
//     if (result.data) {
//       setGeneratedTimetable(result.data);
//     }
//   }

//   const tt = generatedTimetable || lookup.data || null;

//   return (
//     <div className="space-y-4">
//       <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//         <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight">Generate Timetable</h1>
//             <p className="mt-1 text-sm text-slate-200">
//               Create a timetable for the selected department, semester, section, and academic year.
//             </p>
//           </div>

//           <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
//             <div className="text-xs uppercase tracking-wide text-slate-200">
//               Current Selection
//             </div>
//             <div className="mt-1 font-medium text-white">
//               {department} • Sem {semester} • Sec {section || "—"}
//             </div>
//           </div>
//         </div>
//       </div>

//       <Card className="overflow-hidden border-white/10">
//         <CardHeader className="border-b border-white/5 bg-zinc-950">
//           <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div>
//               <div className="text-lg font-semibold text-zinc-50">
//                 Timetable Generator
//               </div>
//               <div className="mt-1 text-sm text-zinc-400">
//                 Fill in the details below and generate or load an existing timetable.
//               </div>
//             </div>

//             <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
//               Solver Ready
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="p-5">
//           <form
//             onSubmit={onGenerate}
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
//                 {DEPARTMENTS.map((d) => (
//                   <option key={d} value={d}>
//                     {d}
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
//                 onChange={(e) => setSemester(Number(e.target.value))}
//               >
//                 {SEMESTERS.map((s) => (
//                   <option key={s} value={s}>
//                     Semester {s}
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
//                   Generation Summary
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

//                 <div className="mt-3 text-xs text-zinc-400">
//                   Backend generation requires <b>teachers + subjects + rooms</b> for the
//                   selected department and semester.
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
//               <Button type="submit" disabled={gen.isPending}>
//                 {gen.isPending ? "Generating..." : "Generate Timetable"}
//               </Button>

//               <Button
//                 variant="secondary"
//                 type="button"
//                 onClick={onLoadExisting}
//                 disabled={lookup.isFetching}
//               >
//                 {lookup.isFetching ? "Loading..." : "Load Existing"}
//               </Button>
//             </div>

//             {gen.isError && (
//               <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                 {apiErrorMessage(gen.error)}
//               </div>
//             )}

//             {lookup.isError && (
//               <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                 {apiErrorMessage(lookup.error)}
//               </div>
//             )}
//           </form>
//         </CardContent>
//       </Card>

//       {tt && (
//         <Card className="overflow-hidden border-white/10">
//           <CardHeader className="border-b border-white/5 bg-zinc-950">
//             <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <div className="text-lg font-semibold text-zinc-50">
//                   Generated Timetable
//                 </div>
//                 <div className="mt-1 text-sm text-zinc-400">
//                   {tt.department} • Sem {tt.semester} • Sec {tt.section} • {tt.academicYear}
//                 </div>
//               </div>

//               <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
//                 Loaded Successfully
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-5">
//             <TimetableGrid
//               title={`${tt.department} • Sem ${tt.semester} • Sec ${tt.section} • ${tt.academicYear}`}
//               days={DAYS.slice(0, tt.days || 5)}
//               periodsPerDay={tt.periodsPerDay || 8}
//               breakSlots={tt.breakSlots || []}
//               entries={tt.data || []}
//               showMeta
//             />
//           </CardContent>
//         </Card>
//       )}

//       {tt?.conflicts?.length > 0 && (
//         <Card className="overflow-hidden border-white/10">
//           <CardHeader className="border-b border-white/5 bg-zinc-950">
//             <div className="flex items-center justify-between">
//               <div className="text-base font-semibold text-zinc-50">
//                 Conflicts
//               </div>
//               <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
//                 {tt.conflicts.length} Issue{tt.conflicts.length === 1 ? "" : "s"}
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-5">
//             <ul className="space-y-2">
//               {tt.conflicts.map((c, idx) => (
//                 <li
//                   key={idx}
//                   className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
//                 >
//                   {c}
//                 </li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
import {
  generateTimetable,
  getTimetable,
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

export default function AdminGenerateTimetablePage() {
  const { push } = useToast();

  const [department, setDepartment] = useState(() => sessionStorage.getItem("gen_dept") || "IT");
  const [semester, setSemester] = useState(() => Number(sessionStorage.getItem("gen_sem")) || 3);
  const [section, setSection] = useState(() => sessionStorage.getItem("gen_sec") || "A");
  const [academicYear, setAcademicYear] = useState(() => sessionStorage.getItem("gen_year") || "2025-26");
  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("gen_dept", department);
    sessionStorage.setItem("gen_sem", String(semester));
    sessionStorage.setItem("gen_sec", section);
    sessionStorage.setItem("gen_year", academicYear);
  }, [department, semester, section, academicYear]);

  const params = useMemo(
    () => ({
      department: normalizeDept(department),
      semester: Number(semester),
      section: String(section).trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
      days: 5,
      periodsPerDay: 8,
      breakSlots: [4],
    }),
    [department, semester, section, academicYear]
  );

  const lookup = useQuery({
    queryKey: ["admin-generate-lookup", params],
    enabled: false,
    queryFn: () => getTimetable(params),
  });

  const gen = useMutation({
    mutationFn: () => generateTimetable(params),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Generated",
        message: "Timetable generated successfully",
      });

      const result = await lookup.refetch();
      if (result.data) {
        setGeneratedTimetable(result.data);
      }
    },

    onError: (e) => {
      setGeneratedTimetable(null);
      push({
        variant: "error",
        title: "Generation failed",
        message: apiErrorMessage(e),
      });
    },
  });

  function onGenerate(e) {
    e.preventDefault();
    gen.mutate();
  }

  async function onLoadExisting() {
    const result = await lookup.refetch();
    if (result.data) {
      setGeneratedTimetable(result.data);
    }
  }

  const tt = generatedTimetable || lookup.data || null;

  const moveMut = useMutation({
    mutationFn: (body) => moveTimetableEntry(body),
    onSuccess: async () => {
      push({
        variant: "success",
        title: "Success",
        message: "Timetable updated successfully",
      });
      // Refresh the view
      onLoadExisting();
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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Generate Timetable</h1>
            <p className="mt-1 text-sm text-slate-200">
              Create a timetable for the selected department, semester, section, and academic year.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Current Selection
            </div>
            <div className="mt-1 font-medium text-white">
              {department} • Sem {semester} • Sec {section || "—"}
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-white/10">
        <CardHeader className="border-b border-white/5 bg-zinc-950">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-zinc-50">
                Timetable Generator
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                Fill in the details below and generate or load an existing timetable.
              </div>
            </div>

            <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
              Solver Ready
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form
            onSubmit={onGenerate}
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
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
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
                onChange={(e) => setSemester(Number(e.target.value))}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
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

            <div className="md:col-span-2 xl:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Generation Summary
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    Department: {department}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    Semester: {semester}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    Section: {String(section).trim().toUpperCase() || "—"}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    Academic Year: {academicYear || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit" disabled={gen.isPending || lookup.isFetching}>
                {gen.isPending ? "Generating..." : "Generate Timetable"}
              </Button>

              <Button
                variant="secondary"
                type="button"
                onClick={onLoadExisting}
                disabled={gen.isPending || lookup.isFetching}
              >
                {lookup.isFetching && !gen.isPending ? "Loading..." : "Load Existing"}
              </Button>
            </div>

            {gen.isError && (
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(gen.error)}
              </div>
            )}

            {lookup.isError && (
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(lookup.error)}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {tt && (
        <Card className="overflow-hidden border-white/10">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-zinc-50">
                  Generated Timetable
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  {tt.department} • Sem {tt.semester} • Sec {tt.section} • {tt.academicYear}
                </div>
              </div>

              <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Loaded Successfully
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <TimetableGrid
              title={`${tt.department} • Sem ${tt.semester} • Sec ${tt.section} • ${tt.academicYear}`}
              days={DAYS.slice(0, tt.days || 5)}
              periodsPerDay={tt.periodsPerDay || 8}
              breakSlots={tt.breakSlots || []}
              entries={tt.data || []}
              showMeta
              isEditable={true}
              onMove={handleTimetableMove}
            />
          </CardContent>
        </Card>
      )}

      {tt?.conflicts?.length > 0 && (
        <Card className="overflow-hidden border-white/10">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-zinc-50">
                Conflicts
              </div>
              <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {tt.conflicts.length} Issue{tt.conflicts.length === 1 ? "" : "s"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <ul className="space-y-2">
              {tt.conflicts.map((c, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}