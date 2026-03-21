// import React from "react";
// import { NavLink, Route, Routes } from "react-router-dom";
// import AdminTeachersPage from "./AdminTeachersPage.jsx";
// import AdminSubjectsPage from "./AdminSubjectsPage.jsx";
// import AdminRoomsPage from "./AdminRoomsPage.jsx";
// import AdminConstraintsPage from "./AdminConstraintsPage.jsx";
// import AdminGenerateTimetablePage from "./AdminGenerateTimetablePage.jsx";
// import AdminEditEntryPage from "./AdminEditEntryPage.jsx";
// import AdminTimetableLookupPage from "./AdminTimetableLookupPage.jsx";

// function Tab({ to, label }) {
//   return (
//     <NavLink
//       to={to}
//       end
//       className={({ isActive }) =>
//         [
//           "rounded-xl px-3 py-2 text-sm transition",
//           isActive ? "bg-indigo-600 text-white" : "text-zinc-300 hover:bg-zinc-900/5"
//         ].join(" ")
//       }
//     >
//       {label}
//     </NavLink>
//   );
// }

// export default function AdminDashboard() {
//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center gap-2">
//         <Tab to="" label="Lookup Timetable" />
//         <Tab to="generate" label="Generate" />
//         <Tab to="teachers" label="Teachers" />
//         <Tab to="subjects" label="Subjects" />
//         <Tab to="rooms" label="Rooms" />
//         <Tab to="constraints" label="Constraints" />
//       </div>

//       <Routes>
//         <Route index element={<AdminTimetableLookupPage />} />
//         <Route path="generate" element={<AdminGenerateTimetablePage />} />
//         <Route path="teachers" element={<AdminTeachersPage />} />
//         <Route path="subjects" element={<AdminSubjectsPage />} />
//         <Route path="rooms" element={<AdminRoomsPage />} />
//         <Route path="constraints" element={<AdminConstraintsPage />} />
//         <Route path="edit-entry/:entryId" element={<AdminEditEntryPage />} />
//       </Routes>
//     </div>
//   );
// }

import React from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import AdminTeachersPage from "./AdminTeachersPage.jsx";
import AdminSubjectsPage from "./AdminSubjectsPage.jsx";
import AdminRoomsPage from "./AdminRoomsPage.jsx";
import AdminConstraintsPage from "./AdminConstraintsPage.jsx";
import AdminGenerateTimetablePage from "./AdminGenerateTimetablePage.jsx";
import AdminEditEntryPage from "./AdminEditEntryPage.jsx";
import AdminTimetableLookupPage from "./AdminTimetableLookupPage.jsx";

const NAV_ITEMS = [
  {
    to: "",
    label: "Lookup Timetable",
    description: "Search and view generated timetables",
  },
  {
    to: "generate",
    label: "Generate",
    description: "Create timetable using solver",
  },
  {
    to: "teachers",
    label: "Teachers",
    description: "Manage faculty and assignments",
  },
  {
    to: "subjects",
    label: "Subjects",
    description: "Add and organize subjects",
  },
  {
    to: "rooms",
    label: "Rooms",
    description: "Manage classrooms and labs",
  },
  {
    to: "constraints",
    label: "Constraints",
    description: "Set timetable rules and limits",
  },
];

function Tab({ to, label, description }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "group min-w-[160px] rounded-2xl border px-4 py-3 text-left transition-all duration-200",
          isActive
            ? "border-slate-900 bg-indigo-600 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
            : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/20 hover:bg-zinc-900/5",
        ].join(" ")
      }
    >
      <div className="text-sm font-semibold">{label}</div>
      <div
        className={[
          "mt-1 text-xs",
          "group-[.active]:text-slate-200",
          "text-zinc-400",
        ].join(" ")}
      >
        {description}
      </div>
    </NavLink>
  );
}

function DashboardHeader() {
  const location = useLocation();

  const activeItem =
    NAV_ITEMS.find((item) => {
      if (item.to === "") return location.pathname.endsWith("/admin") || location.pathname.endsWith("/admin/");
      return location.pathname.includes(`/admin/${item.to}`);
    }) || NAV_ITEMS[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-zinc-900/10 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100">
            ADMIN PANEL
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Timetable Management Dashboard
          </h1>
        </div>

        <div className="rounded-2xl bg-zinc-900/10 px-4 py-3 backdrop-blur-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-200">
            Active Module
          </div>
          <div className="mt-1 text-lg font-semibold">{activeItem.label}</div>
          <div className="text-sm text-slate-200">{activeItem.description}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      <DashboardHeader />

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">Navigation</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.to || "index"}
              to={item.to}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] md:p-5">
        <Routes>
          <Route index element={<AdminTimetableLookupPage />} />
          <Route path="generate" element={<AdminGenerateTimetablePage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="constraints" element={<AdminConstraintsPage />} />
          <Route path="edit-entry/:entryId" element={<AdminEditEntryPage />} />
        </Routes>
      </div>
    </div>
  );
}