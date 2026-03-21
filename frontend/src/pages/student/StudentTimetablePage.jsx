// import React, { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
// import Input from "../../shared/ui/Input.jsx";
// import Button from "../../shared/ui/Button.jsx";
// import Select from "../../shared/ui/Select.jsx";
// import { http, apiErrorMessage } from "../../shared/api/http.js";
// import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";

// const DEPARTMENTS = ["IT", "CSE", "ECE", "ME", "CE"];
// const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// function normalizeDept(v) {
//   return (v || "").trim().toUpperCase();
// }

// export default function StudentTimetablePage() {
//   const [department, setDepartment] = useState("IT");
//   const [semester, setSemester] = useState("3");
//   const [section, setSection] = useState("A");
//   const [academicYear, setAcademicYear] = useState("2025-26");

//   const params = useMemo(
//     () => ({
//       department: normalizeDept(department),
//       semester: String(semester).trim(),
//       section: String(section).trim().toUpperCase(),
//       academicYear: String(academicYear).trim()
//     }),
//     [department, semester, section, academicYear]
//   );

//   const canFetch = !!(params.department && params.semester && params.section && params.academicYear);

//   const q = useQuery({
//     queryKey: ["student-timetable", params],
//     enabled: false,
//     queryFn: async () => {
//       const resp = await http.get("/api/timetable/student", { params });
//       return resp.data?.data;
//     }
//   });

//   const timetable = q.data;

//   async function onSearch(e) {
//     e.preventDefault();
//     if (!canFetch) return;
//     await q.refetch();
//   }

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <div className="text-lg font-semibold">Student Timetable</div>
//           <div className="text-sm text-slate-600">
//             Public endpoint: <span className="font-mono">GET /api/timetable/student</span>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={onSearch} className="grid grid-cols-1 gap-3 md:grid-cols-4">
//             <div>
//               <label className="text-sm font-medium">Department</label>
//               <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
//                 {DEPARTMENTS.map((d) => (
//                   <option key={d} value={d}>{d}</option>
//                 ))}
//               </Select>
//               <div className="text-xs text-zinc-400 mt-1">Backend stores uppercase</div>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Semester</label>
//               <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 3" />
//             </div>

//             <div>
//               <label className="text-sm font-medium">Section</label>
//               <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" />
//             </div>

//             <div>
//               <label className="text-sm font-medium">Academic Year</label>
//               <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025-26" />
//             </div>

//             <div className="md:col-span-4 flex items-center gap-2">
//               <Button type="submit" disabled={q.isFetching}>
//                 {q.isFetching ? "Loading..." : "Get Timetable"}
//               </Button>

//               {q.isError ? (
//                 <div className="text-sm text-red-600">{apiErrorMessage(q.error)}</div>
//               ) : null}
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       {timetable ? (
//         <TimetableGrid
//           title={`${timetable.department} • Sem ${timetable.semester} • Sec ${timetable.section} • ${timetable.academicYear}`}
//           days={DAYS.slice(0, timetable.days || 5)}
//           periodsPerDay={timetable.periodsPerDay || 8}
//           breakSlots={timetable.breakSlots || []}
//           entries={timetable.data || []}
//           showMeta
//         />
//       ) : (
//         <Card>
//           <CardContent className="text-sm text-slate-600">
//             Search to view timetable. If you get “Timetable not found”, ask admin to generate first.
//           </CardContent>
//         </Card>
//       )}

//       {timetable?.conflicts?.length ? (
//         <Card>
//           <CardHeader>
//             <div className="text-base font-semibold">Conflicts</div>
//           </CardHeader>
//           <CardContent>
//             <ul className="list-disc pl-5 text-sm text-zinc-300">
//               {timetable.conflicts.map((c, idx) => (
//                 <li key={idx}>{c}</li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       ) : null}
//     </div>
//   );
// }

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import { http, apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
import { useTimetableSocket } from "../../shared/hooks/useTimetableSocket.js";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

export default function StudentTimetablePage() {
  const [department, setDepartment] = useState("IT");
  const [semester, setSemester] = useState("3");
  const [section, setSection] = useState("A");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [lookupResult, setLookupResult] = useState(null);

  // Listen for real-time schedule updates for currently viewed class
  useTimetableSocket(department, semester, async (action) => {
    if (action === "delete") {
      setLookupResult(null);
    } else {
      const res = await q.refetch();
      if (res.isSuccess && res.data) {
        setLookupResult(res.data);
      }
    }
  });

  const params = useMemo(
    () => ({
      department: normalizeDept(department),
      semester: String(semester).trim(),
      section: String(section).trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
    }),
    [department, semester, section, academicYear]
  );

  const canFetch = !!(
    params.department &&
    params.semester &&
    params.section &&
    params.academicYear
  );

  const q = useQuery({
    queryKey: ["student-timetable", params],
    enabled: false,
    queryFn: async () => {
      const resp = await http.get("/api/timetable/student", { params });
      return resp.data?.data;
    },
    retry: false,
  });

  const timetable = lookupResult || null;

  async function onSearch(e) {
    e.preventDefault();
    if (!canFetch) return;
    
    // Explicitly clear pending data until new fetch is done
    setLookupResult(null);
    
    const result = await q.refetch();
    if (result.isSuccess && result.data) {
      setLookupResult(result.data);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Timetable</h1>
            <p className="mt-1 text-sm text-slate-200">
              Search your class timetable by department, semester, section, and academic year.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Current Selection
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
                Fill in your academic details and fetch the generated timetable.
              </div>
            </div>

            <div className="inline-flex rounded-full bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300">
              Student View
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
                onChange={(e) => setSemester(e.target.value)}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={String(s)}>
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
                placeholder="e.g. A"
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
                  Search Summary
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

            <div className="md:col-span-2 xl:col-span-4 flex items-center gap-2">
              <Button type="submit" disabled={q.isFetching}>
                {q.isFetching ? "Loading..." : "Get Timetable"}
              </Button>
            </div>

            {q.isError ? (
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(q.error)}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {timetable ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Department
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {timetable.department}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Semester
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {timetable.semester}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Section
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {timetable.section}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Academic Year
              </div>
              <div className="mt-2 text-2xl font-bold text-zinc-50">
                {timetable.academicYear}
              </div>
            </div>
          </div>

          <TimetableGrid
            title={`${timetable.department} • Sem ${timetable.semester} • Sec ${timetable.section} • ${timetable.academicYear}`}
            days={DAYS.slice(0, timetable.days || 5)}
            periodsPerDay={timetable.periodsPerDay || 8}
            breakSlots={timetable.breakSlots || []}
            entries={timetable.data || []}
            showMeta
          />
        </>
      ) : (
        <Card className="border-white/10">
          <CardContent className="p-6 text-sm text-slate-600">
            Search to view your timetable. If it is not available yet, ask the admin to generate it first.
          </CardContent>
        </Card>
      )}

      {timetable?.conflicts?.length ? (
        <Card className="overflow-hidden border-white/10">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-zinc-50">
                Conflicts
              </div>
              <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {timetable.conflicts.length} Issue
                {timetable.conflicts.length === 1 ? "" : "s"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <ul className="space-y-2">
              {timetable.conflicts.map((c, idx) => (
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
      ) : null}
    </div>
  );
}